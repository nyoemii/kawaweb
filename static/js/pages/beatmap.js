new Vue({
    el: '#beatmap-window',
    data: {
        show: false,
        map: null,
    },
    methods: {
        close: function() {
            this.show = false;
            this.resetQuery();
        },
        fetchMapInfo: function() {
            fetch('https://api.kawata.pw/v1/get_map_info')
                .then(response => response.json())
                .then(data => {
                    this.map = data.map;
                });
        },
    },
    created: function() {
        bus.$on('show-beatmap-window', () => {
            this.show = true;
            this.fetchMapInfo();
        });
    },
    template: `
        <div v-if="show" class="beatmap-panel" :style="{ right: handedness === 'right' ? '0' : 'auto', left: handedness === 'left' ? '0' : 'auto' }">
            <h1>{{ map.title }}</h1>
            <p>{{ map.artist }}</p>
            <!-- Add more fields as needed -->
            <button @click="close">Close</button>
        </div>
    `
});