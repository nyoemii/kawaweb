# -*- coding: utf-8 -*-
from __future__ import annotations

import os
from datetime import date

from dotenv import load_dotenv

load_dotenv()

def read_list(value: str) -> list[str]:
    return [v.strip() for v in value.split(",")]

# app name
app_name = os.environ["APP_NAME"]

# secret key
secret_key = os.environ["SECRET_KEY"]

#hCaptcha settings:
hCaptcha_sitekey = os.environ["HCAPTCHA_SITEKEY"]
hCaptcha_secret = os.environ["HCAPTCHA_SECRET"]

# domain (used for api, avatar, etc)
domain = os.environ["DOMAIN"]

# max image size for avatars, in megabytes
max_image_size = int(os.environ["MAX_IMAGE_SIZE"])
max_image_size_supporter = int(os.environ["MAX_IMAGE_SIZE_SUPPORTER"])

# mysql credentials
mysql = {
    'db': os.environ["MYSQL_DB"],
    'host': os.environ["MYSQL_HOST"],
    'user': os.environ["MYSQL_USER"],
    'password': os.environ["MYSQL_PASSWORD"],
}

# path to gulag root (must have leading and following slash)
path_to_gulag = os.environ["PATH_TO_GULAG"]

# enable debug (disable when in production to improve performance)
debug = os.environ["DEBUG"]

# disallowed names (hardcoded banned usernames)
disallowed_names = read_list(os.environ["DISALLOWED_NAMES"])

# disallowed passwords (hardcoded banned passwords)
disallowed_passwords = read_list(os.environ["DISALLOWED_PASSWORDS"])

# enable registration
registration = os.environ["ENABLE_REGISTRATION"]

# social links (used throughout guweb)
github = 'https://github.com/kawatapw/kawaweb'
discord_server = 'https://discord.com/invite/kawata-451130713627164683'
youtube = 'https://youtube.com/'
twitter = 'https://twitter.com/'
instagram = 'https://instagram.com/'
