document.addEventListener('DOMContentLoaded', function () {
    new Vue({
        el: "#badges",
        delimiters: ["<%", "%>"],
        data() {
            return {
                flags: window.flags,
                badges: badges,
            }
        },
        created() {
            console.log('Badges.js Badges Page Created');
            console.log('Badges:', this.badges);
        },
        methods: {

            editBadge(badgeid) {
                editBadgeBus.$emit('showEditBadgePanel', badgeid);
            },
        },
        computed: {
        }
    });
});
var editBadgeBus = new Vue();
new Vue({
    el: "#editBadgeWindow",
    delimiters: ["<%", "%>"],
    data() {
        return {
            flags: window.flags,
            show: false,
            badge: {},
            
        }
    },
    methods: {
        close: function() {
            this.show = false;
        },
        fetchSelectedBadge(badgeid) {
            const url = `/admin/badge/${badgeid}`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    this.badge = data;
                    console.log('Badge:', this.badge);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        },
        saveBadge() {
            // Code to save the badge's name, description, and priority
        },
        saveStyles() {
            // Code to save the badge styles
        }
    },
    created: function() {
        editBadgeBus.$on('showEditBadgePanel', (badgeid) => {
            console.log('Edit Badge Window Triggered')
            this.badgeid = badgeid;
            this.fetchSelectedBadge(badgeid);
            this.show = true;
        });
    },
    computed: {
    },
    template: `
        <div id="editBadgeWindow" class="modal" v-bind:class="{ 'is-active': show }">
            <div class="modal-background" @click="close"></div>
            <div id="editBadgeWindow" class="modal-content" v-if="show">
                <div id="editBadge" class="box">
                    <h2>Edit Badge</h2>
                    <form @submit.prevent="saveBadge">
                        <div class="field">
                            <label class="label">Name</label>
                            <div class="control">
                                <input class="input" type="text" v-model="badge.name">
                            </div>
                        </div>
                        <div class="field">
                            <label class="label">Description</label>
                            <div class="control">
                                <textarea class="textarea" v-model="badge.description"></textarea>
                            </div>
                        </div>
                        <div class="field">
                            <label class="label">Priority</label>
                            <div class="control">
                                <input class="input" type="number" v-model="badge.priority">
                            </div>
                        </div>
                        <h2>Edit Badge Styles</h2>
                        <div class="columns">
                            <div class="column">
                                <div class="field">
                                    <label class="label">Type</label>
                                    <div class="control">
                                        <input class="input" type="text" v-model="badge.styles[0].type">
                                    </div>
                                </div>
                            </div>
                            <div class="column">
                                <div class="field">
                                    <label class="label">Value</label>
                                    <div class="control">
                                        <input class="input" type="text" v-model="badge.styles[0].value">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="columns">
                            <div class="column">
                                <div class="field">
                                    <label class="label">Type</label>
                                    <div class="control">
                                        <input class="input" type="text" v-model="badge.styles[1].type">
                                    </div>
                                </div>
                            </div>
                            <div class="column">
                                <div class="field">
                                    <label class="label">Value</label>
                                    <div class="control">
                                        <input class="input" type="text" v-model="badge.styles[1].value">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button class="button is-primary" type="submit">Save</button>
                    </form>
                </div>
            </div>
        </div>
    `
});