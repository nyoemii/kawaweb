Vue.component('badge', {
  props: {
    badge: {
      type: Object,
      required: true,
      validator: function (value) {
        return value !== null && typeof value === 'object' && value.hasOwnProperty('styles');
      }
    },
    type: {
      type: Number,
      default: 0,
      validator: function (value) {
        return [0, 1].includes(value);
      }
    },
    test: {
      type: Number,
      default: 0,
      validator: function (value) {
        return [0, 1].includes(value);
      }
    }
  },
  data: function () {
    return {
      showPanel: false
    }
  },
  watch: {
    type: function (newVal) {
      if (typeof newVal !== 'number') {
        this.type = Number(newVal);
      }
    }
  },
  created() {
    if (this.test === 1) {
      console.log('Type:', this.type);
      console.log('Badge:', this.badge);
      console.log('Type === 0:', this.type === 0);
      console.log('Type === 1:', this.type === 1);
    }
  },
  template: `
  <span data-popup="badge">
    <div v-if="type === 0" class="badge"  :style="'background-color: hsl(' + badge.styles.color + ', 20%, 30%); color: hsl(' + badge.styles.color + ', 100%, 80%);  border: 1px solid hsl(' + badge.styles.color + ', 40%, 35%);'" @mouseover="showPanel = true" @mouseleave="showPanel = false">
      <span class="icon" v-if="badge.styles.icon">
        <i v-bind:class="'' + badge.styles.icon"></i>
      </span>
      <span class="badge-name">
        {{ badge.name }}
      </span>
      <div class="badge-panel"  :style="'background-color: hsl(' + badge.styles.color + ', 20%, 20%); color: hsl(' + badge.styles.color + ', 100%, 80%);'">
        <h3>{{ badge.name }}</h3>
        <p>{{ badge.description }}</p>
        <!-- Add more badge details here -->
      </div>
    </div>
    <div v-if="type === 1" class="iconBadge"  :style="'background-color: hsl(' + badge.styles.color + ', 20%, 30%); color: hsl(' + badge.styles.color + ', 100%, 80%);  border: 1px solid hsl(' + badge.styles.color + ', 40%, 35%);'" @mouseover="showPanel = true" @mouseleave="showPanel = false">
      <span class="icon" v-if="badge.styles.icon">
        <i v-bind:class="'' + badge.styles.icon"></i>
      </span>
      <div class="badge-panel"  :style="'background-color: hsl(' + badge.styles.color + ', 20%, 20%); color: hsl(' + badge.styles.color + ', 100%, 80%);'">
        <h3>{{ badge.name }}</h3>
        <p>{{ badge.description }}</p>
        <!-- Add more badge details here -->
      </div>
    </div>
  </span>
  `
});



Vue.component('user-profile', {
    props: ['user'],
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
    },
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
});
