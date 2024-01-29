
var bus = new Vue();
new Vue({
    el: "#app",
    delimiters: ["<%", "%>"],
    data() {
        return {
            data: {
                stats: {
                    out: [{}],
                    load: true
                },
                grades: {},
                scores: {
                    recent: {
                        out: [],
                        load: true,
                        more: {
                            limit: 5,
                            full: true
                        }
                    },
                    best: {
                        out: [],
                        load: true,
                        more: {
                            limit: 5,
                            full: true
                        }
                    }
                },
                maps: {
                    most: {
                        out: [],
                        load: true,
                        more: {
                            limit: 6,
                            full: true
                        }
                    }
                },
                badges: [],
                userpage: {
                    load: true,
                    content: ''
                },
                status: {}
            },
            mode: mode,
            mods: mods,
            modegulag: 0,
            load: 0,
            userid: userid
        };
    },
    async created() {
        // starting a page
        this.modegulag = this.StrtoGulagInt();
        this.LoadProfileData();
        this.LoadAllofdata();
        this.LoadUserStatus();

        const urlParams = new URLSearchParams(window.location.search);
        const score = urlParams.get('score');

        // If 'score' parameter is present, call showScoreWindow after 1 second
        if (score) {
            console.log("Showing score: " + score);

            await setTimeout(() => {
                this.showScoreWindow(score);
            }, 100); // 1 second delay
        }
    },
    methods: {
        LoadAllofdata() {
            this.LoadMostBeatmaps();
            this.LoadScores('best');
            this.LoadScores('recent');
        },
        LoadProfileData() {
            this.$set(this.data.stats, 'load', true);
            this.$axios.get(`${window.location.protocol}//api.${domain}/v1/get_player_info`, {
                    params: {
                        id: this.userid,
                        scope: 'all'
                    }
                })
                .then(res => {
                    this.$set(this.data.stats, 'out', res.data.player.stats);
                    this.data.userpage.content = res.data.player.info.userpage_content;
                    if (this.load == 0) {
                        this.$set(this.data, 'badges', res.data.player.info.badges);
                        this.load = 1;
                    }
                    this.data.stats.load = false;
                });
        },
        LoadScores(sort) {
            this.$set(this.data.scores[`${sort}`], 'load', true);
            this.$axios.get(`${window.location.protocol}//api.${domain}/v1/get_player_scores`, {
                    params: {
                        id: this.userid,
                        mode: this.StrtoGulagInt(),
                        scope: sort,
                        limit: this.data.scores[`${sort}`].more.limit
                    }
                })
                .then(res => {
                    this.data.scores[`${sort}`].out = res.data.scores;
                    this.data.scores[`${sort}`].load = false
                    this.data.scores[`${sort}`].more.full = this.data.scores[`${sort}`].out.length != this.data.scores[`${sort}`].more.limit;
                });
        },
        showScoreWindow: function(mapId) {
            bus.$emit('show-score-window', mapId); // Pass the score ID as an argument
        },
        showSearchWindow: function() {
            bus.$emit('show-search-window');
        },
        LoadMostBeatmaps() {
            this.$set(this.data.maps.most, 'load', true);
            this.$axios.get(`${window.location.protocol}//api.${domain}/v1/get_player_most_played`, {
                    params: {
                        id: this.userid,
                        mode: this.StrtoGulagInt(),
                        limit: this.data.maps.most.more.limit
                    }
                })
                .then(res => {
                    this.data.maps.most.out = res.data.maps;
                    this.data.maps.most.load = false;
                    this.data.maps.most.more.full = this.data.maps.most.out.length != this.data.maps.most.more.limit;
                });
        },
        LoadUserStatus() {
            this.$axios.get(`${window.location.protocol}//api.${domain}/v1/get_player_status`, {
                    params: {
                        id: this.userid
                    }
                })
                .then(res => {
                    this.$set(this.data, 'status', res.data.player_status)
                })
                .catch(function (error) {
                    clearTimeout(loop);
                    console.log(error);
                });
            loop = setTimeout(this.LoadUserStatus, 5000);
        },
        ChangeModeMods(mode, mods) {
            if (window.event)
                window.event.preventDefault();

            this.mode = mode;
            this.mods = mods;

            this.modegulag = this.StrtoGulagInt();
            this.data.scores.recent.more.limit = 5
            this.data.scores.best.more.limit = 5
            this.data.maps.most.more.limit = 6
            this.LoadAllofdata();
        },
        AddLimit(which) {
            if (window.event)
                window.event.preventDefault();

            if (which == 'bestscore') {
                this.data.scores.best.more.limit += 5;
                this.LoadScores('best');
            } else if (which == 'recentscore') {
                this.data.scores.recent.more.limit += 5;
                this.LoadScores('recent');
            } else if (which == 'mostplay') {
                this.data.maps.most.more.limit += 4;
                this.LoadMostBeatmaps();
            }
        },
        actionIntToStr(d) {
            switch (d.action) {
                case 0:
                    return 'Idle: 🔍 Song Select';
                case 1:
                    return '🌙 AFK';
                case 2:
                    return `Playing: 🎶 ${d.info_text}`;
                case 3:
                    return `Editing: 🔨 ${d.info_text}`;
                case 4:
                    return `Modding: 🔨 ${d.info_text}`;
                case 5:
                    return 'In Multiplayer: Song Select';
                case 6:
                    return `Watching: 👓 ${d.info_text}`;
                    // 7 not used
                case 8:
                    return `Testing: 🎾 ${d.info_text}`;
                case 9:
                    return `Submitting: 🧼 ${d.info_text}`;
                    // 10 paused, never used
                case 11:
                    return 'Idle: 🏢 In multiplayer lobby';
                case 12:
                    return `In Multiplayer: Playing 🌍 ${d.info_text} 🎶`;
                case 13:
                    return 'Idle: 🔍 Searching for beatmaps in osu!direct';
                default:
                    return 'Unknown: 🚔 not yet implemented!';
            }
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
        secondsToDhm(seconds) {
            seconds = Number(seconds);
            var dDisplay = `${Math.floor(seconds / (3600 * 24))}d `;
            var hDisplay = `${Math.floor(seconds % (3600 * 24) / 3600)}h `;
            var mDisplay = `${Math.floor(seconds % 3600 / 60)}m `;
            return dDisplay + hDisplay + mDisplay;
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
        StrtoModeInt() {
            switch (this.mode) {
                case 'std':
                    return 0;
                case 'taiko':
                    return 1;
                case 'catch':
                    return 2;
                case 'mania':
                    return 3;
            }
        },
    },
    computed: {},
});
new Vue({
    el: '#score-window',
    data: {
        show: false,
        scoreId: '', 
        score: null,
        video: null,
        videoheight: '360px',
        renderedreplayurl: '',
        progress: 0,
        replayIsLoading: false,
    },
    created: function() {
        bus.$on('show-score-window', (scoreId) => { 
            // Reset Score Window Data
            this.score = null;
            this.video = null;
            this.renderedreplayurl = '';
            this.progress = 0;
            this.scoreId = scoreId; 
            this.fetchScoreInfo(); 
            this.show = true;
        });
    },
    methods: {
            fetchScoreInfo: function() {
                // Use the score ID to fetch score information from the API
                fetch(`https://api.kawata.pw/v1/get_score_info?id=${this.scoreId}&b=1`)
                    .then(response => response.json())
                    .then(data => {
                        // Handle the fetched score information
                        console.log(data);
                        this.score = data['score'];
                        this.score.beatmap = data['beatmap_info'];
                        this.renderedreplayurl = 'https://dl2.issou.best/ordr/videos/render' + this.score.r_replay_id + '.mp4';
                    })
                    
                    .catch(error => {
                        // Handle any errors
                        console.error(error);
                    });
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
            async renderReplay(scoreId) {
                this.replayIsLoading = true;

                // Fetch the rendered replay
                const response = await fetch(`https://api.kawata.pw/v1/replays/rendered?id=${scoreId}`, {
                    method: 'GET',
                });
                console.log(response.status);
                if (response.status === 200) {
                    // Fetch the score info
                    //await this.fetchScoreInfo(scoreId);
                    const renderResponse = await response.json();
                    const renderId = renderResponse.render_id;
                    // Create a new Socket.IO connection
                    const socket = io.connect('https://ordr-ws.issou.best');

                    // Listen for 'render_done_json' event
                    socket.on('render_done_json', (message) => {
                        // Parse the received message
                        console.log('Received message:', message);

                        // Check if the renderID matches
                        if (message.renderID === renderId) {
                            // Handle the message
                            console.log('Render done:', message.data);

                            // Disconnect from the Socket.IO server
                            socket.disconnect();

                            // Update the loading state
                            this.replayIsLoading = false;
                            this.fetchScoreInfo(scoreId);
                        }
                    });

                    // Connection closed
                    socket.on('disconnect', () => {
                        console.log('Socket.IO connection closed');
                    });

                    // Connection error
                    socket.on('error', (error) => {
                        console.error('Socket.IO error:', error);
                        this.fetchScoreInfo(scoreId);
                    });
                } else {
                    // Handle non-201 response status
                    console.error('Unexpected response status:', response.status);
                    this.replayIsLoading = false;
                }
            },
            play() {
                if (this.video.paused) {
                    this.video.play();
                } else {
                    this.video.pause();
                }
            },
            fullScreen() {
                //this.video.requestFullscreen(); // Disabled For new Container Fullscreen
                const videoContainer = this.$refs.videoContainer;
                if (videoContainer.requestFullscreen) {
                    videoContainer.requestFullscreen();
                } else if (videoContainer.mozRequestFullScreen) { // Firefox
                    videoContainer.mozRequestFullScreen();
                } else if (videoContainer.webkitRequestFullscreen) { // Chrome, Safari and Opera
                    videoContainer.webkitRequestFullscreen();
                } else if (videoContainer.msRequestFullscreen) { // IE/Edge
                    videoContainer.msRequestFullscreen();
                }
            },
            download() {
                let a = document.createElement('a');
                a.href = this.video.src;
                a.target = "_blank";
                a.download = "";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            },
            shareScore() {
                // Get the current URL without any query parameters
                const baseUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
        
                // Get the scoreId
                const scoreId = this.scoreId; // Replace this with how you get the scoreId
        
                // Create the share URL
                const shareUrl = `${baseUrl}?score=${scoreId}`;
        
                // Copy the share URL to the clipboard
                navigator.clipboard.writeText(shareUrl).then(() => {
                    console.log('Share URL copied to clipboard');
                }).catch(err => {
                    console.error('Could not copy text: ', err);
                });
            },
            rewind() {
                this.video.currentTime = this.video.currentTime - ((this.video.duration / 100) * 5);
            },
            forward() {
                this.video.currentTime = this.video.currentTime + ((this.video.duration / 100) * 5);
            },
            close: function() {
                this.show = false;
                const url = new URL(window.location.href);
                url.searchParams.delete('score');
                window.history.replaceState({}, '', url);
            },
    },
    watch: {
            score: function(newScore) {
                if (newScore) {
                    this.$nextTick(() => {
                        this.video = this.$refs.video;
                        this.video.addEventListener("timeupdate", () => {
                            this.progress = (this.video.currentTime / this.video.duration) * 100;
                        });
                        this.video.addEventListener("ended", () => {
                            this.video.currentTime = 0;
                            this.video.pause();
                        });
                        // Select the element with the class 'modal-content'
                        const modalContent = document.querySelector('.modal-content');

                        // Calculate the width of the 'modal-content' element
                        const width = modalContent.offsetWidth;

                        // Calculate the height for a 16:9 aspect ratio
                        const height = (width * 9) / 16;


                        // Set the height of the video element
                        var videoheight = `${height}`;
                        this.videoheight = videoheight + 'px';
                        const videoElement = this.$el.querySelector('.responsive-video');
                        const scoreBanner = this.$el.querySelector('.score-banner');
                        const songInfo = this.$el.querySelector('#SongInfo');
                        const songTitle = this.$el.querySelector('#score-banner-map.title');
                        const artistCreator = this.$el.querySelector('#score-banner-map.artist-creator');
                        const scoreWindow = this.$el.querySelector('#score-window');
                        const mapDifficulty = this.$el.querySelector('#difficulty.right');
                        const mapInfo = this.$el.querySelector('#bm-info.selector');

                        if (videoElement && scoreBanner) {
                            videoElement.addEventListener('focus', function() {
                                scoreWindow.classList.add('video-focused');
                                scoreBanner.classList.add('video-focused');
                                mapDifficulty.classList.add('video-focused');
                                songInfo.classList.add('video-focused');
                                songTitle.classList.add('video-focused');
                                artistCreator.classList.add('video-focused');
                            });

                            videoElement.addEventListener('blur', function() {
                                scoreWindow.classList.remove('video-focused');
                                scoreBanner.classList.remove('video-focused');
                                mapDifficulty.classList.remove('video-focused');
                                songInfo.classList.remove('video-focused');
                                songTitle.classList.remove('video-focused');
                                artistCreator.classList.remove('video-focused');
                            });

                            videoElement.addEventListener('mouseover', function() {
                                scoreBanner.classList.add('video-hovered');
                                songInfo.classList.add('video-hovered');
                                songTitle.classList.add('video-hovered');
                                artistCreator.classList.add('video-hovered');
                                mapInfo.classList.add('video-hovered');
                            });

                            videoElement.addEventListener('mouseout', function() {
                                scoreBanner.classList.remove('video-hovered');
                                songInfo.classList.remove('video-hovered');
                                songTitle.classList.remove('video-hovered');
                                artistCreator.classList.remove('video-hovered');
                                mapInfo.classList.remove('video-hovered');
                            });
                        }
                    });
                }
            }
    },
    template: `
        <div id="score-modal" class="modal" v-bind:class="{ 'is-active': show }">
            <div class="modal-background" @click="close"></div>
            <div id="score-window" class="modal-content" v-if="show">
                <style>
                    .score-banner.video-focused {
                        height: {{ videoheight }};
                    }
                </style>
                <div class="main-block">
                    <div class="score-banner" ref="videoContainer" :style="{
                        backgroundcolor: 'rgba(0, 0, 0, 0)',
                        }">
                        <div v-if="score.r_replay_id" class="replay-block" :style="{
                            backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5)), url(https://assets.ppy.sh/beatmaps/' + score.beatmap.set_id + '/covers/card@2x.jpg)'
                        }">
                            <video ref="video" id="video" class="responsive-video" @click="play" :poster="'https://assets.ppy.sh/beatmaps/' + score.beatmap.set_id + '/covers/cover@2x.jpg'">
                                <source :src="renderedreplayurl" type="video/mp4">
                            </video>
                            <div class="controls">
                                <button @click="play"><i class="fa fa-play"></i><i class="fa fa-pause"></i></button>
                                <button @click="rewind"><i class="fa fa-fast-backward"></i></button>
                                <div class="timeline">
                                    <div class="bar">
                                        <div class="inner" :style="{ width: progress + '%' }"></div>
                                    </div>
                                </div>
                                <button @click="forward"><i class="fa fa-fast-forward"></i></button>
                                <button @click="fullScreen"><i class="fa fa-expand"></i></button>
                                <button @click="shareScore"><i class="fa fa-share-alt"></i></button>
                                <button @click="download"><i class="fa fa-cloud-download"></i></button>
                            </div>
                        </div>
                        <div class="score-banner img" :style="{
                            backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5)), url(https://assets.ppy.sh/beatmaps/' + score.beatmap.set_id + '/covers/card@2x.jpg)'
                        }">
                        </div>
                        <div id="SongInfo">
                            <div id="score-banner-map" class="title">{{ score.beatmap.title }}
                            <div id="score-banner-map" class="artist-creator">{{ score.beatmap.artist }} || <a :href="'https://osu.ppy.sh/u/' + score.beatmap.creator + '/'">{{ score.beatmap.creator }}</a></div>
                            </div>
                        </div>
                        <div id="render-replay" @click="renderReplay(score.id)" :disabled="replayIsLoading" v-if="!score.r_replay_id" class="level-left" :style="{
                            'position': 'absolute',
                            'left': '1',
                            'bottom': '19%',
                        }">
                            <div class="map-difficulty">
                                <span class="kawata-icon"></span>
                                <span id="" class="difficulty-title">{{ replayIsLoading ? 'Replay Rendering...' : 'Render Replay?' }}</span>
                            </div>
                        </div>
                        <div id="bm-info" class="selector">
                            <div class="left">
                                <div class="map-difficulty">
                                    <span class="kawata-icon"></span>
                                    <span class="difficulty-title">{{ score.beatmap.version }}</span>
                                </div>
                            </div>
                            <div id="difficulty" class="right">
                                <div class="map-difficulty">
                                    <span class="difficulty-title">{{ score.beatmap.diff }}⭐</span>
                                </div>
                                <div class="map-difficulty">
                                    <span class="difficulty-title">CS: {{ score.beatmap.cs }}</span>
                                </div>
                                <div class="map-difficulty">
                                    <span class="difficulty-title">AR: {{ score.beatmap.ar }}</span>
                                </div>
                                <div class="map-difficulty">
                                    <span class="difficulty-title">OD: {{ score.beatmap.od }}</span>
                                </div>
                                <div class="map-difficulty">
                                    <span class="difficulty-title">HP: {{ score.beatmap.hp }}</span>
                                </div>
                                <div class="map-difficulty">
                                    <span class="difficulty-title">BPM: {{ score.beatmap.bpm }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="second-block">
                    <div id="score-info" class="content">
                        <div id="score-perf-ext" class="score-info-block">
                            <div class="info-container">
                                <h5 class="title">Performance (Extended)</h5>
                                <div class="column">
                                    <div class="info-value">
                                        <h3 class="title">300s:</h3>
                                        <h1 class="value">{{ score.n300 }}</h1>
                                    </div>
                                    <div class="info-value">
                                        <h3 class="title">Geki:</h3>
                                        <h1 class="value">{{ score.ngeki }}</h1>
                                    </div>
                                </div>
                                <div class="column">
                                    <div class="info-value">
                                        <h3 class="title">100s:</h3>
                                        <h1 class="value">{{ score.n100 }}</h1>
                                    </div>
                                    <div class="info-value">
                                        <h3 class="title">Katu:</h3>
                                        <h1 class="value">{{ score.nkatu }}</h1>
                                    </div>
                                </div>
                                <div class="column">
                                    <div class="info-value">
                                        <h3 class="title">50s:</h3>
                                        <h1 class="value">{{ score.n50 }}</h1>
                                    </div>
                                    <div class="info-value">
                                        <h3 class="title">Misses:</h3>
                                        <h1 class="value">{{ score.nmiss }}</h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="score-cheats" class="score-info-block">
                            <div id="cheats" class="info-container" v-if="score.cheat_values">
                                <h5 class="title">Cheats</h5>
                                <div id="cheats" class="column">
                                    <h5 class="title">Assistance:</h5>
                                    <div id="cheats" class="row">
                                        <div class="info-value" v-if="score.cheat_values.Timewarp">
                                            <h3 class="title">Timewarp:</h3>
                                            <!--<h1 class="title" v-if="score.cheat_values.TimewarpType">Type: {{ score.cheat_values.TimewarpType }}</h1>-->
                                            <h1 class="value" v-if="score.cheat_values.TimewarpRate">{{ score.cheat_values.TimewarpRate }}% Speed</h1>
                                            <h1 class="value" v-if="score.cheat_values.TimewarpMultiplier">{{ score.cheat_values.TimewarpMultiplier }}x Speed</h1>
                                        </div>
                                        <div class="info-value" v-if="score.cheat_values.AimCorrection || (score.cheat_values.AimType == 'Correction')">
                                            <h3 class="title">Aim Correction:</h3>
                                            <h1 class="value" v-if="score.cheat_values.AimCorrectionRelative">Range: CS + {{ score.cheat_values.AimCorrectionValue }}</h1>
                                            <h1 class="value" v-else>Range: {{ score.cheat_values.AimCorrectionValue }}</h1>
                                            <h1 class="value" v-if="score.cheat_values.TimesCorrected"># of Corrections: {{ score.cheat_values.TimesCorrected }}</h1>
                                            <h1 class="value" v-if="score.cheat_values.TapOnCorrect">Tap on Correct</h1>
                                        </div>
                                        <div class="info-value" v-if="score.cheat_values.AimType == 'OBAA'">
                                            <h3 class="title">Aim Assist: (Osu!Buddy Style)</h3>
                                            <h1 class="value" v-if="score.cheat_values.AimStrength">Strength: {{ score.cheat_values.AimStrength }}</h1>
                                            <h1 class="value" v-if="score.cheat_values.AimStartingDistance">Starting Distance: {{ score.cheat_values.AimStartingDistance }}</h1>
                                            <h1 class="value" v-if="score.cheat_values.AimStoppingDistance">Stopping Distance: {{ score.cheat_values.AimStoppingDistance }}</h1>
                                            <h1 class="value" v-if="score.cheat_values.AimAssistOnSliders">Assist on Sliders</h1>
                                        </div>
                                        <div class="info-value" v-if="score.cheat_values.RelaxHack">
                                            <h3 class="title">Relax Hack</h3>
                                        </div>
                                    </div>
                                </div>
                                <div id="cheats" class="column">
                                    <h5 class="title">Appearance:</h5>
                                    <div id="cheats" class="row">
                                        <div class="info-value" v-if="score.cheat_values.ARChanger">
                                            <h3 class="title">AR Changer:</h3>
                                            <h1 class="value" v-if="score.cheat_values.ARChangerAR">{{ score.cheat_values.ARChangerAR }} AR</h1>
                                        </div>
                                        <div class="info-value" v-if="score.cheat_values.CSChanger">
                                            <h3 class="title" v-if="score.cheat_values.CSChanger">CS Changer</h3>
                                        </div>
                                        <div class="info-value" v-if="score.cheat_values.HiddenRemover || score.cheat_values.FlashlightRemover">
                                            <h3 class="title" v-if="score.cheat_values.HiddenRemover">Hidden Remover</h3>
                                            <h3 class="title" v-if="score.cheat_values.FlashlightRemover">Flashlight Remover</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="score-perf" class="score-info-block">
                            <div class="info-container">
                                <h5 class="title">Performance</h5>
                                <div class="info-value">
                                    <h3 class="title">PP:</h3>
                                    <h1 class="value">{{ addCommas(score.pp) }}</h1>
                                </div>
                                <div class="info-value">
                                    <h3 class="title">Score:</h3>
                                    <h1 class="value">{{ addCommas(score.score) }}</h1>
                                </div>
                                <div class="info-value">
                                    <h3 class="title">Accuracy:</h3>
                                    <h1 class="value">{{ score.acc }}%</h1>
                                </div>
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