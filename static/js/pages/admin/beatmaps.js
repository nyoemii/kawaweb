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
            this.beatmap = map;
            console.log(this.beatmap);
            this.show = true;
        });
    },
    computed: {
    },
    template: `
        <div id="editBeatmapWindow" class="modal" v-bind:class="{ 'is-active': show }">
            <div class="modal-background" @click="close"></div>
            <div id="editMapWindow" class="modal-content" v-if="show">
                
            </div>
        </div>
    `
});