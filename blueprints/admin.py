# -*- coding: utf-8 -*-

__all__ = ()

import datetime
import hashlib
from operator import is_
from typing import Literal
import bcrypt

import timeago
from quart import Blueprint, jsonify, request, render_template, session

from objects import glob
from objects.utils import flash, get_safe_name
from objects.privileges import Privileges, ComparePrivs, GetPriv

admin = Blueprint('admin', __name__)

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

    
    