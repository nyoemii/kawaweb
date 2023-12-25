# -*- coding: utf-8 -*-

__all__ = ()

import datetime
import hashlib
from typing import Literal
import bcrypt

import timeago
from quart import Blueprint, jsonify, request, render_template, session

from objects import glob
from objects.utils import flash, get_safe_name
from objects.privileges import Privileges, ComparePrivs

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

    # Get user badges
    user_badges = await glob.db.fetchall(
        "SELECT badge_id FROM user_badges WHERE userid = %s",
        (userid,),
    )

    # Get badge information for each badge
    badges = []
    for badge in user_badges:
        badge_info = await glob.db.fetch(
            "SELECT * FROM badges WHERE id = %s",
            (badge['badge_id'],),
        )
        badge_styles = await glob.db.fetchall(
            "SELECT * FROM badge_styles WHERE badge_id = %s",
            (badge['badge_id'],),
        )
        badge_info['badge_styles'] = badge_styles
        badges.append(badge_info)

    user['badges'] = badges

    # Return JSON response
    return jsonify(user)

@admin.route('/badges')
async def badges():
    """Render the homepage of guweb's admin panel."""
    if not 'authenticated' in session:
        return await flash('error', 'Please login first.', 'login')

    if not session['user_data']['is_staff']:
        return await flash('error', f'You have insufficient privileges.', 'home')

    # Get all badges
    badges = await glob.db.fetchall("SELECT * FROM badges")

    # Get badge styles for each badge
    for badge in badges:
        badge_styles = await glob.db.fetchall(
            "SELECT * FROM badge_styles WHERE badge_id = %s",
            (badge['id'],),
        )
        badge['styles'] = badge_styles

    # Return JSON response
    return await render_template(
        'admin/badges.html', badges=badges, 
        datetime=datetime, timeago=timeago
    )

@admin.route('/badge/<int:badgeid>')
async def badge(badgeid):
    """Render the homepage of guweb's admin panel."""
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

    if not request.content_type == "x-www-form-urlencoded":
        return jsonify({"status": "error","message": "Invalid content type. use application/x-www-form-urlencoded."}), 400

    if action == "restrict":
        if (session["user_data"]["priv"] and Privileges.RestrictUsers) == 0:
            return jsonify({"status": "error","message": "You have insufficient privileges to perform this action."}),403
        if request.form.get("user") is None:
            return jsonify({"status": "error", "message": "'user' not specified."}), 400
        user = await glob.db.fetch(
            "SELECT id, name, priv FROM users WHERE id = %s", [request.form.get("user")]
        )
        if user is None:
            return jsonify({"status": "error", "message": "User not found."}), 404

        if user["priv"] != 0:  # TODO: logging? take in form.get('reason')?
            await glob.db.execute(
                "UPDATE users SET priv = 0 WHERE id = %s", [user["id"]]
            )
            return jsonify({"status": "success","message": f"Successfully restricted {user['name']} ({user['id']})!"}),200

        else:
            return jsonify({"status": "error","message": f"{user['name']} ({user['id']}) is already restricted."}),400

    elif action == "unrestrict":
        if (session["user_data"]["priv"] and Privileges.RestrictUsers) == 0:
            return jsonify({"status": "error","message": "You have insufficient privileges to perform this action."}), 403

        if request.form.get("user") is None:
            return jsonify({"status": "error", "message": "'user' not specified."}), 400
        user = await glob.db.fetch(
            "SELECT id, name, priv FROM users WHERE id = %s", [request.form.get("user")]
        )
        if user is None:
            return jsonify({"status": "error", "message": "User not found."}), 404
        if user["priv"] != 0:
            return jsonify({"status": "error", "message": f"{user['name']} is not restricted."}), 400

        else:
            await glob.db.execute(
                "UPDATE users SET priv = 1 WHERE id = %s", [user["id"]]
            )
            return jsonify({"status": "success","message": f"Successfully unrestricted {user['name']} ({user['id']})!"}), 200

    elif action == "silence":
        if (session["user_data"]["priv"] and Privileges.SilenceUsers) == 0:
            return jsonify({"status": "error","message": "You have insufficient privileges to perform this action."}), 403

        if request.form.get("user") is None:
            return jsonify({"status": "error", "message": "'user' not specified."}), 400

        if request.form.get("duration") is None:  # in hours, jsyk.
            return jsonify({"status": "error", "message": "'duration' not specified."}), 400
        try:
            duration = int(request.form.get("duration"))
        except ValueError:
            return jsonify({"status": "error", "message": "Invalid duration."}), 400

        user = await glob.db.fetch(
            "SELECT id, name, silence_end FROM users WHERE id = %s",
            [request.form.get("user")],
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
                return jsonify({"status": "success","message": f"Successfully silenced {user['name']} ({user['id']})!"}),200

            except Exception as e:
                return jsonify({"status": "error","message": f"Failed to silence {user['name']} ({user['id']}).","Error": f"{e}"}), 500

    elif action == "unsilence":
        if (session["user_data"]["priv"] and Privileges.SilenceUsers) == 0:
            return jsonify({"status": "error","message": "You have insufficient privileges to perform this action."}), 403
        if request.form.get("user") is None:
            return jsonify({"status": "error", "message": "'user' not specified."}), 400

        user = await glob.db.fetch(
            "SELECT id, name, silence_end FROM users WHERE id = %s",
            [request.form.get("user")],
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
                return jsonify({"status": "success","message": f"Successfully unsilenced {user['name']} ({user['id']})!"}), 200

            except Exception as e:
                return jsonify({"status": "error","message": f"Failed to unsilence {user['name']} ({user['id']}).","Error": f"{e}"}),500

    elif action == "wipe":
        if (session["user_data"]["priv"] and Privileges.WipeUsers) == 0:
            return jsonify({"status": "error","message": "You have insufficient privileges to perform this action."}), 403

        if request.form.get("user") is None:
            return jsonify({"status": "error", "message": "'user' not specified."}), 400

        user = await glob.db.fetch(
            "SELECT id, name FROM users WHERE id = %s", [request.form.get("user")]
        )

        if user is None:
            return jsonify({"status": "error", "message": "User not found."}), 404

        try:
            modes = [0, 1, 2, 3, 4, 5, 6, 7, 8]
            for mode in modes:
                query = f"""
                INSERT INTO stats (id, mode, tscore, rscore, pp, plays, playtime, acc, max_combo, total_hits, replay_views, xh_count, x_count, sh_count, s_count, a_count)
                VALUES
                ({user['id']}, '{mode}', 0, 0, 0, 0, 0, 0.000, 0, 0, 0, 0, 0, 0, 0, 0);
                """

                await glob.db.execute(query)

                return jsonify({"status": "success", "message": f"Successfully wiped {user['name']} ({user['id']})!"}), 200

        except Exception as e:
            return jsonify({"status": "error","message": f"Failed to wipe {user['name']} ({user['id']}).","Error": f"{e}"}), 500

    elif action == "changepassword":
        form = request.form
        user = form.get("user")
        password = form.get("password")

        if (session["user_data"]["priv"] and Privileges.ManageUsers) == 0:
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

        if (session["user_data"]["priv"] & (Privileges.ManageUsers | Privileges.ManagePrivs)) == 0:
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

    #TODO: implement these. since i forgor initially
    elif action == "rank":
        pass

    elif action == "unrank":
        pass

    elif action == "love":
        pass

    elif action == "unlove":
        pass

    else:
        return jsonify({"status": "error","message": "Invalid action. {action} is not a valid action."}),400