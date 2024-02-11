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
            isNewBadge: false,
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
            const url = this.isNewBadge ? '/admin/badge/create' : `/admin/badge/${this.badge.id}/update`;
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.badge),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                this.close();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        },
        addStyle() {
            this.badge.styles.push({ type: '', value: '' });
        },
        newBadge() {
            this.badge = {
                name: '',
                description: '',
                priority: 0,
                styles: [],
            };
            this.isNewBadge = true;
            this.show = true;
        },
    },
    created: function() {
        editBadgeBus.$on('showEditBadgePanel', (badgeid) => {
            console.log('Edit Badge Window Triggered')
            this.isNewBadge = false;
            this.fetchSelectedBadge(badgeid);
            this.show = true;
        });
        editBadgeBus.$on('showNewBadgePanel', () => {
            console.log('New Badge Window Triggered')
            this.newBadge();
        });
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
                        <p>
                        Required Styles: color (Hue Angle), icon (eg. fas fa-heart).</br>
                        Supported Styles: 
                        </p>
                        <div class="columns" v-for="(style, index) in badge.styles" :key="index" style="margin-top: 10px; margin-bottom: 10px;">
                            <div class="column">
                                <div class="field">
                                    <label class="label">Type</label>
                                    <div class="control">
                                        <input class="input" type="text" v-model="style.type">
                                    </div>
                                </div>
                            </div>
                            <div class="column">
                                <div class="field">
                                    <label class="label">Value</label>
                                    <div class="control">
                                        <input class="input" type="text" v-model="style.value">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button class="button is-primary" type="button" @click="addStyle">Add Style</button>
                        <button class="button is-primary" type="submit">Save</button>
                    </form>
                </div>
            </div>
        </div>
    `
});