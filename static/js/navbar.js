var bus = new Vue();
new Vue({
    el: '#search-icon',
    data: {
        isAnimating: false
    },
    methods: {
        showSearchWindow: function() {
            bus.$emit('show-search-window');
        },
        startAnimation: function() {
            this.isAnimating = true;
        },
        stopAnimation: function() {
            this.isAnimating = false;
        }
    }
});
new Vue({
    el: '#search-window',
    data: {
        show: false,
        query: '',
        players: [],
        playersLoading: false,
        maps: [],
        mapsLoading: false,
        typingTimeout: null // Added property for debounce
    },
    methods: {
        close: function() {
            this.show = false;
            this.resetQuery();
        },
        search: async function() {
            this.players = [];
            this.maps = [];
            this.playersLoading = true;
            this.mapsLoading = true;

            if (this.query !== '') {
                // Search for players
                const playersResponse = await fetch("https://api.kawata.pw/v1/search_players?limit=10&q=" + this.query);
                const playersData = await playersResponse.json();
                if (playersData["result"]) {
                    this.players = playersData["result"];
                }

                // Search for maps
                const mapsResponse = await fetch("https://osu.direct/api/search?amount=10"+"&query=" + this.query);
                const mapsData = await mapsResponse.json();
                if (mapsData) {
                    this.maps = mapsData;
                }
            }

            this.playersLoading = false;
            this.mapsLoading = false;
        },
        handleInput: function() {
                clearTimeout(this.typingTimeout); // Clear previous timeout

                // Calculate the delay based on the number of characters typed
                const characterCount = this.query.length;
                let delay = 1500 - (characterCount * 100);
                delay = Math.max(delay, 500); // Ensure the minimum delay is 500 milliseconds

                // Set a new timeout to run the search after the calculated delay
                this.typingTimeout = setTimeout(() => {
                        this.search();
                }, delay);
        },
        resetQuery: function() {
            this.query = '';
        }
    },
    created: function() {
        bus.$on('show-search-window', () => {
            this.show = true;
        });
    },
    template: `
        <div class="modal" v-bind:class="{ 'is-active': show }">
            <div class="modal-background" @click="close"></div>
            <div class="modal-content">
                <div class="box">
                    <div class="field">
                        <p class="control has-icons-left">
                            <input class="input" type="search" placeholder="Search..." v-model="query" @input="handleInput" ref="searchInput">
                            <span class="icon is-left">
                                <i class="fas fa-search"></i>
                            </span>
                        </p>
                    </div>
                    <div class="search-results">
                        <h2 class="title is-4">Players</h2>
                        <div v-if="playersLoading">Loading...</div>
                        <div v-else-if="players.length === 0">No players found</div>
                        <div v-else v-for="player in players" :key="player.id">
                            <!-- Display the player search result here -->
                            {{ player.info.name }}
                        </div>
                        <h2 class="title is-4">Beatmaps</h2>
                        <div v-if="mapsLoading">Loading...</div>
                        <div v-else-if="maps.length === 0">No maps found</div>
                        <div v-for="map in maps" :key="map.SetID" class="beatmap-container bm-search" :id="map.SetID">
                                <a :href="'/b/' + map.ChildrenBeatmaps[0].BeatmapID">
                                        <div class="tab">
                                                <!-- Display the beatmap search result here -->
                                                <h3>{{ map.Title }}</h3>
                                                <h4>{{ map.Artist }} // {{ map.Creator }}</h4>
                                                <div class="mini-icons">
                                                        <div v-for="(childMap, index) in map.ChildrenBeatmaps" :key="childMap.BeatmapID" v-if="index < 15" :data-title="childMap.DiffName + ' <br> ' + childMap.DifficultyRating + '⭐'">
                                                                <img :src="'/static/images/icons/mode-' + ['osu', 'taiko', 'fruits', 'mania'][childMap.Mode] + '.png'">
                                                        </div>
                                                        <div v-if="map.ChildrenBeatmaps.length > 15">.</div>
                                                </div>
                                                <div class="buttons">
                                                    <a @click="interract(map.SetID)">
                                                        <div class="play-div">
                                                            <i class="play icon" :id="'play-' + map.SetID">
                                                                <audio :src="'https://b.ppy.sh/preview/' + map.SetID + '.mp3'" :id="'audio-' + map.SetID"></audio>
                                                            </i>
                                                        </div>
                                                    </a>
                                                    <a :href="'https://bm6.kawata.pw/d/' + map.SetID">
                                                        <div class="download-div">
                                                            <i class="download icon"></i>
                                                        </div>
                                                    </a>
                                                </div>
                                        </div>
                                        <img :src="'https://assets.ppy.sh/beatmaps/' + map.SetID + '/covers/card@2x.jpg'" @error="this.onerror=null; this.src='/static/default-bg.png'">
                                </a>
                        </div>
                    </div>
                </div>
            </div>
            <button class="modal-close is-large" aria-label="close" @click="close"></button>
        </div>
    `
});