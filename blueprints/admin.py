# -*- coding: utf-8 -*-

__all__ = ()

import datetime

import timeago
from quart import Blueprint
from quart import render_template
from quart import session

from objects import glob
from objects.utils import flash

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
@admin.route('/users/<int:page>/<search>')
async def users(page=None, search=None):
    """Render the homepage of guweb's admin panel."""
    if not 'authenticated' in session:
        return await flash('error', 'Please login first.', 'login')

    if not session['user_data']['is_staff']:
        return await flash('error', f'You have insufficient privileges.', 'home')

    # fetch data from database
    if page == None or page < 1:
        page = 1
    Offset = 50 * (page - 1)  # for the page system to work

    if search is not None:
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

    return await render_template(
        'admin/users.html', users=users, page=page, search=search,
        datetime=datetime, timeago=timeago
    )
