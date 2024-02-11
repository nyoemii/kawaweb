new Vue({
    el: "#app",
    delimiters: ["<%", "%>"],
    data() {
        return {
            flags: window.flags,
            boards: {},
            mode: 'std',
            mods: 'vn',
            sort: 'pp',
            load: false,
            no_player: false, // soon
        };
    },
    created() {
        this.LoadData(mode, mods, sort);
        this.LoadLeaderboard(sort, mode, mods);
    },
    methods: {
        LoadData(mode, mods, sort) {
            this.$set(this, 'mode', mode);
            this.$set(this, 'mods', mods);
            this.$set(this, 'sort', sort);
        },
        LoadLeaderboard(sort, mode, mods) {
            if (window.event)
                window.event.preventDefault();

            window.history.replaceState('', document.title, `/leaderboard/${this.mode}/${this.sort}/${this.mods}`);
            this.$set(this, 'mode', mode);
            this.$set(this, 'mods', mods);
            this.$set(this, 'sort', sort);
            this.$set(this, 'load', true);
            this.$axios.get(`${window.location.protocol}//api.${domain}/v1/get_leaderboard`, {
                params: {
                    mode: this.StrtoGulagInt(),
                    sort: this.sort
                }
            }).then(res => {
                this.boards = res.data.leaderboard;
                this.$set(this, 'load', false);
            });
        },
        scoreFormat(score) {
            var addCommas = this.addCommas;
            if (score > 1000 * 1000) {
                if (score > 1000 * 1000 * 1000)
                    return `${addCommas((score / 1000000000).toFixed(2))} billion`;
                return `${addCommas((score / 1000000).toFixed(2))} million`;
            }
            return addCommas(score);
        },
        addCommas(nStr) {
            nStr += '';
            var x = nStr.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        },
        StrtoGulagInt() {
            switch (this.mode + "|" + this.mods) {
                case 'std|vn':
                    return 0;
                case 'taiko|vn':
                    return 1;
                case 'catch|vn':
                    return 2;
                case 'mania|vn':
                    return 3;
                case 'std|rx':
                    return 4;
                case 'taiko|rx':
                    return 5;
                case 'catch|rx':
                    return 6;
                case 'std|ap':
                    return 8;
                default:
                    return -1;
            }
        },
    },
});
Vue.component('user-profile', {
    props: ['user'],
    template: `
    <span :id="user.player_id" class="user-name" @mouseover="showProfile" @mouseout="hideProfile">
        <a :href="'/u/'+user.player_id+'?mode='+mode+'&mods='+mods">
            {{ user.name }}
        </a>
        <div :id="user.player_id" class="profile-panel" v-bind:style="{ display: profileStyle }">
            <div class="profile-panel-background" :style="'background-image: url(/backgrounds/' + user.player_id + ')'"></div>
            <div class="profile-panel-avatar" :style="'background-image: url(https://a.' + domain + '/' + user.player_id + ')'"></div>
            <div class="profile-panel-info">
                <div class="name">
                    <span v-if="user.clan_tag">
                        <a>
                            [{{ user.clan_tag }}]
                        </a>
                    </span>
                    {{ user.name }}
                </div>
                <div class="Badges">
                    <badge v-for="badge in user.badges" :badge="badge" :type="1"></badge>
                </div>
            </div>
        </div>
    </span>
    `,
    data: function() {
        return {
            profileVisible: false,
            badgePopupVisible: false,
            badgePopupTop: 0,
            badgePopupLeft: 0,
        };
    },
    methods: {
        showProfile: function() {
            this.profileVisible = true;
        },
        hideProfile: function() {
            this.profileVisible = false;
        },
        showBadgePopup: function(event, badge) {
            if (this.badgePopupVisible != badge.id) {
                this.badgePopupVisible = badge.id;
                // Calculate the position of the badge popup relative to the badge icon
                const badgeIcon = event.target;
                const badgeIconRect = badgeIcon.getBoundingClientRect();
                this.badgePopupTop = badgeIconRect.top + badgeIconRect.height + 6 + 'px';
                this.badgePopupLeft = badgeIconRect.left + 'px';
            }
            },
        hideBadgePopup: function() {
            this.badgePopupVisible = false;
        }
    },
    computed: {
        profileStyle: function() {
            return this.profileVisible ? 'flex !important' : 'none !important';
        }
    }
});
