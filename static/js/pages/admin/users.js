new Vue({
    el: "#users",
    delimiters: ["<%", "%>"],
    data() {
        return {
            flags: window.flags,
            users: {},
            page: 1,
            userquery: '', // changed from 'search' to 'userquery'
            load: false,
            playersLoading: false,
            searchTimeout: null,
        }
    },
    created() {
        console.log('Users.js User Page Created');
        this.handleUserInput(userquery);
    },
    methods: {
        handleUserInput() {
            clearTimeout(this.searchTimeout);
            if (this.userquery.length > 0)
                this.searchTimeout = setTimeout(() => {
                    const queryUsers = this.userquery;
                    const url = `/admin/users/${this.page}?update=true&search=${queryUsers}`;
                    fetch(url)
                        .then(response => response.json())
                        .then(data => {
                            this.users = data;
                            console.log('users:', this.users);
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                }, 500);
            else {
                const queryUsers = this.userquery;
                const url = `/admin/users/${this.page}?update=true&search=${queryUsers}`;
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        this.users = data;
                        console.log('users:', this.users);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                
            }
        },
        editUser(userid) {
            editUserBus.$emit('showEditUserPanel', userid);
            console.log('Edit User Window Trigger Emitted');
        },
    },
    computed: {
    }
});
var editUserBus = new Vue();
new Vue({
    el: "#editUserWindow",
    delimiters: ["<%", "%>"],
    data() {
        return {
            flags: window.flags,
            show: false,
            user: {},
            load: false,
            playerLoading: false,
            module: 'Account' // added module data property
        }
    },
    methods: {
        close: function() {
            this.show = false;
        },
        LoadUserEditor(module) {
            console.log(`Loading ${module} editor...`); // placeholder print statement
            this.module = module;
        },
        fetchSelectedUser(userid) {
            const url = `/admin/user/${userid}`;
            fetch(url)
                
                .then(response => response.json())
                .then(data => {
                    this.user = data;
                    console.log('User:', this.user);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        },
        postAction(url, userId) {
            const formData = new URLSearchParams();
            formData.append('user', userId);
        
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });
        }
    },
    created: function() {
        editUserBus.$on('showEditUserPanel', (userid) => {
            console.log('Edit User Window Triggered')
            this.userid = userid;
            this.fetchSelectedUser(userid);
            this.show = true;
        });
    },
    computed: {
    },
    template: `
        <div id="editUserWindow" class="modal" v-bind:class="{ 'is-active': show }">
            <div class="modal-background" @click="close"></div>
            <div id="editUserWindow" class="modal-content" v-if="show">
                <div id="editUser" class="box">
                    <div id="editUser" class="user-banner" >
                        <div id="editUserBanner" class="user-banner-background" :style="'background-image: url(/banners/' + userid + ')'" alt="User Banner">
                        
                            <div class="info-block">
                                <h1 class="title">
                                    <p class="ranks">
                                        <img :src="'/static/images/flags/' + user.country.toUpperCase() + '.png'" class="user-flag">
                                        <span class="bgf"><% user.name %></span>
                                    </p>
                                </h1>

                            </div>
                        </div>
                        <div class="user-flex">
                            <div class="user-avatar-area">
                                <img :src="'https://a.' + domain + '/' + userid" alt="avatar" class="rounded-avatar user-avatar"
                                    onError="this.src='/static/images/avatar_notwork.png';">
                            </div>
                            <div class="bar-selection mode-selects">
                            <div id="editUser" class="select-left">
                            <a class="simple-banner-switch" v-bind:class="{ 'active': module === 'Account' }"
                            @click="LoadUserEditor('Account', module)">
                                <i class="fas fa-user"></i><span class="modetext"> Account </span>
                            </a>
                            <a class="simple-banner-switch" v-bind:class="{ 'active': module === 'Badges' }"
                            @click="LoadUserEditor('Badges', module)">
                                <i class="fas fa-certificate"></i><span class="modetext"> Badges </span>
                            </a>
                            <a class="simple-banner-switch" v-bind:class="{ 'active': module === 'Logs' }"
                            @click="LoadUserEditor('Logs', module)">
                                <i class="fas fa-book"></i><span class="modetext"> Logs </span>
                            </a>
                        </div>
                            </div>
                            <div class="bar-selection badge-selects">
                                <span>
                                    This user has no badges.
                                </span>
                            </div>
                        </div>
                    </div>
                    <div id="editUser" class="main-block">
                        <div v-if="module === 'Account'">
                            <div class="content">
                                <div class="column">
                                    <span class="title is-4 is-centered">Quick Actions</span>
                                    <div id="quickActions" class="level is-centered">
                                        <div class="level-item">
                                            <button class="button is-danger" @click="postAction('/admin/action/wipe', user.id)">Wipe</button>
                                        </div>
                                        <div class="level-item">
                                            <button class="button is-warning" @click="postAction('/admin/action/restrict', user.id)">Restrict</button>
                                        </div>
                                        <div class="level-item">
                                            <button class="button is-success" @click="postAction('/admin/action/unrestrict', user.id)">Unrestrict</button>
                                        </div>
                                        <div class="level-item">
                                            <button class="button is-info" @click="postAction('/admin/action/silence', user.id)">Silence</button>
                                        </div>
                                        <div class="level-item">
                                            <button class="button is-primary" @click="postAction('/admin/action/unsilence', user.id)">Unsilence</button>
                                        </div>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                        <div v-if="module === 'Badges'">
                            <div class="content">
                                <div class="column">
                                    <span class="title is-4 is-centered">Quick Actions</span>
                                    <div class="level is-centered">
                                        <div class="level-item">
                                        </div>
                                    </div>
                                </div>
                                <p>Badges editor placeholder</p> <!-- placeholder print statement -->
                            </div>
                        </div>
                        <div v-if="module === 'Logs'">
                            <div class="content">
                                <div class="column">
                                    <span class="title is-4 is-centered">Quick Actions</span>
                                    <div class="level is-centered">
                                        <div class="level-item">
                                        </div>
                                    </div>
                                </div>
                                <p>Logs editor placeholder</p> <!-- placeholder print statement -->
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
});