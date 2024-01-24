new Vue({
    el: "#beatmaps",
    delimiters: ["<%", "%>"],
    data() {
        return {
            flags: window.flags,
            reqs: {},
            beatmaps: {},
        }
    },
    async beforeCreate() {
    },
    created() {
        console.log('Beatmaps.js Beatmaps Page Created');
    },
    methods: {
        
        editMap(beatmap) {
            editMapBus.$emit('showEditBeatmapPanel', beatmap);
        },
    },
    computed: {
    }
});
var editMapBus = new Vue();
new Vue({
    el: "#editBeatmapWindow",
    delimiters: ["<%", "%>"],
    data() {
        return {
            flags: window.flags,
            show: false,
            beatmap: {},
        }
    },
    methods: {
        close: function() {
            this.show = false;
        },
    },
    created: function() {
        editMapBus.$on('showEditBeatmapPanel', (map) => {
            console.log('Edit Beatmap Window Triggered')
            console.log(map);
            this.beatmap = map;
            console.log(this.beatmap);
            this.show = true;
        });
    },
    computed: {
        statusInfo() {
            const statuses = ['Pending', 'Update Available', 'Ranked', 'Approved', 'Qualified', 'Loved'];
            const statusClasses = ['pending', 'update', 'ranked', 'approved', 'qualified', 'loved'];
            const status = this.beatmap.map_info.status;
            return {
                text: statuses[status],
                class: statusClasses[status]
            };
        },
    },
    template: `
        <div class="modal" id="editBeatmapWindow" v-bind:class="{ 'is-active': show }">
            <div class="modal-background" @click="close"></div>
            <div data-panel="changeBeatmapStatus" id="beatmap-window" class="modal-content" v-if="show">
                <div class="main-block">
                    <div class="banner" :style="'background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://assets.ppy.sh/beatmaps/' + beatmap['map_info']['set_id'] + '/covers/card@2x.jpg)'">
                        <h1 class="title"><% beatmap['map_info']['title'] %></br><% beatmap['map_info']['artist'] %></h1>
                    </div>
                    <div class="beatmap-requester">
                        <h1 class="title">Requested By</h1>
                        <h2><img :src="'/static/images/flags/' + beatmap.player.country.toUpperCase() + '.png'" class="user-flag">
                        <span class="bgf"><% beatmap['player']['name'] %></span></h2>
                    </div>
                    <div :class="'status ' + statusInfo.class">
                        <h3><% statusInfo.text %></h3>
                    </div>
                </div>
                <div class="second-block">
                    <div class="content">
                        <div class="beatmap-block">
                            <div class="beatmap-section">
                                <h1 class="title">Requested Map/Diff:</h1>
                                <div class="beatmap-content">
                                    <div class="beatmap-info">
                                        <h3 class="subtitle"><% beatmap['map_info']['version'] %></h3>
                                    </div>
                                    <div class="beatmap-subsection">
                                    
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
});