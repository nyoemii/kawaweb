# -*- coding: utf-8 -*-

__all__ = ()

import datetime
import hashlib
from operator import is_
from typing import Literal
import bcrypt

import timeago
from quart import Blueprint, jsonify, request, render_template, session
from discord_webhook import DiscordWebhook, DiscordEmbed


from constants import regexes
from objects import glob
from objects.utils import flash, get_safe_name
from objects.privileges import Privileges, ComparePrivs, GetPriv

admin = Blueprint('admin', __name__)

class Action:
    @staticmethod
    def genID():
            time         = str(int(datetime.datetime.now().timestamp()))
            actionmd5    = hashlib.md5(time.encode()).hexdigest().encode()
            actionbcrypt = bcrypt.hashpw(actionmd5, bcrypt.gensalt())
            return actionbcrypt[29:].decode('utf-8')
    
    def __init__(self, action, reason = None, id = None, duration = None):
        self.id = Action.genID()
        self.targetid = id
        self.action = action

        if reason is None:
                self.reason = "No reason specified."

        if action == "wipe":
            self.text = "Wiped"
            self.type = 0

        elif action == "restrict":
            self.text = "Restricted"
            self.type = 0

        elif action == "unrestrict":
            self.text = "Unrestricted"
            self.type = 0

        elif action == "silence":
            self.text = "Silenced"
            self.type = 0
            self.duration = duration

        elif action == "unsilence":
            self.text = "Unsilenced"
            self.type = 0

        elif action == "changepassword":
            self.type = 0
            # we don't post this to discord, for obvious reasons, so no text.
            self.type = 0

        elif action == "changeprivileges":
            self.text = "Modified"
            self.type = 0
                
        elif action == "rank":
            self.text = "Ranked"
            self.type = 1

        elif action == "unrank":
            self.text = "Unranked"
            self.type = 1

        elif action == "love":
            self.text = "Loved"
            self.type = 1

        elif action == "unlove":
            self.text = "Unloved"
            self.type = 1
            
        else:
            raise ValueError(f"Invalid action {action}.")
        
    @classmethod
    async def create(cls, action, reason=None, id=None, duration=None):
        instance = cls(action, reason, id, duration)

        await instance.initialize()

        return instance
        
    async def initialize(self):
        self.mod = User(session["user_data"]["id"])
        await self.mod.fetchUser()


        if self.action in ["wipe", "restrict", "unrestrict", "silence", "unsilence", "changepassword", "changeprivileges"]:
            self.user = User(self.targetid)
            await self.user.fetchUser()
        elif self.action in ["rank", "unrank", "love", "unlove"]:
            self.map = Map(self.targetid)
            await self.map.fetchMap()

class Map:
    def __init__(self, id):
        self.id = id
        
    
    async def fetchMap(self):
        data = await glob.db.fetch(f"SELECT * FROM maps WHERE id = {self.id}")

        if data is None:
            raise ValueError(f"Map {self.id} does not exist.")
        
        self.set_id = data["set_id"]
        self.status = data["status"]
        self.md5 = data["md5"]
        self.artist = data["artist"]
        self.title = data["title"]
        self.version = data["version"]
        self.creator = data["creator"]
        self.last_update = data["last_update"]
        self.total_length = data["total_length"]
        self.max_combo = data["max_combo"]
        self.frozen = data["frozen"]
        self.plays = data["plays"]
        self.passes = data["passes"]
        self.mode = data["mode"]
        self.bpm = data["bpm"]
        self.cs = data["cs"]
        self.ar = data["ar"]
        self.od = data["od"]
        self.hp = data["hp"]
        self.diff = data["diff"]

class User:
    def __init__(self, id):
        self.id = id
        

    async def fetchUser(self):
        data = await glob.db.fetch(f"SELECT * FROM users WHERE id = {self.id}")
        if data is None:
            raise ValueError(f"User {self.id} does not exist.")

        self.name = data['name']
        self.safe_name = data['safe_name']
        self.email = data['email']
        self.priv = data['priv']
        self.country = data['country']
        self.silence_end = data['silence_end']
        self.donor_end = data['donor_end']
        self.creation_time = data['creation_time']
        self.latest_activity = data['latest_activity']
        self.clan_id = data['clan_id']
        self.clan_priv = data['clan_priv']
        self.preferred_mode = data['preferred_mode']
        self.play_style = data['play_style']
        self.custom_badge_name = data['custom_badge_name']
        self.custom_badge_icon = data['custom_badge_icon']
        self.userpage_content = data['userpage_content']
    

@admin.route("/action/<a>", methods=["POST"])
async def action(a: Literal["wipe", "restrict", "unrestrict", "silence", "unsilence", "changepassword", "changeprivileges", "rank", "unrank", "love", "unlove", "addbadge", "removebadge", "removescore"]):
    """
    The action endpoint is used to perform actions on users and maps.
    it is used by the admin panel, and can be called individually by other users.
    this endpoint requires authentication.
    permissions are handled on a per-action basis, so you may be able to perform some actions, but not others.

    :param a: the action to perform.
    :type a: Literal["wipe", "restrict", "unrestrict", "silence", "unsilence", "changepassword", "changeprivileges", "rank", "unrank", "love", "unlove", "addbadge", "removebadge", "removescore"]
    
    :returns: a json response containing the status of the request.
    :rtype: struct

    the json response will always contain the following fields:
    - status: the status of the request. either "success" or "error".
    - message: the message of the request. if the status is "error", this will contain the error message.
    
    no other fields are guaranteed to be present. extra details may be provided depending on the action, the request, and the response.

    the endpoint takes in form data, and will always require the following fields:
    - user: the id of the user to perform the action on. 
    OR
    - map: the id of the map to perform the action on.

    note: some actions may require additional fields. these are specified below.
    - silence: 'duration' the duration of the silence in hours.
    - changepassword: 'password' the new password of the user.
    - changeprivileges: 'privs' the new privileges of the user.
    - editaccount: 'username', 'email', 'country', 'userpage_content'. please specify all of these, despite if they are being changed or not.
    - addbadge: 'badge' the id of the badge to add.
    - removebadge: 'badge' the id of the badge to remove.
    - removescore: 'score' the id of the score to remove.

    'reason' is always optional, and will default to "No reason specified." if not provided.
    """
    if not "authenticated" in session:
        return jsonify({"status": "error", "message": "Please login first."}), 401

    if not request.content_type == "application/x-www-form-urlencoded":
        return jsonify({"status": "error","message": "Invalid content type. use application/x-www-form-urlencoded."}), 400

    if a == "wipe":
        form = await request.form
        if not form:
            return jsonify(
                {
                    "status": "error",
                    "message": "No form data provided."
                }
            ), 400

        if form.get("user") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No user specified."
                }
            ), 400
        
        try:
            action = await Action.create(a, form.get("reason"), form.get("user"))
        
        except ValueError as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400
        
        try:
            if Privileges.WipeUsers not in GetPriv(action.mod.priv):
                return jsonify(
                    {
                        "status": "error",
                        "message": "You do not have permission to wipe users."
                    }
                ), 403


            modes = [0,1,2,3,4,5,6,7,8]
            await glob.db.execute(
                f"""
                INSERT INTO wiped_scores (id, map_md5, score, pp, acc, max_combo, mods, n300, n100, n50, nmiss, ngeki, nkatu, grade, status, mode, play_time, time_elapsed, client_flags, userid, perfect, online_checksum, r_replay_id)
                SELECT id, map_md5, score, pp, acc, max_combo, mods, n300, n100, n50, nmiss, ngeki, nkatu, grade, status, mode, play_time, time_elapsed, client_flags, userid, perfect, online_checksum, r_replay_id
                FROM scores
                WHERE userid = {action.user.id};
                """
            )
            # Delete scores from scores table
            await glob.db.execute(
                f"""
                DELETE FROM scores
                WHERE userid = {action.user.id};
                """
            )
            # Reset Players Stats
            for mode in modes:
                query = f"""
                UPDATE stats
                SET tscore = 0, rscore = 0, pp = 0, plays = 0, playtime = 0, acc = 0.000, max_combo = 0, total_hits = 0, replay_views = 0, xh_count = 0, x_count = 0, sh_count = 0, s_count = 0, a_count = 0
                WHERE id = {action.user.id} AND mode = '{mode}';
                """

                await glob.db.execute(query)
                
                await glob.redis.zrem(
                    f"bancho:leaderboard:{mode}",
                    action.user.id,
                )

                await glob.redis.zrem(
                    f'bancho:leaderboard:{mode}:{action.user.country}',
                    action.user.id,
            )

            await log(action)

            return jsonify(
            {
                "status": "success",
                "message": f"Successfully wiped {action.user.name} ({action.user.id})."
            }
        ), 200

        except Exception as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400
    
    if a == "restrict":
        form = await request.form
        if not form:
            return jsonify(
                {
                    "status": "error",
                    "message": "No form data provided."
                }
            ), 400
        
        if form.get("user") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No user specified."
                }
            ), 400
        
        try:
            action = await Action.create(a, form.get("reason"), form.get("user"))
        
        except ValueError as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400
        
        try:
            if Privileges.RestrictUsers not in GetPriv(action.mod.priv):
                return jsonify(
                    {
                        "status": "error",
                        "message": "You do not have permission to restrict users."
                    }
                ), 403

            if action.user.priv == 0:
                return jsonify(
                    {
                        "status": "error",
                        "message": "user is already restricted."
                    }
                ), 400
            
            await glob.db.execute(
                f"""
                UPDATE users
                SET priv = 0
                WHERE id = {action.user.id};
                """
            )

            await log(action)

            return jsonify(
                {
                    "status": "success",
                    "message": f"Successfully restricted {action.user.name} ({action.user.id})."
                }
            ), 200
            
        except Exception as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400
         
    if a == "unrestrict":
        form = await request.form
        if not form:
            return jsonify(
                {
                    "status": "error",
                    "message": "No form data provided."
                }
            ), 400
        
        if form.get("user") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No user specified."
                }
            ), 400
        
        try:
            action = await Action.create(a, form.get("reason"), form.get("user"))
        
        except ValueError as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400
        
        try:
            if Privileges.RestrictUsers not in GetPriv(action.mod.priv):
                return jsonify(
                    {
                        "status": "error",
                        "message": "You do not have permission to unrestrict users."
                    }
                ), 403

            if action.user.priv != 0:
                return jsonify(
                    {
                        "status": "error",
                        "message": "user is not already restricted."
                    }
                ), 400
            
            await glob.db.execute(
                f"""
                UPDATE users
                SET priv = 1
                WHERE id = {action.user.id};
                """
            )

            await log(action)
            return jsonify(
                {
                    "status": "success",
                    "message": f"Successfully unrestricted {action.user.name} ({action.user.id})."
                }
            ), 200
            
        except Exception as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400

    if a == "silence":
        form = await request.form
        if not form:
            return jsonify(
                {
                    "status": "error",
                    "message": "No form data provided."
                }
            ), 400
        
        if form.get("user") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No user specified."
                }
            ), 400
        
        if form.get("duration") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No duration specified."
                }
            ), 400
        
        try:
            action = await Action.create(a, form.get("reason"), form.get("user"), form.get("duration")) 
        
        except ValueError as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400
        
        try:
            if Privileges.SilenceUsers not in GetPriv(action.mod.priv):
                return jsonify(
                    {
                        "status": "error",
                        "message": "You do not have permission to silence users."
                    }
                ), 403

            if action.user.silence_end != 0:
                return jsonify(
                    {
                        "status": "error",
                        "message": "user is already silenced."
                    }
                ), 400
            
            await glob.db.execute(
                f"""
                UPDATE users
                SET silence_end = {datetime.datetime.now() + datetime.timedelta(hours=action.duration)}
                WHERE id = {action.user.id};
                """
            )

            await log(action)

            return jsonify(
                {
                    "status": "success",
                    "message": f"Successfully silenced {action.user.name} ({action.user.id})."
                }
            ), 200
            
        except Exception as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400

    if a == "unsilence":
        form = await request.form
        if not form:
            return jsonify(
                {
                    "status": "error",
                    "message": "No form data provided."
                }
            ), 400
        
        if form.get("user") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No user specified."
                }
            ), 400
        
        try:
            action = await Action.create(a, form.get("reason"), form.get("user")) 
        
        except ValueError as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400
        
        try:
            if Privileges.SilenceUsers not in GetPriv(action.mod.priv):
                return jsonify(
                    {
                        "status": "error",
                        "message": "You do not have permission to unsilence users."
                    }
                ), 403

            if action.user.silence_end == 0:
                return jsonify(
                    {
                        "status": "error",
                        "message": "user is not already silenced."
                    }
                ), 400
            
            await glob.db.execute(
                f"""
                UPDATE users
                SET silence_end = 0
                WHERE id = {action.user.id};
                """
            )

            await log(action)
            
            return jsonify(
                {
                    "status": "success",
                    "message": f"Successfully unsilenced {action.user.name} ({action.user.id})."
                }
            ), 200
            
        except Exception as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400

    if a == "changepassword":
        form = await request.form
        if not form:
            return jsonify(
                {
                    "status": "error",
                    "message": "No form data provided."
                }
            ), 400
        
        if form.get("user") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No user specified."
                }
            ), 400
        
        if form.get("password") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No password specified."
                }
            ), 400
        
        try:
            action = await Action.create(a, form.get("reason"), form.get("user"))
            password = form.get("password")
        
        except ValueError as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400
        
        try:
            if Privileges.ManageUsers not in GetPriv(action.mod.priv):
                return jsonify(
                    {
                        "status": "error",
                        "message": "You do not have permission to change the password of users."
                    }
                ), 403

            if not 8 < len(password) <= 32:
                return jsonify(
                    {
                        "status": "error",
                        "message": "Password must be between 8 and 32 characters."
                    }
                ), 400
            
            bcrypt_cache = glob.cache['bcrypt']
            pw_bcrypt = (await glob.db.fetch(
                'SELECT pw_bcrypt '
                'FROM users '
                'WHERE id = %s',
                [action.user.id])
            )['pw_bcrypt'].encode()

            if pw_bcrypt in bcrypt_cache:
                del bcrypt_cache[pw_bcrypt]

            # calculate new md5 & bcrypt pw
            pw_md5 = hashlib.md5(password.encode()).hexdigest().encode()
            pw_bcrypt = bcrypt.hashpw(pw_md5, bcrypt.gensalt())

            # update password in cache and db
            bcrypt_cache[pw_bcrypt] = pw_md5
            await glob.db.execute(
                'UPDATE users '
                'SET pw_bcrypt = %s '
                'WHERE safe_name = %s',
                [pw_bcrypt, action.user.safe_name]
            )

            await log(action)
            return jsonify(
                {
                    "status": "success",
                    "message": f"Successfully changed the password of {action.user.name} ({action.user.id})."
                }
            ), 200
            
        except Exception as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400

    if a == "changeprivileges":
        form = await request.form
        if not form:
            return jsonify(
                {
                    "status": "error",
                    "message": "No form data provided."
                }
            ), 400
        
        if form.get("user") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No user specified."
                }
            ), 400
        
        if form.get("privs") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No privileges specified."
                }
            ), 400
        
        try:
            action = await Action.create(a, form.get("reason"), form.get("user"))
            priv = int(form.get("privs"))
        
        except ValueError as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400
        
        try:
            if Privileges.ManagePrivs not in GetPriv(action.mod.priv):
                return jsonify(
                    {
                        "status": "error",
                        "message": "You do not have permission to change the privileges of users."
                    }
                ), 403

            if ComparePrivs(action.user.priv, priv):
                return jsonify(
                    {
                        "status": "error",
                        "message": f"privileges are already set to {action.user.priv}."
                    }
                ), 400
            
            if ComparePrivs(priv, action.mod.priv):
                return jsonify(
                    {
                        "status": "error",
                        "message": "You cannot grant privileges that you don't possess."
                    }
                ), 403
            if ComparePrivs(action.mod.priv, action.user.priv):
                return jsonify(
                    {
                        "status": "error",
                        "message": "You cannot modify people with privileges that you don't possess."
                    }
                ), 403
            
            await glob.db.execute(
                f"""
                UPDATE users
                SET priv = {priv}
                WHERE id = {action.user.id};
                """
            )

            await log(action)

            return jsonify(
                {
                    "status": "success",
                    "message": f"Successfully modified the privileges of {action.user.name} ({action.user.id})."
                }
            ), 200
            
        except Exception as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400

    if a == "rank":
        form = await request.form
        if not form:
            return jsonify(
                {
                    "status": "error",
                    "message": "No form data provided."
                }
            ), 400
        
        if form.get("map") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No map specified."
                }
            ), 400
        
        try:
            action = await Action.create(a, form.get("reason"), form.get("map"))
        
        except ValueError as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400
        
        try:
            if Privileges.ManageBeatmaps not in GetPriv(action.mod.priv):
                return jsonify(
                    {
                        "status": "error",
                        "message": "You do not have permission to rank maps."
                    }
                ), 403

            if action.map.status == 2:
                return jsonify(
                    {
                        "status": "error",
                        "message": "map is already ranked."
                    }
                ), 400
            
            if action.map.frozen:
                return jsonify(
                    {
                        "status": "error",
                        "message": "map is frozen."
                    }
                ), 400
            
            await glob.db.execute(
                f"""
                UPDATE maps
                SET status = 2
                WHERE id = {action.map.id};
                """
            )

            await log(action)

            return jsonify(
                {
                    "status": "success",
                    "message": f"Successfully ranked {action.map.name} ({action.map.id})."
                }
            ), 200
            
        except Exception as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400

    if a == "unrank":
        form = await request.form
        if not form:
            return jsonify(
                {
                    "status": "error",
                    "message": "No form data provided."
                }
            ), 400
        
        if form.get("map") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No map specified."
                }
            ), 400
        
        try:
            action = await Action.create(a, form.get("reason"), form.get("map"))
        
        except ValueError as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400
        
        try:
            if Privileges.ManageBeatmaps not in GetPriv(action.mod.priv):
                return jsonify(
                    {
                        "status": "error",
                        "message": "You do not have permission to unrank maps."
                    }
                ), 403

            if action.map.status == 0:
                return jsonify(
                    {
                        "status": "error",
                        "message": "map is not already ranked."
                    }
                ), 400
            
            if action.map.frozen:
                return jsonify(
                    {
                        "status": "error",
                        "message": "map is frozen."
                    }
                ), 400
            
            await glob.db.execute(
                f"""
                UPDATE maps
                SET status = 0
                WHERE id = {action.map.id};
                """
            )

            await log(action)

            return jsonify(
                {
                    "status": "success",
                    "message": f"Successfully unranked {action.map.name} ({action.map.id})."
                }
            ), 200
            
        except Exception as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400

    if a == "love":
        form = await request.form
        if not form:
            return jsonify(
                {
                    "status": "error",
                    "message": "No form data provided."
                }
            ), 400
        
        if form.get("map") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No map specified."
                }
            ), 400
        
        try:
            action = await Action.create(a, form.get("reason"), form.get("map"))
        
        except ValueError as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400
        
        try:
            if Privileges.ManageBeatmaps not in GetPriv(action.mod.priv):
                return jsonify(
                    {
                        "status": "error",
                        "message": "You do not have permission to love maps."
                    }
                ), 403

            if action.map.status == 5:
                return jsonify(
                    {
                        "status": "error",
                        "message": "map is already loved."
                    }
                ), 400
            
            if action.map.frozen:
                return jsonify(
                    {
                        "status": "error",
                        "message": "map is frozen."
                    }
                ), 400
            
            await glob.db.execute(
                f"""
                UPDATE maps
                SET status = 5
                WHERE id = {action.map.id};
                """
            )

            await log(action)

            return jsonify(
                {
                    "status": "success",
                    "message": f"Successfully loved {action.map.name} ({action.map.id})."
                }
            ), 200
            
        except Exception as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400

    if a == "unlove":
        form = await request.form
        if not form:
            return jsonify(
                {
                    "status": "error",
                    "message": "No form data provided."
                }
            ), 400
        
        if form.get("map") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No map specified."
                }
            ), 400
        
        try:
            action = await Action.create(a, form.get("reason"), form.get("map"))
        
        except ValueError as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400
        
        try:
            if Privileges.ManageBeatmaps not in GetPriv(action.mod.priv):
                return jsonify(
                    {
                        "status": "error",
                        "message": "You do not have permission to unlove maps."
                    }
                ), 403

            if action.map.status != 5:
                return jsonify(
                    {
                        "status": "error",
                        "message": "map is not already loved."
                    }
                ), 400
            
            if action.map.frozen:
                return jsonify(
                    {
                        "status": "error",
                        "message": "map is frozen."
                    }
                ), 400
            
            await glob.db.execute(
                f"""
                UPDATE maps
                SET status = 0
                WHERE id = {action.map.id};
                """
            )

            await log(action)

            return jsonify(
                {
                    "status": "success",
                    "message": f"Successfully unloved {action.map.name} ({action.map.id})."
                }
            ), 200
            
        except Exception as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400

    if a == "editaccount":
        form = await request.form
        if not form:
            return jsonify(
                {
                    "status": "error",
                    "message": "No form data provided."
                }
            ), 400
        
        if form.get("user") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No user specified."
                }
            ), 400
        
        if form.get("username") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No username specified. please specify all fields in a editaccount request."
                }
            ), 400
        
        if form.get("email") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No email specified. please specify all fields in a editaccount request."
                }
            ), 400
        
        if form.get("country") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No country specified. please specify all fields in a editaccount request."
                }
            ), 400
         
        if form.get("userpage_content") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No userpage_content specified. please specify all fields in a editaccount request."
                }
            ), 400

        try:
            action = await Action.create(a, form.get("reason"), form.get("user"))
            username = form.get("username")
            email = form.get("email")
            country = form.get("country")
            userpage_content = form.get("userpage_content")
        
        except ValueError as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400
        
        try:
            if Privileges.ManageUsers not in GetPriv(action.mod.priv):
                return jsonify(
                    {
                        "status": "error",
                        "message": "You do not have permission to edit users."
                    }
                ), 403

            if action.user.name != username:
                safename = get_safe_name(username)
                try:
                    # because why would we make it a unique key!? :D 
                    if await glob.db.fetch(f"SELECT * FROM users WHERE safe_name = {safename}") is not None or await glob.db.fetch(f"SELECT * FROM users WHERE name = {username}") is not None:
                        return jsonify(
                            {
                                "status": "error",
                                "message": "Username already taken."
                            }
                        ), 400
                    
                    await glob.db.execute(
                        f"""
                        UPDATE users
                        SET name = {username}, safe_name = {safename}
                        WHERE id = {action.user.id};
                        """
                    )

                except Exception as e:
                    return jsonify(
                        {
                            "status": "error",
                            "message": str(e)
                        }
                    ), 400

            if action.user.email != email:
                try:
                    if not regexes.email.match(email):
                        return jsonify(
                            {
                                "status": "error",
                                "message": "email is not a valid email address."
                            }
                        ), 400
                    
                    if await glob.db.fetch(f"SELECT email FROM users WHERE email = {email}") is not None:
                        # do a multiacc check here maybe?
                        return jsonify(
                            {
                                "status": "error",
                                "message": "email already taken."
                            }
                        ), 400
                    
                    await glob.db.execute(
                        f"""
                        UPDATE users
                        SET email = {email}
                        WHERE id = {action.user.id};
                        """
                    )
                   
                except Exception as e:
                    return jsonify(
                        {
                            "status": "error",
                            "message": str(e)
                        }
                    ), 400
                
            if action.user.country != country:
                if len(country) != 2:
                    # this shouldn't even be possible anyway
                    # why do we not have a country table?
                    return jsonify(
                        {
                            "status": "error",
                            "message": "country is not a valid country code." 
                        }
                    ), 400
                
                try:
                    await glob.db.execute(
                        f"""
                        UPDATE users
                        SET country = {country}
                        WHERE id = {action.user.id};
                        """
                    )

                except Exception as e:
                    return jsonify(
                        {
                            "status": "error",
                            "message": str(e)
                        }
                    ), 400
                
            if action.user.userpage_content != userpage_content:
                try:
                    await glob.db.execute(
                        f"""
                        UPDATE users
                        SET userpage_content = {userpage_content}
                        WHERE id = {action.user.id};
                        """
                    )

                except Exception as e:
                    return jsonify(
                        {
                            "status": "error",
                            "message": str(e)
                        }
                    ), 400
            
        except Exception as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400
        
    if a == "addbadge":
        form = await request.form

        if form.get("user") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No user specified."
                }
            ), 400
        
        if form.get("badge") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No badge specified."
                }
            ), 400
        
        try:
            action = await Action.create(a, form.get("reason"), form.get("user"))
            badge = form.get("badge")

            if await glob.db.fetch(f"SELECT * FROM user_badges WHERE userid = {action.user.id} AND badge_id = {badge}") is not None:
                return jsonify(
                    {
                        "status": "error",
                        "message": "User already has this badge."
                    }
                ), 400


            await glob.db.execute(
                f"""
                INSERT INTO user_badges (userid, badge_id)
                VALUES ({action.user.id}, {badge})
                """
            )

            await log(action)

            return jsonify(
                {
                    "status": "success",
                    "message": f"Successfully added badge {badge} to {action.user.name} ({action.user.id})."
                }
            ), 200

        except Exception as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400
        
    if a == "removebadge":
        form = await request.form

        if form.get("user") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No user specified."
                }
            ), 400
        
        if form.get("badge") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No badge specified."
                }
            ), 400
        
        try:
            action = await Action.create(a, form.get("reason"), form.get("user"))
            badge = form.get("badge")

            if await glob.db.fetch(f"SELECT * FROM user_badges WHERE userid = {action.user.id} AND badge_id = {badge}") is None:
                return jsonify(
                    {
                        "status": "error",
                        "message": "User does not have this badge."
                    }
                ), 400


            await glob.db.execute(
                f"""
                DELETE FROM user_badges
                WHERE userid = {action.user.id} AND badge_id = {badge}
                """
            )
            
            await log(action)

            return jsonify(
                {
                    "status": "success",
                    "message": f"Successfully removed badge {badge} from {action.user.name} ({action.user.id})."
                }
            ), 200

        except Exception as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400
    
    if a == "removescore":
        form = await request.form

        if form.get("user") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No user specified."
                }
            ), 400
        
        if form.get("score") is None:
            return jsonify(
                {
                    "status": "error",
                    "message": "No score specified."
                }
            ), 400
        
        try:
            action = await Action.create(a, form.get("reason"), form.get("user"))
            score = form.get("score")

            if await glob.db.fetch(f"SELECT * FROM scores WHERE id = {score}") is None:
                return jsonify(
                    {
                        "status": "error",
                        "message": "Score does not exist."
                    }
                ), 400

            # wiped scores
            await glob.db.execute(
                f"""
                INSERT INTO wiped_scores (id, map_md5, score, pp, acc, max_combo, mods, n300, n100, n50, nmiss, ngeki, nkatu, grade, status, mode, play_time, time_elapsed, client_flags, userid, perfect, online_checksum, r_replay_id)
                SELECT id, map_md5, score, pp, acc, max_combo, mods, n300, n100, n50, nmiss, ngeki, nkatu, grade, status, mode, play_time, time_elapsed, client_flags, userid, perfect, online_checksum, r_replay_id
                FROM scores
                WHERE id = {score};
                """
            )



            await glob.db.execute(
                f"""
                DELETE FROM scores
                WHERE id = {score}
                """
            )

            await log(action)

            return jsonify(
                {
                    "status": "success",
                    "message": f"Successfully removed score {score} from {action.user.name} ({action.user.id})."
                }
            ), 200

        except Exception as e:
            return jsonify(
                {
                    "status": "error",
                    "message": str(e)
                }
            ), 400
        
async def log(action: Action):
    """
    structure of the log table:
    - id: the id of the log. (varchar)
    - action: the type of action performed. (varchar)
    - reason: the reason for the action. (varchar)
    - mod: the id of the moderator who performed the action. (int)
    - target: the id of the user or map the action was performed on. (int)
    - time: the time the action was performed. (datetime)
    - type: the type of the target. 0 for user, 1 for map. (bool)
    """

    if action.type == 0:
        await glob.db.execute(
            f"""
            INSERT INTO logs (id, action, reason, mod, target, time, type)
            VALUES ('{action.id}' '{action.action}', '{action.reason}', {action.mod.id}, {action.user.id}, {datetime.datetime.now()}, {action.type});
            """
        )

        webhook = DiscordWebhook(glob.config.admin_webhook_url)

        embed = DiscordEmbed(
            title=f"{action.user.id} was {action.text} by {action.mod.id}",
            description=f"a {action.action} was performed.",
            colour=0x4e3773,
            timestamp=datetime.datetime.now()
            )
        
        embed.set_author(
            name=f"New Action By {action.mod.id}",
            icon_url=f"https://a.kawata.pw/{action.mod.id}"
            )

        embed.add_field(
            name="Information:",
            value=f"Action ID: {action.id}\nAction Moderator: {action.mod.name} ({action.mod.id})\nAction User: {action.user.name} ({action.user.id})\nAction Type: {action.action}",
            inline=False
            )

        embed.set_footer(
            text=f"ID: {action.id}",
            icon_url=f"https://a.kawata.pw/{action.user.id}")

        webhook.add_embed(embed)
        webhook.execute()
    
    elif action.type == 1:
        await glob.db.execute(
            f"""
            INSERT INTO logs (id, action, reason, mod, target, time, type)
            VALUES ('{action.id}' '{action.action}', '{action.reason}', {action.mod.id}, {action.map.id}, {datetime.datetime.now()}, {action.type});
            """
        )

        webhook = DiscordWebhook(glob.config.ranked_webhook_url)

        embed = DiscordEmbed(
            title=f"{action.map.id} was {action.text} by {action.mod.id}",
            description=f"a {action.action} was performed.",
            colour=0x4e3773,
            timestamp=datetime.datetime.now()
            )
        
        embed.set_author(
            name=f"New Action By {action.mod.id}",
            icon_url=f"https://a.kawata.pw/{action.mod.id}"
            )

        embed.add_field(
            name="Information:",
            value=f"Action ID: {action.id}\nAction Moderator: {action.mod.name} ({action.mod.id})\nAction map: {action.map.title} ({action.map.id})\nAction Type: {action.action}",
            inline=False
            )

        embed.set_image(url=f"https://assets.ppy.sh/beatmaps/{action.map.set_id}/covers/card@2x.jpg")

        embed.set_footer(
            text=f"ID: {action.id}",
            icon_url=f"https://a.kawata.pw/{action.user.id}")

        webhook.add_embed(embed)
        webhook.execute()



@admin.route('/')
@admin.route('/home')
@admin.route('/dashboard')
async def home():
    """Render the homepage of guweb's admin panel."""
    if not 'authenticated' in session:
        return await flash('error', 'Please login first.', 'login')

    if not session['user_data']['is_staff']:
        return await flash('error', f'You have insufficient privileges.', 'home')

    # fetch data from database
    dash_data = await glob.db.fetch(
        'SELECT COUNT(id) count, '
        '(SELECT name FROM users ORDER BY id DESC LIMIT 1) lastest_user, '
        '(SELECT COUNT(id) FROM users WHERE NOT priv & 1) banned '
        'FROM users'
    )

    recent_users = await glob.db.fetchall('SELECT * FROM users ORDER BY id DESC LIMIT 5')
    recent_scores = await glob.db.fetchall(
        'SELECT scores.*, maps.artist, maps.title, '
        'maps.set_id, maps.creator, maps.version '
        'FROM scores JOIN maps ON scores.map_md5 = maps.md5 '
        'ORDER BY scores.id DESC LIMIT 5'
    )

    return await render_template(
        'admin/home.html', dashdata=dash_data,
        recentusers=recent_users, recentscores=recent_scores,
        datetime=datetime, timeago=timeago
    )

@admin.route('/users')
@admin.route('/users/')
@admin.route('/users/<int:page>')
async def users(page=None):
    """Render the homepage of guweb's admin panel."""
    if not 'authenticated' in session:
        return await flash('error', 'Please login first.', 'login')

    if not session['user_data']['is_staff']:
        return await flash('error', f'You have insufficient privileges.', 'home')

    # Check if update query parameter is present
    update = request.args.get('update') == 'true'
    search = str(request.args.get('search') or '')
    # fetch data from database
    if page == None or page < 1:
        page = 1
    Offset = 50 * (page - 1)  # for the page system to work

    if search is not None and search != "":
        if search.isdigit():
            # search is an id
            users = await glob.db.fetchall(
                "SELECT id, name, priv, country FROM users WHERE id = %s",
                (search,),
            )
        else:
            # search is a name
            users = await glob.db.fetchall(
                "SELECT id, name, priv, country FROM users WHERE name LIKE %s",
                (f"%{search}%",),
            )
    else:
        users = await glob.db.fetchall(
            "SELECT id, name, priv, country FROM users LIMIT 50 OFFSET %s",
            (Offset,),
        )
    
    for user in users:
        user['customisations'] = await glob.db.fetch(
            "SELECT * FROM user_customisations WHERE userid = %s",
            [user['id']]
        )
    if update:
        # Return JSON response
        return jsonify(users)

    return await render_template(
        'admin/users.html', users=users, page=page, search=search,
        datetime=datetime, timeago=timeago
    )

@admin.route('/user/<int:userid>')
async def user(userid):
    """Render the homepage of guweb's admin panel."""
    if not 'authenticated' in session:
        return await flash('error', 'Please login first.', 'login')

    if not session['user_data']['is_staff']:
        return await flash('error', f'You have insufficient privileges.', 'home')

    # Check if update query parameter is present
    #update = request.args.get('update') == 'true'
    user = await glob.db.fetch(
        "SELECT * FROM users WHERE id = %s",
        (userid,),
    )

    user_badges = await glob.db.fetchall(
        "SELECT badge_id FROM user_badges WHERE userid = %s",
        (userid,),
    )
    badges = []
    for user_badge in user_badges:
        badge_id = user_badge["badge_id"]
        
        badge = await glob.db.fetch(
            "SELECT * FROM badges WHERE id = %s",
            (badge_id,),
        )
        
        badge_styles = await glob.db.fetchall(
            "SELECT * FROM badge_styles WHERE badge_id = %s",
            (badge_id,),
        )
        
        badge = dict(badge)
        badge["styles"] = {style["type"]: style["value"] for style in badge_styles}
        
        badges.append(badge)

        # Sort the badges based on priority
        badges.sort(key=lambda x: x['priority'], reverse=True)
        
    
    logs = {}
    hashes = await glob.db.fetchall(
        "SELECT * FROM client_hashes WHERE userid = %s ORDER BY latest_time DESC",
        (userid,),
    )
    admin_logs = await glob.db.fetchall(
        "SELECT * FROM logs WHERE `to` = %s ORDER BY `time` DESC",
        (userid,),
    )
    for admin_log in admin_logs:
        from_user = await glob.db.fetch(
            "SELECT id, name, country, priv, safe_name FROM users WHERE id = %s",
            (admin_log['from'],),
        )
        admin_log['from'] = from_user
    print(admin_logs)
    logs['hashes'] = hashes
    logs['admin_logs'] = admin_logs
    user['badges'] = badges
    user['logs'] = logs
    # Return JSON response
    return jsonify(user)

@admin.route('/badges')
async def badges():
    """Render the homepage of guweb's admin panel."""
    if not 'authenticated' in session:
        return await flash('error', 'Please login first.', 'login')

    if not session['user_data']['is_staff']:
        return await flash('error', f'You have insufficient privileges.', 'home')

    # Check if JSON query parameter is present
    is_json = request.args.get('json') == 'true'

    # Get all badges
    badges = await glob.db.fetchall("SELECT * FROM badges")

    # Get badge styles for each badge
    for badge in badges:
        badge_styles = await glob.db.fetchall(
            "SELECT * FROM badge_styles WHERE badge_id = %s",
            (badge['id'],),
        )
        if is_json:
            badge['styles'] = {style['type']: style['value'] for style in badge_styles}
        else:
            badge['styles'] = badge_styles

    # Return JSON response if is_json is True
    if is_json:
        return jsonify(badges)

    # Return HTML response
    return await render_template(
        'admin/badges.html', badges=badges, 
        datetime=datetime, timeago=timeago
    )

@admin.route('/badge/<int:badgeid>')
async def badge(badgeid):
    """Return information about the provided badge."""
    if not 'authenticated' in session:
        return await flash('error', 'Please login first.', 'login')

    if not session['user_data']['is_staff']:
        return await flash('error', f'You have insufficient privileges.', 'home')

    # Get the badge from the database
    badge = await glob.db.fetch(
        "SELECT * FROM badges WHERE id = %s",
        (badgeid,),
    )

    if not badge:
        return await flash('error', f'Badge with ID {badgeid} not found.', 'home')

    # Get badge styles for the badge
    badge_styles = await glob.db.fetchall(
        "SELECT * FROM badge_styles WHERE badge_id = %s",
        (badgeid,),
    )

    badge['styles'] = badge_styles

    
    update = request.args.get('update') == 'true'
    search = str(request.args.get('search') or '')
    
    #if update:
        
    
    # Return JSON response
    return jsonify(badge)

@admin.route('/beatmaps')
async def beatmaps():
    """Render the beatmaps page of guweb's admin panel."""
    if not 'authenticated' in session:
        return await flash('error', 'Please login first.', 'login')

    if not session['user_data']['is_staff']:
        return await flash('error', f'You have insufficient privileges.', 'home')
    
    if Privileges.ManageBeatmaps not in GetPriv(session["user_data"]["priv"]):
            return await flash('error', f'You have insufficient privileges.', 'home')
    
    requests = await glob.db.fetchall(
        "SELECT * FROM map_requests WHERE active = 1"
    )
    
    # Append map_info to each entry in requests
    for request in requests:
        map_info = await glob.db.fetch(
            "SELECT * FROM maps WHERE id = %s",
            (request['map_id'],),
        )
        request['map_info'] = map_info
    
    # Convert datetime to string
    for request in requests:
        request['datetime'] = request['datetime'].strftime('%Y-%m-%d %H:%M:%S')
        request['map_info']['last_update'] = request['map_info']['last_update'].strftime('%Y-%m-%d %H:%M:%S')
    
    print(requests[1]['map_info'])
    # Return HTML response
    return await render_template(
        'admin/beatmaps.html', requests=requests, 
        datetime=datetime, timeago=timeago
    )


@admin.route("/action/<action>", methods=["POST"])
async def Action(action: Literal["wipe", "restrict", "unrestrict", "silence", "unsilence", "changepassword", "changeprivileges", "rank", "unrank", "love", "unlove"]):
    """
    Perform specified action on user.
    This endpoint is used to perform actions on a user, such as restricting or unrestricting them. 
    It can only be accessed via a POST request and requires the user to be logged in. The content type 
    of the request should be 'application/x-www-form-urlencoded'. The 'action' parameter specifies 
    the action to be performed on the user. Additional parameters may be required depending on the action.
    :param action: The action to perform on the user.
    :type action: Literal["wipe", "restrict", "unrestrict", "silence", "unsilence", "changepassword", "changeprivileges", "rank", "unrank", "love", "unlove"]
    """
    if not "authenticated" in session:
        return jsonify({"status": "error", "message": "Please login first."}), 401

    if not request.content_type == "application/x-www-form-urlencoded":
        print(request.content_type)
        return jsonify({"status": "error","message": "Invalid content type. use application/x-www-form-urlencoded."}), 400

    if action == "restrict":
        if Privileges.RestrictUsers not in GetPriv(session["user_data"]["priv"]):
            return jsonify({"status": "error","message": "You have insufficient privileges to perform this action."}),403
        if (await request.form).get("user") is None:
            return jsonify({"status": "error", "message": "'user' not specified."}), 400
        reason = (await request.form).get("reason")
        if reason is None:
            return jsonify({"status": "error", "message": "'reason' not specified."}), 400
        user = await glob.db.fetch(
            "SELECT id, name, priv FROM users WHERE id = %s", [(await request.form).get("user")]
        )
        if user is None:
            return jsonify({"status": "error", "message": "User not found."}), 404

        if user["priv"] != 0:  # TODO: logging? take in form.get('reason')?
            await glob.db.execute(
                "UPDATE users SET priv = 0 WHERE id = %s", [user["id"]]
            )
            # Log Action
            current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            await log(session["user_data"]["id"], user["id"], "restrict", reason, current_time)
            return jsonify({"status": "success","message": f"Successfully restricted {user['name']} ({user['id']})!"}),200

        else:
            return jsonify({"status": "error","message": f"{user['name']} ({user['id']}) is already restricted."}),400

    elif action == "unrestrict":
        if Privileges.RestrictUsers not in GetPriv(session["user_data"]["priv"]):
            return jsonify({"status": "error","message": "You have insufficient privileges to perform this action."}), 403

        if (await request.form).get("user") is None:
            return jsonify({"status": "error", "message": "'user' not specified."}), 400
        user = await glob.db.fetch(
            "SELECT id, name, priv FROM users WHERE id = %s", [(await request.form).get("user")]
        )
        if user is None:
            return jsonify({"status": "error", "message": "User not found."}), 404
        if user["priv"] != 0:
            return jsonify({"status": "error", "message": f"{user['name']} is not restricted."}), 400

        else:
            await glob.db.execute(
                "UPDATE users SET priv = 1 WHERE id = %s", [user["id"]]
            )
            current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            await log(session["user_data"]["id"], user["id"], "unrestrict", "", current_time)
            return jsonify({"status": "success","message": f"Successfully unrestricted {user['name']} ({user['id']})!"}), 200

    elif action == "silence":
        if Privileges.SilenceUsers not in GetPriv(session["user_data"]["priv"]):
            return jsonify({"status": "error","message": "You have insufficient privileges to perform this action."}), 403

        if (await request.form).get("user") is None:
            return jsonify({"status": "error", "message": "'user' not specified."}), 400

        if (await request.form).get("duration") is None:  # in hours, jsyk.
            return jsonify({"status": "error", "message": "'duration' not specified."}), 400
        
        reason = (await request.form).get("reason")
        if reason is None:
            return jsonify({"status": "error", "message": "'reason' not specified."}), 400
        
        try:
            duration = int((await request.form).get("duration"))
        except ValueError:
            return jsonify({"status": "error", "message": "Invalid duration."}), 400

        user = await glob.db.fetch(
            "SELECT id, name, silence_end FROM users WHERE id = %s",
            [(await request.form).get("user")],
        )

        if user is None:
            return jsonify({"status": "error", "message": "User not found."}), 404
        if user["silence_end"] != 0:
            return jsonify({"status": "error","message": f"{user['name']} is already silenced."}), 400

        else:
            try:
                finaltime = datetime.datetime.now() + datetime.timedelta(hours=duration)
                finaltime = int(finaltime.timestamp())
                await glob.db.execute(
                    "UPDATE users SET silence_end = %s WHERE id = %s",
                    [finaltime, user["id"]],
                )
                # Log Action
                current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                await log(session["user_data"]["id"], user["id"], "silence", reason, current_time)
                return jsonify({"status": "success","message": f"Successfully silenced {user['name']} ({user['id']})!"}),200

            except Exception as e:
                return jsonify({"status": "error","message": f"Failed to silence {user['name']} ({user['id']}).","Error": f"{e}"}), 500

    elif action == "unsilence":
        if Privileges.SilenceUsers not in GetPriv(session["user_data"]["priv"]):
            return jsonify({"status": "error","message": "You have insufficient privileges to perform this action."}), 403
        if (await request.form).get("user") is None:
            return jsonify({"status": "error", "message": "'user' not specified."}), 400

        user = await glob.db.fetch(
            "SELECT id, name, silence_end FROM users WHERE id = %s",
            [(await request.form).get("user")],
        )

        if user is None:
            return jsonify({"status": "error", "message": "User not found."}), 404
        if user["silence_end"] == 0:
            return jsonify({"status": "error", "message": f"{user['name']} is not silenced."}), 400

        else:
            try:
                await glob.db.execute(
                    "UPDATE users SET silence_end = 0 WHERE id = %s", [user["id"]]
                )
                current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                await log(session["user_data"]["id"], user["id"], "unsilence", "", current_time)
                return jsonify({"status": "success","message": f"Successfully unsilenced {user['name']} ({user['id']})!"}), 200

            except Exception as e:
                return jsonify({"status": "error","message": f"Failed to unsilence {user['name']} ({user['id']}).","Error": f"{e}"}),500

    elif action == "wipe":
        if Privileges.WipeUsers not in GetPriv(session["user_data"]["priv"]):
            return jsonify({"status": "error","message": "You have insufficient privileges to perform this action."}), 403

        if (await request.form).get("user") is None:
            return jsonify({"status": "error", "message": "'user' not specified."}), 400

        user = await glob.db.fetch(
            "SELECT id, name, country FROM users WHERE id = %s", [(await request.form).get("user")]
        )
        if user is None:
            return jsonify({"status": "error", "message": "User not found."}), 404
        reason = (await request.form).get("reason")
        if reason is None:
            return jsonify({"status": "error", "message": "'reason' not specified."}), 400

        try:
            modes = [0, 1, 2, 3, 4, 5, 6, 7, 8]
            # Move scores to wiped_scores table
            await glob.db.execute(
                f"""
                INSERT INTO wiped_scores (id, map_md5, score, pp, acc, max_combo, mods, n300, n100, n50, nmiss, ngeki, nkatu, grade, status, mode, play_time, time_elapsed, client_flags, userid, perfect, online_checksum, r_replay_id)
                SELECT id, map_md5, score, pp, acc, max_combo, mods, n300, n100, n50, nmiss, ngeki, nkatu, grade, status, mode, play_time, time_elapsed, client_flags, userid, perfect, online_checksum, r_replay_id
                FROM scores
                WHERE userid = {user['id']};
                """
            )
            # Delete scores from scores table
            await glob.db.execute(
                f"""
                DELETE FROM scores
                WHERE userid = {user['id']};
                """
            )
            # Reset Players Stats
            for mode in modes:
                query = f"""
                UPDATE stats
                SET tscore = 0, rscore = 0, pp = 0, plays = 0, playtime = 0, acc = 0.000, max_combo = 0, total_hits = 0, replay_views = 0, xh_count = 0, x_count = 0, sh_count = 0, s_count = 0, a_count = 0
                WHERE id = {user['id']} AND mode = '{mode}';
                """

                await glob.db.execute(query)
                
                await glob.redis.zrem(
                    f"bancho:leaderboard:{mode}",
                    user['id'],
                )

                await glob.redis.zrem(
                    f'bancho:leaderboard:{mode}:{user["country"]}',
                    user['id'],
            )

            # Log Action
            current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            await log(session["user_data"]["id"], user["id"], "wipe", reason, current_time)
            return jsonify({"status": "success", "message": f"Successfully wiped {user['name']} ({user['id']})!"}), 200

        except Exception as e:
            return jsonify({"status": "error","message": f"Failed to wipe {user['name']} ({user['id']}).","Error": f"{e}"}), 500

    elif action == "changepassword":
        form = await request.form
        user = form.get("user")
        password = form.get("password")

        if Privileges.ManageUsers not in GetPriv(session["user_data"]["priv"]):
            return jsonify({"status": "error","message": "You have insufficient privileges to perform this action."}), 403

        if user is None:
            return jsonify({"status": "error", "message": "'user' not specified."}), 400

        user = await glob.db.fetch("SELECT id, name, safe_name FROM users WHERE id = %s", [user])

        if user is None:
            return jsonify({"status": "error", "message": "User not found."}), 404

        if password is None:
            return jsonify({"status": "error", "message": "'password' not specified."}), 400

        # Passwords must:
        # - be within 8-32 characters in length
        # - have more than 3 unique characters
        # - not be in the config's `disallowed_passwords` list
        if not 8 < len(password) <= 32:
            return jsonify({"status": "error", "message": "Your new password must be 8-32 characters in length."}), 400

        if len(set(password)) <= 3:
            return await flash('error', 'Your new password must have more than 3 unique characters.', 'settings/password')

        if password.lower() in glob.config.disallowed_passwords:
            return jsonify({"status": "error", "message": "Your new password was deemed too simple."}), 400

        try:
            # cache and other password related information
            bcrypt_cache = glob.cache['bcrypt']
            pw_bcrypt = (await glob.db.fetch(
                'SELECT pw_bcrypt '
                'FROM users '
                'WHERE id = %s',
                [user['id']])
            )['pw_bcrypt'].encode()

            if pw_bcrypt in bcrypt_cache:
                del bcrypt_cache[pw_bcrypt]

            # calculate new md5 & bcrypt pw
            pw_md5 = hashlib.md5(password.encode()).hexdigest().encode()
            pw_bcrypt = bcrypt.hashpw(pw_md5, bcrypt.gensalt())

            # update password in cache and db
            bcrypt_cache[pw_bcrypt] = pw_md5
            await glob.db.execute(
                'UPDATE users '
                'SET pw_bcrypt = %s '
                'WHERE safe_name = %s',
                [pw_bcrypt, user['safe_name']]
            )

            # Success response
            return jsonify({"status": "success", "message": "Password changed successfully."}), 200

        except Exception as e:
            return jsonify({"status": "error", "message": f"Failed to change the password of {user['name']} ({user['id']}).", "Error": f"{e}"}), 500

    elif action == "changeprivileges":
        form = request.form
        user = form.get("user")
        # TODO: use privileges to show which privs a user can grant, and have a easy to use interface for it- like a checkbox menu or something. change this to a arr of privs, not int after.
        newpriv = form.get("privs")

        newpriv = int(newpriv)

        if Privileges.ManageUsers not in GetPriv(session["user_data"]["priv"]) and Privileges.ManagePrivs not in GetPriv(session["user_data"]["priv"]):
            return jsonify({"status": "error","message": "You have insufficient privileges to perform this action."}), 403

        if user is None:
            return jsonify({"status": "error", "message": "'user' not specified."}), 400

        user = await glob.db.fetch("SELECT id, name, priv FROM users WHERE id = %s", [user])

        if user is None:
            return jsonify({"status": "error", "message": "User not found."}), 404

        oldpriv = int(user["priv"])

        if ComparePrivs(oldpriv, newpriv):
                return jsonify({"status": "error", "message": "The new privileges are the same as the old privileges."}), 400

        if not newpriv.isdigit():
            return jsonify({"status": "error", "message": "'priv' must be a number."}), 400


        # TODO: log this
        if not ComparePrivs(session["user_data"]["priv"], newpriv):
            return jsonify({"status": "error", "message": "You cannot grant privileges that you do not have."}), 403

        if not ComparePrivs(session["user_data"]["priv"], oldpriv):
            return jsonify({"status": "error", "message": "You cannot modify privileges that are higher than your own."}), 403

        await glob.db.execute("UPDATE users SET priv = %s WHERE id = %s", [newpriv, user["id"]])

        return jsonify({"status": "success", "message": "Privileges changed successfully."}), 200

    elif action == "editaccount":
        if Privileges.ManageUsers not in GetPriv(session["user_data"]["priv"]):
            return jsonify({"status": "error", "message": "You have insufficient privileges to perform this action."}), 403
        try:
            safename = get_safe_name((await request.form).get("username"))
            await glob.db.execute(
                "UPDATE users SET name = %s, safe_name = %s, email = %s, country = %s, userpage_content = %s WHERE id = %s",
                [
                    (await request.form).get("username"),
                    safename,
                    (await request.form).get("email"),
                    (await request.form).get("country"),
                    (await request.form).get("userpage"),
                    (await request.form).get("userId"),
                ],
            )
            current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            await log(session["user_data"]["id"], (await request.form).get("userId"), "editaccount", "", current_time)
            return jsonify({"status": "success", "message": f"Successfully edited {(await request.form).get('username')} ({(await request.form).get('userId')})!"}), 200

        except Exception as e:
            print(await request.form)
            return jsonify({"status": "error","message": f"Failed to edit {(await request.form).get('username')} ({(await request.form).get('userId')}).","Error": f"{e}"}), 500

    elif action == "rank":
        if Privileges.ManageBeatmaps not in GetPriv(session["user_data"]["priv"]):
            return jsonify({"status": "error","message": "You have insufficient privileges to perform this action."}), 403
        
        if map is None:
            return jsonify({"status": "error", "message": "'map' not specified."}), 400
    
        mapdb = await glob.db.fetch("SELECT * FROM maps WHERE id = '{map}'")
        if mapdb is None:
            return jsonify({"status": "error", "message": "Map not found."}), 404
        
        elif mapdb["status"] == 2:
            return jsonify({"status": "error", "message": "Map is already ranked."}), 400   
        
        elif mapdb["frozen"] == 1:
            return jsonify({"status": "error", "message": "Map is frozen, ranking is not allowed."}), 400
        
        try:
            glob.db.execute("UPDATE maps SET status = 2 WHERE id = %s", [map])
        
        except Exception as e:
            return jsonify({"status": "error","message": f"Failed to rank map {map}.","Error": f"{e}"}), 500
        
        return jsonify({"status": "success", "message": f"Successfully ranked map {map}!"}), 200

    elif action == "unrank":
        if Privileges.ManageBeatmaps not in GetPriv(session["user_data"]["priv"]):
            return jsonify({"status": "error","message": "You have insufficient privileges to perform this action."}), 403
        
        if map is None:
            return jsonify({"status": "error", "message": "'map' not specified."}), 400
    
        mapdb = await glob.db.fetch("SELECT * FROM maps WHERE id = '{map}'")
        if mapdb is None:
            return jsonify({"status": "error", "message": "Map not found."}), 404
        
        elif mapdb["status"] == 0:
            return jsonify({"status": "error", "message": "Map is not already ranked."}), 400   
        
        elif mapdb["frozen"] == 1:
            return jsonify({"status": "error", "message": "Map is frozen, ranking is not allowed."}), 400
        
        try:
            glob.db.execute("UPDATE maps SET status = 2 WHERE id = %s", [map])
        
        except Exception as e:
            return jsonify({"status": "error","message": f"Failed to unrank map {map}.","Error": f"{e}"}), 500
        
        return jsonify({"status": "success", "message": f"Successfully unranked map {map}!"}), 200

    elif action == "love":
        if Privileges.ManageBeatmaps not in GetPriv(session["user_data"]["priv"]):
            return jsonify({"status": "error","message": "You have insufficient privileges to perform this action."}), 403
        
        if map is None:
            return jsonify({"status": "error", "message": "'map' not specified."}), 400
    
        mapdb = await glob.db.fetch("SELECT * FROM maps WHERE id = '{map}'")

        if mapdb is None:
            return jsonify({"status": "error", "message": "Map not found."}), 404
        
        elif mapdb["status"] == 5:
            return jsonify({"status": "error", "message": "Map is already loved.."}), 400   
        
        elif mapdb["frozen"] == 1:
            return jsonify({"status": "error", "message": "Map is frozen, loving is not allowed."}), 400
        
        try:
            glob.db.execute("UPDATE maps SET status = 2 WHERE id = %s", [map])
        
        except Exception as e:
            return jsonify({"status": "error","message": f"Failed to love map {map}.","Error": f"{e}"}), 500
        
        return jsonify({"status": "success", "message": f"Successfully loved map {map}!"}), 200

    elif action == "unlove":
        if Privileges.ManageBeatmaps not in GetPriv(session["user_data"]["priv"]):
            return jsonify({"status": "error","message": "You have insufficient privileges to perform this action."}), 403
        
        if map is None:
            return jsonify({"status": "error", "message": "'map' not specified."}), 400
    
        mapdb = await glob.db.fetch("SELECT * FROM maps WHERE id = '{map}'")
        if mapdb is None:
            return jsonify({"status": "error", "message": "Map not found."}), 404
        
        elif mapdb["status"] != 5:
            return jsonify({"status": "error", "message": "Map is not already loved."}), 400   
        
        elif mapdb["frozen"] == 1:
            return jsonify({"status": "error", "message": "Map is frozen, loving is not allowed."}), 400
        
        try:
            glob.db.execute("UPDATE maps SET status = 2 WHERE id = %s", [map])
        
        except Exception as e:
            return jsonify({"status": "error","message": f"Failed to unlove map {map}.","Error": f"{e}"}), 500
        
        return jsonify({"status": "success", "message": f"Successfully unlove map {map}!"}), 200

    elif action == "addbadge":
        if Privileges.ManageBadges not in GetPriv(session["user_data"]["priv"]):
            return jsonify({"status": "error","message": "You have insufficient privileges to perform this action."}), 403

        if (await request.form).get("user") is None:
            return jsonify({"status": "error", "message": "'user' not specified."}), 400

        user = await glob.db.fetch(
            "SELECT id, name FROM users WHERE id = %s", [(await request.form).get("user")]
        )
        if user is None:
            return jsonify({"status": "error", "message": "User not found."}), 404
        badgeid = (await request.form).get("badge")
        if badgeid is None:
            return jsonify({"status": "error", "message": "'badge' not specified."}), 400
        
        try:
            query = f"""
                INSERT INTO user_badges (userid, badge_id)
                VALUES ({user['id']}, {badgeid});
                """

            await glob.db.execute(query)
            # Log Action
            current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            await log(session["user_data"]["id"], user["id"], "addbadge", "", current_time)
            return jsonify({"status": "success", "message": f"Successfully added badge to {user['name']} ({user['id']})!"}), 200
        except Exception as e:
            return jsonify({"status": "error","message": f"Failed to add badge to {user['name']} ({user['id']}).","Error": f"{e}"}), 500
        
    elif action == "removebadge":
        if Privileges.ManageBadges not in GetPriv(session["user_data"]["priv"]):
            return jsonify({"status": "error", "message": "You have insufficient privileges to perform this action."}), 403

        user = (await request.form).get("user")
        if user is None:
            return jsonify({"status": "error", "message": "'user' not specified."}), 400

        user = await glob.db.fetch("SELECT id, name FROM users WHERE id = %s", [user])
        if user is None:
            return jsonify({"status": "error", "message": "User not found."}), 404

        badgeid = (await request.form).get("badge")
        if badgeid is None:
            return jsonify({"status": "error", "message": "'badge' not specified."}), 400

        try:
            query = f"""
                DELETE FROM user_badges
                WHERE userid = {user['id']} AND badge_id = {badgeid};
                """

            await glob.db.execute(query)
            # Log Action
            current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            await log(session["user_data"]["id"], user["id"], "removebadge", "", current_time)
            return jsonify({"status": "success", "message": f"Successfully removed badge from {user['name']} ({user['id']})!"}), 200
        except Exception as e:
            return jsonify({"status": "error", "message": f"Failed to remove badge from {user['name']} ({user['id']}).", "Error": f"{e}"}), 500
        
    else:
        return jsonify({"status": "error","message": "Invalid action. {action} is not a valid action."}),400
    

async def log(mod: int, user: int, action: str, msg: str, time) -> None:
    """
    Logs an action performed by a user.

    Args:
        mod (int): The moderator ID, usually session['user_data']['id'].
        user (int): The user ID.
        action (str): The action performed.
        msg (str): Additional message.
        time (datetime): The timestamp of the action.

    Returns:
        None
    """
    if msg == "":
        msg = "No reason specified."
    #NOTE, cuz loki didn't know; from, to and action are reserved keywords in mysql. so we have to use backticks around them.
    query = f"""
    INSERT INTO logs (`from`, `to`, `action`, msg, time)
    VALUES ({mod}, {user}, '{action}', '{msg}', '{time}');
    """

    # if you really want, put this in a try/except block.
    await glob.db.execute(query)
    
    #TODO: post to discord webhook. use env for the url, please.

    
    