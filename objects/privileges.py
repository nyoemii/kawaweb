# -*- coding: utf-8 -*-

from enum import IntFlag
from enum import unique

__all__ = ('Privileges',)

@unique
class Privileges(IntFlag):
    """Server side user privileges."""

    Banned              = 0        # user is banned
    Normal              = 1        # user is not restricted.
    Verified            = 2 << 0   # has logged in to the server in-game.
    Supporter           = 2 << 1   # user is a supporter.
    AccessPanel         = 2 << 2   # probably wont be used much.    
    ManageUsers         = 2 << 3   # can manage users? probably going to be used for changing passwords/email/etc
    RestrictUsers            = 2 << 4   # can ban users
    SilenceUsers        = 2 << 5   # can silence users
    WipeUsers           = 2 << 6   # can wipe users
    ManageBeatmaps      = 2 << 7   # able to manage maps ranked status.
    #ManageServers      = 2 << 8  
    #ManageSettings     = 2 << 9  
    #ManageBetaKeys     = 2 << 10  
    #ManageReports      = 2 << 11  
    #ManageDocs         = 2 << 12  
    ManageBadges        = 2 << 13  # can manage badges
    ViewPanelLog        = 2 << 14  # can view the panel log
    ManagePrivs         = 2 << 15  # can manage privs of users
    SendAlerts          = 2 << 16  # can send in-game alerts? probably not going to be used much
    ChatMod             = 2 << 17  # chat mod, no way
    KickUsers           = 2 << 18  # can kick users
    #PendingVerify      = 2 << 19  # completely deprecated, unused. dont use this.
    Tournament          = 2 << 20  # able to manage match state without host.
    #Caker              = 2 << 21  # what is this??
    ManageClans         = 2 << 27  # can manage clans.
    ViewSensitiveInfo   = 2 << 28  # can view ips, hwids, disk ids of users. super awesome with the new system.
    IsBot               = 2 << 30  # BOT_USER
    Whitelisted         = 2 << 31  # has bypass to low-ceiling anticheat measures (trusted).
    Premium             = 2 << 32  # 'premium' donor
    Alumni              = 2 << 33  # notable users, receives some extra benefits.
    Dangerous           = 2 << 34  # able to manage full server app.state.




    Nominator = ManageBeatmaps | AccessPanel
    Mod = RestrictUsers | SilenceUsers | WipeUsers | KickUsers| ManagePrivs | ChatMod # define this as a moderator
    Admin = Mod | ViewSensitiveInfo | ManageUsers  # has moderator privileges, can view sensitive info and manage users
    

    Donator = Supporter | Premium
    Staff = Mod | Admin | Dangerous

def getintfrompriv(privs):
    privint = 0
    privs = [Privileges[priv] for priv in privs]
    for priv in privs:
        privint |= priv.value
    return privint
print(getintfrompriv(['Staff','Normal','Verified','Alumni','Premium','Supporter','Whitelisted']))
def ComparePrivs(l1,l2):
    if l1 is not list or l2 is not list:
        l1 = getprivfromint(l1)
        l2 = getprivfromint(l2)
    s1 = set(l1)
    s2 = set(l2)
    return s2.issubset(s1)

def getprivfromint(privint):
    privs = [priv for priv in Privileges if privint & priv]
    if len(privs) == 0:
        raise ValueError("No Privileges")
    return privs