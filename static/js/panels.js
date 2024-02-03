var docsBus = new Vue();
new Vue({
    el: '#docs',
    data: {
        module: 'Rules', // Module Controls which doc is shown
        page: 'Main', // Page controls which page of the doc is shown
    },
    async created() {
        const urlParams = new URLSearchParams(window.location.search);
        const urlPath = window.location.pathname;
        const pathParts = urlPath.split('/');
        
        // Check if the URL path matches the expected format
        if (pathParts[1] === 'docs') {
            const doc = pathParts[2];
            const page = urlParams.get('page');
            if (page === "Cheats") {
                page = "Clients";
            }

                console.log("Showing doc: " + doc + ", page: " + page);

                await setTimeout(() => {
                    if (page) {
                        this.showDocsPanel(doc, page);
                    } else {
                        this.showDocsPanel(doc);
                    }
                }, 100); // 1 second delay
        }
    },
    methods: {
        showDocsPanel: function(doc, page) {
            this.doc = doc || 'Rules';
            this.page = page || 'Main';
            docsBus.$emit('show-docs-panel', this.doc, this.page);
        }
    },
});
new Vue({
    el: '#docs-panel',
    data: {
        show: false,
        module: 'Rules', // Module Controls which doc is shown
        page: 'Main', // Page controls which page of the doc is shown
    },
    created: function() {
        docsBus.$on('show-docs-panel', (module, page) => { 
            this.module = module || 'Rules'; 
            this.page = page || 'Main';
            this.show = true;
        });
    },
    methods: {
        close: function() {
            this.show = false;
        },
        LoadDoc(module, page) {
            console.log(`Loading ${module} doc...`); // placeholder print statement
            this.module = module;
            this.page = page || 'Main';
        },
    },
    watch: {
            
    },
    template: `
        <div id="docs-modal" class="modal" v-bind:class="{ 'is-active': show }">
            <div class="modal-background" @click="close"></div>
            <div data-panel="Docs" id="docs-window" class="modal-content" v-if="show">
                <div class="main-block">
                    <div class="docs-banner">
                        <div class="docs-banner img" style="height: fit-content" :style="{
                            backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5)), url(/static/images/banners/' + module + '.jpg)'
                        }">
                        </div>
                        <h1 class="docs-banner title">Docs</h1>
                        <div id="docs-selector" class="selector">
                            <a class="bottom-tab" v-bind:class="{ 'active': module === 'Rules' }"
                            @click="LoadDoc('Rules')">
                                <i class="fas fa-user"></i><span class="modetext"> Rules </span>
                            </a>
                            <a class="bottom-tab" v-bind:class="{ 'active': module === 'Clients' }"
                            @click="LoadDoc('Clients', 'Main')">
                                <i class="fas fa-clients"></i><span class="modetext"> Clients/Cheats </span>
                            </a>
                            <a class="bottom-tab" v-bind:class="{ 'active': module === 'Connection' }"
                            @click="LoadDoc('Connection', 'Main')">
                                <i class="fas fa-network"></i><span class="modetext"> Connection Guide </span>
                            </a>
                            <a class="bottom-tab" v-bind:class="{ 'active': module === 'Verification' }"
                            @click="LoadDoc('Verification', 'Main')">
                                <i class="fas fa-network"></i><span class="modetext"> Verification Guide </span>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="second-block">
                    <div id="panel" class="content" v-if="module === 'Rules'">
                        <div id="docs-selector" class="selector">
                            <a class="top-tab" v-bind:class="{ 'active': page === 'Main' }"
                            @click="LoadDoc('Rules', 'Main')">
                                <i class="fas fa-hammer"></i><span class="modetext"> General </span>
                            </a>
                            <a class="top-tab" v-bind:class="{ 'active': page === 'Cheats' }"
                            @click="LoadDoc('Rules', 'Cheats')">
                                <i class="fas fa-hammer"></i><span class="modetext"> Cheating Rules </span>
                            </a>
                            <a class="top-tab" v-bind:class="{ 'active': page === 'Scorehunt' }"
                            @click="LoadDoc('Rules', 'Scorehunt')">
                                <i class="fas fa-hammer"></i><span class="modetext"> Score Hunting </span>
                            </a>
                        </div>
                        <div class="doc-block" v-if="page === 'Main'">
                            <div class="doc-notice">
                                <h4 class="centered">We may change the rules at any time as we see fit. New rules may or may not be retroactive at our discretion.</h4>
                                <h4 class="centered">The rules on this page may not always be updated. Join our Discord to ensure you are reading the most up-to-date rules. This page was last updated on April 5th, 2023.</h4>
                            </div>
                            <div class="doc-section">
                                <h3><i class="game icon"></i> General rules</h3>
                                Any violation of the rules in this section will result in a restriction or ban, temporary or permanent, depending on the severity.
                                <div class="doc-content">
                                    <p>1.Unfair hacks, such as replay bots (including replay editing by extension), score modifiers, OD Changers, spinbots, Autobots (including all forms of auto/cursordance bots), and cheats that modify replay data, Tap Data, Aim Data, Mods, and Score Editors, are not allowed. This list is not exhaustive, and staff can enforce this outside the given examples.</br>
                                    2.Shared or boosted accounts are NOT allowed.</br>
                                    3.Do not try to exploit the server. If you find a vulnerability, please report it.</br>
                                    4.Use an appropriate username or avatar. If you do not, your privileges to use them will be discontinued.</br>
                                    5.Multi-accounts are strictly prohibited.</p>
                                </div>
                            </div>
                            <div class="doc-section">
                                <h3><i class="comment icon"></i> Chat rules</h3>
                                <p>Failure to comply with the rules in this section will result in a <b>silence</b>.</br>
                                These rules apply to both our Discord and in-game chat.</p>
                                <div class="doc-content">
                                    <p>1.  Do not share your private information with anyone.</br>
                                    2.  Treat all members, no matter what they are, with respect.</br>
                                    3.  Suspicious, Malicious, Content or links are not allowed.</br>
                                    4.  Discrimination, racism, sexism, and hate speech are all strictly disallowed.</p>
                                </div>
                            </div>
                            <div class="doc-section">
                                <h3><i class="fas fa-exclamation-circle"></i> Gamemode Specific Rules</h3>
                                <div class="subsection">
                                    <h4><b>CTB:</b></h4>
                                    Hyperwalk maps are not allowed.
                                </div>
                                <div class="subsection">
                                    <h4><b>AutoPilot</b></h4>
                                    Any form of Relax is not allowed while using autopilot.
                                    We can request liveplays at any time and failure to provide them will result in a wipe.
                                </div>
                            </div>
                            <div class="doc-section">
                                <h3><i class="shield icon"></i> Moderation policy</h3>
                                Unlike other infractions, we have a fixed moderation policy for hacking rules.
                                <div class="doc-content">
                                    If you get caught breaking any of the Hacking Rules, it will result in a wipe of your account's scores if you cannot prove you weren't breaking the rules.</br>
                                    </br>
                                    After 3 wipes, your account will be BANNED, not restricted.</br>
                                    This means we'll never ban someone at their first wipe, other than for the Skoot.er AC rule and Multiple cheat client's rules.</br>
                                    </br>
                                    You may appeal 1 month after your restriction unless you judge you haven't been restricted for a legitimate reason.</br>
                                    </br>
                                    If you want to appeal, <a href="https://discord.gg/4CzsqkK">Join our Discord</a> and open a ticket at #support-tickets.
                                </div>
                            </div>
                        </div>
                        <div class="doc-block" v-if="page === 'Cheats'">
                            <div class="doc-section">
                                <h3><i class="fas fa-exclamation-circle"></i> Cheating rules</h3>
                                <h5>Even though Kawata is a cheating server, we are enforcing a few rules, to make sure playing on Kawata is a fun and rewarding experience for everyone!</br>
                                Failure to comply with the rules in this section will result in an <b>account wipe and a strike</b>.</h5>
                                <div class="subsection">
                                    <h5><b>Timewarp:</b></h5>
                                    <p>Timewarp has specific set limits: your Timewarp speed MUST be at minimum 66% of 1.5x speed for Double Time*, and NO Timewarp with nomod.</p>
                                    With the most Common Clients, This would be:</br>
                                    <div class="doc-content">
                                        AQN: 100 with DT 
                                    </div>
                                    <div class="doc-content">
                                    osu!rx: 0.66 with DT
                                    </div>
                                    <div class="doc-content">
                                    Maple: 100 With DT (Rate), 0.66 With DT (Multiplier) 
                                    </div>
                                    <div class="doc-content">
                                    Ainu & Ainu Based Clients: Skoot.er; 0.66 with DT | Abypass; 100 with DT
                                    </div>
                                    <div class="doc-content">
                                    Assist.Games: 100 with DT (rate)
                                    </div>
                                </div>
                                <div class="subsection">
                                    <h5><b>Aim Correction/Aim Assist:</b></h5>
                                    <p>Below listed are the HIGHEST allowed settings and/or whether or not the cheat is allowed for each of the most common aim assist tools for osu!. If your cheat is not listed, ask a moderator.</p>
                                    Here are more details:
                                    <div class="doc-content">
                                        <b>Ainu/hq.af's</b> "SAVE ME" is allowed (no limit);
                                    </div>
                                    <div class="doc-content">
                                        <b>MPGH's Ainu</b> default AC is allowed;
                                    </div>
                                    <div class="doc-content">
                                        <b>Skooter's AC/Abypass AA</b> is allowed; Its Strength must be at or below 60, but can only be a whole number. Values like 58.2 and 51.1 are not allowed.
                                    </div>
                                    <div class="doc-content">
                                        <b>osu!buddy's AA</b> is allowed; but must be equal to or below the following settings. Strength: 11 Aim Start Distance: 666
                                    </div>
                                    <div class="doc-content">
                                        <b>Kat's AA</b> is allowed; Its Strength cannot exceed 1.5x.
                                    </div>
                                    <div class="doc-content">
                                        <b>Assist.games AA</b> is allowed, Its Strength cannot exceed 66.
                                    </div>
                                    <div class="doc-content">
                                        <b>Maple AA</b> is allowed but MUST be equal to or below the following settings.</br>
                                        <div class="subsection">
                                            AA <b>V1</b></br>
                                            Strength: 0.66  | Base FOV: 55 |  Max FOV (Scaling): 2 | Minimum FOV (total): 25 Maximum FOV (Total): 185 | Assist on Sliders: Allowed | Acceleration Factor: 3 Minimum. |
                                        </div>
                                        <div class="subsection">
                                            AA <b>V2</b></br>
                                            AA Power: 0,6 or below. Assist on sliders: Allowed
                                        </div>
                                        <div class="subsection">
                                            AA <b>V3</b></br>
                                            AA Power: 1.2 or below. Slider AA: 0,6 or below.
                                        </div>
                                    </div>
                                </div>
                                <div class="subsection">
                                    <h5><b>CS modifiers:</b></h5>
                                    Circle Size changers are allowed, but with the following rules:
                                    <div class="doc-content">
                                        <p>For no-mod plays: default CS - 1 (eg. CS4 -> CS3);</br>
                                        For HR plays: default CS - 0.77 (eg. CS4 -> CS3.23);</br>
                                        For EZ plays: default CS - 2 (eg. CS4 -> CS2).</br>
                                        </br>
                                        These values must be applied to the map's default CS with NO MODS ENABLED.</br>
                                        To check the CS, turn off your CS changer, reload the map and check in the top left corner where it says "CS: xxx AR: xxx OD: xxx"</p>
                                    </div>
                                </div>
                                <div class="subsection">
                                    <h5><b>Flashlight:</b></h5>
                                    <div class="doc-content">
                                        <p>You may use Flashlight removers, but only if the map's difficulty is lower than 7 stars after mods.</br>
                                        So if it's 6 stars no mod, and you apply +HDDT and it becomes 8 stars, then it's not allowed.</br>
                                        If that's the case you are required to liveplay the play with Flashlight.</br>
                                        NOW, FL is not allowed even if there's a score on top 50 scores of that map (Bancho)</br>
                                        If you're unsure, then ask a Moderator.</br>
                                        </br>
                                        TLDR: <b>FL REMOVER IS NOT ALLOWED.</b></p>
                                    </div>
                                </div>
                                <div class="subsection">
                                    <h5><b>Multiple Cheats:</b></h5>
                                    <div class="doc-content">
                                        <p>You <b>can't</b> have more than <b>ONE</b> cheat instance/client open at the same time.</br>
                                        This ALSO applies to combining cheats together, if you get caught doing so you will end up getting banned.</br>
                                        *The only exception for this rule is combining osu!rx (V1 or V2) with Kat's AA/any kind of Aim assist that doesn't have timewarp & relax.*</p>
                                    </div>
                                </div>
                                <div class="subsection">
                                    <h5><b>Unfair hacks:</b></h5>
                                    <div class="doc-content">
                                        Unfair hacks such as replaybots (and replay editing, by extension), score modifiers, OD changers, spinbots, autobots (includes all forms of auto,cursordance bots too), cheats that modify the score's replay data (e.g. tap data or aim data, or playing with the in-game Relax mod, then removing it on submission) and score editors are NOT allowed, this rule may be enforced outside of the examples given. It is discretionary.
                                    </div>
                                </div>
                                <div class="subsection">
                                    <h4><b>Other Important Notes:</b></h4>
                                    <div class="doc-content">
                                        <p>For Ainu users, make sure the client you use was downloaded on MPGH, the Skoot.er Discord server or the Ainu Xheaters Discord server, otherwise it contains prohibited features.</br>
                                        </br>
                                        Things as: Relax hacks, AR changers, Enlighten (Un-HD), and other stuff that wasn't listed in the hacking rules ARE ALLOWED. You can also ask one of the staff members if you still need clarification.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="doc-block" v-if="page === 'Scorehunt'">
                            <div class="doc-section">
                                <h3><i class="fas fa-exclamation-circle"></i> Score Hunting</h3>
                                In September 2022, Kawata introduced Score Hunts!
                                <div class="doc-content">
                                    This is a way to get rewards from playing difficult, strange or techincal maps. How it works is pretty simple.</br>
                                    </br>
                                    If you want to participate in Score Hunts, <a href="https://discord.gg/4CzsqkK">Join our Discord</a> In there you can find the #score-hunting channel, which shows you the current active and previous Score Hunts.</br>
                                    </br>
                                    *Make sure to read the requirements of __each__ scorehunt. They can change depending on any of them.*</br>
                                    </br>
                                    The following notes will <b>ALWAYS</b> be true for scorehunts.
                                    <div class="subsection">
                                        1. Scorehunt Information will be available in #score-hunting & the <a href="https://docs.google.com/spreadsheets/d/1iabjrE_O52rNifvUi8s1tBqzThGqa699pmwZdGZTCN8/edit?usp=sharing">Public Score Hunt Spreadsheet</a></br>
                                        </br>
                                        2. CS changer is not allowed in Scorehunts.</br>
                                        </br>
                                        3. Scorehunts will follow the rules set here.</br>
                                        </br>
                                        4. Breaking scorehunt rules will incur a normal moderation punishment (See Moderation Policy) And a ban from future Score Hunts, the ban is appealable after 1 year.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="panel" class="content" v-if="module === 'Connection'">
                        <div id="docs-selector" class="selector">
                            <a class="top-tab" v-bind:class="{ 'active': page === 'Main' }"
                            @click="LoadDoc('Connection', 'Main')">
                                <span class="modetext"> How to Connect </span>
                            </a>
                            <a class="top-tab" v-bind:class="{ 'active': page === 'Old' }"
                            @click="LoadDoc('Connection', 'Old')">
                                <span class="modetext"> Old Method </span>
                            </a>
                            <a class="top-tab" v-bind:class="{ 'active': page === 'Cert' }"
                            @click="LoadDoc('Connection', 'Cert')">
                                <span class="modetext"> Certificate Guide </span>
                            </a>
                        </div>
                        <div class="doc-block" v-if="page === 'Main'">
                            <div class="doc-notice">
                                <h2>Video tutorial</h2>
                                We now have a video tutorial to get you up and running in no time!</br>
                                <p align="center"><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/imdQcbwOoi0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></p>
                            </div>
                            <div class="doc-section">
                                <h1>Registering on Kawata</h1>
                                To create your Kawata account, follow <a href="/register">this link</a>, and follow the instructions to create your account.
                                <br>
                                Make sure you read the <a @click="LoadDoc('Rules', 'Main')">rules</a> before proceeding!
                            </div>
                            <div class="doc-section">
                                <h1>Connecting to Kawata</h1>
                                <div class="subsection">
                                    <h2>New method (-devserver flag)</h2>
                                    osu! has added *official-ish* support for private servers.</br>
                                    That means you can now easily connect to Kawata, without tampering with your system files. This is the recommended method.</br>
                                    Please note that some unofficial osu! clients may not be compatible with this new method yet.
                                    <div class="doc-content">
                                        <h3>Launching osu! on Kawata</h3><p>
                                        - Open your osu! installation folder.</br>
                                        - Click the address bar, and type "osu!.exe -devserver Kawata.pw".</br>
                                        - Open osu! and log in with your Kawata account.</p>
                                    </div>
                                    <div class="doc-content">
                                        <h3>Creating a shortcut to connect quickly</h3><p>
                                        - Open your osu! installation folder.</br>
                                        - Create a shortcut to osu!.exe wherever you want, or copy your existing shortcut.</br>
                                        - Right-click your newly created shortcut, and click <b>Properties</b>.</br>
                                        - In the <b>Target</b> field of the <b>Properties</b> window, add "-devserver Kawata.pw" to the existing text.</br>
                                        - Open your newly created shortcut and log in with your Kawata account.</p>
                                    </div>
                                </div>
                                
                                <h2>Having troubles?</h2>
                                Check out our <a @click="LoadDoc('FAQ')">FAQ</a>
                            </div>
                        </div>
                        <div class="doc-block" v-if="page === 'Old'">
                            <div class="doc-notice">
                                <h2 style="color: red;">Notice: This method is not supported anymore!</h2>
                                <p style="color: red;">This method is no longer supported, and should only be used if the new method does not work for you.</br>
                                Most of the popular clients that don't support the new method have their own built in server switcher that should be used instead.</p>
                            </div>
                            <div class="doc-section">
                                <h1>Connecting to Kawata: </h1>
                                <div class="subsection">
                                    <h2>Old method (server switcher) (legacy/unsupported)</h2>
                                    This is the traditional method for connecting to private servers. </br>
                                    This method requires administrator access, as it implies tampering with the osu! certificate, and the hosts file. </br>
                                    This method is considered legacy and should only be used in cases where the new method cannot be used.
                                    <div class="doc-content">
                                        <h3>Certificate installation</h3>
                                        If you want to play on Kawata, you must install our HTTPS certificate. </br> 
                                        Do this only the first time you connect to Kawata.  </br>
                                        <div class="subsection"><p>
                                            - Open the switcher.</br>
                                            - Click on <b>"Install certificate"</b>.</br>
                                            - Click <b>"Yes"</b>.</p>
                                        </div>
                                        *If you can't install the certificate properly, follow <a @click="LoadDoc('Connection', 'Cert')">these instructions</a> to install it manually.*
                                    </div>
                                    <div class="doc-content">
                                        <h3>How to connect to Kawata</h3>
                                        <div class="subsection"><p>
                                            - Run the switcher <b>as administrator</b></br>
                                            - Click "Connect to Kawata".</br>
                                            - Make sure that the switcher says <b>"You're connected to Kawata!"</b> (it should look like <a href="https://i.imgur.com/0LotBDY.png">this</a>), if not, click <b>"Connect to Kawata"</b> to switch servers.</br>
                                            - Open osu! and log in with your Kawata account.</p>
                                        </div>
                                    </div>
                                    <div class="doc-content">
                                        <h3>How to play on official osu! again</h3>
                                        <div class="subsection"><p>
                                            - Make sure osu! is <b>closed</b>  </br>
                                            - Open the switcher and make sure it says <b>"You are playing on Bancho"</b> (it should look like <a href="https://i.imgur.com/JwrBy8S.png">this</a>), if not, click <b>"Disconnect from Kawata"</b> to switch server.</br>
                                            - Open osu! and log in with your osu! account.</p>
                                        </div>
                                        NOTE: If you want to connect to osu.ppy.sh and you still see Kawata's website even if the switcher is off, empty your browser cache.
                                    </div>
                                    <div class="doc-content">
                                        <h3>How to update osu!/switch release branch</h3>
                                        <div class="subsection"><p>
                                        - Make sure osu! is <b>closed</b>.</br>
                                        - Open the switcher and make sure it says <b>"You are playing on Bancho"</b> (it should look like <a href="https://i.imgur.com/JwrBy8S.png">this</a>).</br>
                                        - Open osu! and update the game.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="doc-block" v-if="page === 'Cert'">
                            <div class="doc-section">
                                <h1>Installing the certificate manually</h1>
                                <p>If you're having trouble connecting to Kawata using stable (latest), beta, or cutting edge, or the switcher doesn't install the certificate properly, you can install the certificate manually.</p>
                                <div class="subsection">
                                    <h3>Instructions:</h3>
                                    <div class="doc-content">
                                        <p>
                                            - To begin, obtain the certificate <a href="/static/cert.crt">by clicking here</a>.</br>
                                            - Then, open certificate.crt.</br>
                                            - Click the "Install certificate..." button.</br>
                                            - Click Next.</br>
                                            - Click "Browse..." after selecting "Place all certificates in the following store" (the second option).</br>
                                            - A new window will pop up, select Trusted root certification authorities and click Ok.</br>
                                            - Click Next.</br>
                                            - Click Finish.</br>
                                        </p>
                                    </div>
                                </div>
                                <div class="subsection">
                                    <h3>How to test the certificate:</h3>
                                    <p>To ensure the certificate has been installed successfully, make sure the switcher is On and open <a href="https://c.ppy.sh/">this page</a>.</p>
                                    <div class="doc-content">
                                        <p>
                                            - If you see <a href="http://y.zxq.co/ubfzty.png">osu!bancho stuff</a>, your switcher is off. Turn it on and try again.</br>
                                            - If you see <a href="http://y.zxq.co/zphobw.png">some ripple stuff</a>, you're successfully connected to Kawata under HTTPS, good job!</br>
                                            - If you get <a href="http://y.zxq.co/reaueu.png">some certificate or security error</a>, the certificate has not been installed successfully. <b>Follow the instructions below.</b></br>
                                        </p>
                                    </div>
                                </div>
                                <div class="subsection">
                                    <h3>If everything else fails...</h3>
                                    <p>You can try to remove all existing Kawata/Ripple/Akatsuki/Enjuu/whatever certificates and install the certificate again. Follow these steps:</p>
                                    <div class="doc-content">
                                        <p>
                                            - Press <b>Win+R</b>  - In the run box, type "mmc certmgr.msc" and press "enter" to launch the Certificate Manager.</br>
                                            - Select <b>Trusted root certification authorities</b> on the left.</br>
                                            - On the right, click "Certificates."</br>
                                            - You should see a <a href="https://i.imgur.com/iJlLOg3.png">Kawata</a> entry and one or two <b>*.ppy.sh</b> entries in the list. Select them, then right-click and select "Delete."</br>
                                            - Select all the positive options.</br>
                                            - Launch the switcher, then select "Install certificate," followed by "Yes."- Connecting to <a href="https://c.ppy.sh/">Kawata's bancho server via https</a> should work.</br>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="panel" class="content" v-if="module === 'Clients'">
                        <div id="docs-selector" class="selector">
                            <a class="top-tab" v-bind:class="{ 'active': page === 'Main' }"
                            @click="LoadDoc('Clients', 'Main')">
                                <i class="fas fa-list"></i><span class="modetext"> List </span>
                            </a>
                            <a class="top-tab" v-bind:class="{ 'active': page === 'Kawata' }"
                            @click="LoadDoc('Clients', 'Kawata')">
                                <i class="fas fa-client"></i><span class="modetext"> Kawata/Aeris </span>
                            </a>
                            <a class="top-tab" v-bind:class="{ 'active': page === 'Abypass' }"
                            @click="LoadDoc('Clients', 'Abypass')">
                                <i class="fas fa-client"></i><span class="modetext"> Abypass </span>
                            </a>
                            <a class="top-tab" v-bind:class="{ 'active': page === 'Maple' }"
                            @click="LoadDoc('Clients', 'Maple')">
                                <i class="fas fa-client"></i><span class="modetext"> Maple </span>
                            </a>
                        </div>
                        <div class="doc-block" v-if="page === 'Main'">
                            <div class="doc-notice">
                                <h2>Disclaimer:</h2></br>
                                <p>While this is a server centered around cheating, 
                                We at Kawata do <b>NOT</b> condone the usage of any form of cheating on other servers. </br>
                                Please be respectful to others and and keep your usage of cheats on our server where it is implicitly allowed. </br>
                                We do not want to disrupt the enjoyment of the game for other playerbases.</p>
                            </div>
                            <div class="doc-section">
                                <h3><i class="fas fa-exclamation-circle"></i> Differences between Clients and Hacks:</h3>
                                <div class="subsection">
                                    <h4><b>Client:</b></h4>
                                    <div class="doc-content">
                                        <p>A client is a modified version of osu! that allows you to cheat and often times has other features built in. </br>
                                        It is a separate program from osu!, and it is not made by the osu! team. </br>
                                        It is made by the community, for the community.</p>
                                    </div>
                                </div>
                                <div class="subsection">
                                    <h4><b>Hack:</b></h4>
                                    <div class="doc-content">
                                        <p>A hack is a program that modifies the original game while it is running. </br>
                                        It is a separate program or file that is injected into the original game, and it is not made by the osu! team. </br>
                                        It is made by the community, for the community.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="doc-section">
                                <h3><i class="fas fa-exclamation-circle"></i> Cheats & Clients:</h3>
                                <div class="subsection">
                                    <div class="doc-notice">
                                        <h4><b>Note: Each of these can be clicked to navigate</b></h4>
                                    </div>
                                    <div class="doc-content">
                                        <h3><i class="fas fa-exclamation"></i> Popular/Recommended:</h3>
                                        <div class="subsection linked" @click="LoadDoc('Clients', 'Kawata')">
                                            <h4><b>Kawata/Aeris:</b></h4>
                                            <p>Kawata/Aeris is a client originally developed by Panini Céleste. </br>
                                            It is currently being maintained and developed by TheFantasticLoki. </br>
                                            Contributions have been made by Maple Syrup and Chewy/Pythr.</br>
                                            Due to being the Kawata Client, you are the least likely to break our rules using this client. </br>
                                            Therefore is it the most recommended client to use.</p>
                                        </div>
                                        <div class="subsection linked" @click="LoadDoc('Clients', 'Abypass')">
                                            <h4><b>Abypass:</b></h4>
                                            <p>Abypass is the successor to Skoot.er created by Chewy/Pythr. </br>
                                            Currently Maintained by Aochi.</br>
                                            This client is a better version of Skoot.er with more features and less bugs. </br>
                                            This client tries to comply with our rules, but it is not always updated. </br>
                                            If Kawata/Aeris doesn't work for you, this is the next best, free choice.</p>
                                        </div>
                                        <div class="subsection linked" @click="LoadDoc('Clients', 'Maple')">
                                            <h4><b>Maple:</b></h4>
                                            <p>Maple is a <b>paid</b> hack created by Maple Syrup. </br>
                                            It is a very powerful hack that is constantly being updated. </br>
                                            It's main draw is Aim Assist and Relax that is widely considered to be the best in the community. </br>
                                            This client does not have any built in limits, so you must be careful not to break our rules. </p>
                                        </div>
                                        <div class="subsection linked" @click="LoadDoc('Clients', 'AQN')">
                                            <h4><b>AQN:</b></h4>
                                            <p>AQN is a now free hack created by Rumoi. </br>
                                            Powerful hack from the founding of the server, it is no longer maintained.</br>
                                            Crashes on latest osu! version due to compatibility issues.</p>
                                        </div>
                                        <div class="subsection linked" @click="LoadDoc('Clients', 'osu!rx')">
                                            <h4><b>osu!rx:</b></h4>
                                            <p>osu!rx is a free hack created by mrflashstudio and updated by Sasuke. </br>
                                            </p>
                                        </div>
                                    </div>
                                    <div class="doc-content">
                                        <h3><i class="fas fa-exclamation"></i> Unsupported/Depreciated Cheats:</h3>
                                        <div class="subsection linked" @click="LoadDoc('Clients', 'Skooter')">
                                            <h4><b>Skooter:</b></h4>
                                            <p>Skooter is a free client developed by Aoba Suzukaze, VacCat, Chewy/Pythr. </br>
                                            It is no longer maintained, and has been replaced by Abypass. </br>
                                            No longer supported on our server due to connection issues.</p>
                                        </div>
                                        <div class="subsection linked" @click="LoadDoc('Clients', 'Ainu')">
                                            <h4><b>Ainu:</b></h4>
                                            <p>Ainu is a free client Created by Aoba Suzukaze, Edited by Chewy/Pythr. </br>
                                            It is no longer maintained, and was replaced by Skooter which was then replaced by Abypass. </br>
                                            No longer supported on our server due to connection issues and banned features.</p>
                                        </div>
                                    </div>
                                    <div class="doc-content">
                                        <h3><i class="fas fa-exclamation" style="color: red;"></i> Banned Cheats</h3>
                                        <div class="subsection">
                                            <h4><b>Freedom:</b></h4>
                                            <p>Freedom has been banned from being used on our server due to it's features breaking our rules at all settings.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="doc-block" v-if="page === 'Kawata'">
                            <div class="doc-notice">
                                <a class="button dl" href="" title="Client is currently in Limited Beta Testing" style="color: red;"><i class="fas fa-download"></i>  Download</a>
                            </div>
                            <div class="doc-section">
                                <h3><i class="fas fa-exclamation-circle"></i> Kawata/Aeris Client:</h3>
                                <div class="subsection">
                                    <h4><b>Kawata/Aeris is the Official Client for Kawata originally developed by Panini Céleste. </b></h4>
                                    <p>
                                        Currently Maintained and Developed by The Fantastic Loki.</br>
                                        Contributions have been made by Maple Syrup and Chewy/Pythr.</br>
                                        Designed to be the Ultimate Community Client, it is the most recommended client to use on our server.</br>
                                    </p>
                                    <div class="doc-content">
                                        <h3><i class="fas fa-exclamation"></i> Features:</h3>
                                        <div class="subsection">
                                            <h5>Cheats:</h5>
                                            <div class="level">
                                                <p>
                                                    Aim Correction (Improved Skooter AC, Optional Tap on Correct for Non-RX Players, Relative Range Support)</br>
                                                    Relax Hack (SkooterRX)</br>
                                                    Timewarp (Both Rate & Multiplier Style)</br>
                                                    Automatic CS Changer</br>
                                                </p>
                                                <p>
                                                    AR Changer</br>
                                                    HD Remover</br>
                                                    FL Remover (Prevents Breaking Rules)</br>
                                                </p>
                                            </div>
                                        </div>
                                        <div class="subsection">
                                            <h5>Other Features:</h5>
                                            <div class="level">
                                                <p>
                                                    In-Game Updater</br>
                                                    Lazer Style UI (SkinVersion 7+)</br>
                                                    Background Beatmap Importing</br>
                                                    Links to original game folder to save space</br>
                                                    Built in Server Switcher</br>
                                                    New Slider Style</br>
                                                    Fail with Relax (Toggle)</br>
                                                    Combo Break Sound with Relax (Toggle)</br>
                                                </p>
                                                <p>
                                                    Lazer Style Triangle Animations</br>
                                                    Rainbow Visualization</br>
                                                    Discord Rich Presence</br>
                                                    Show Misses in Relax (Toggle)</br>
                                                    Boss Key Disable (Toggle)</br>
                                                    Auto Hide Replay Overlay (Toggle)</br>
                                                    Low HP Glow on Relax (Toggle)</br>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="doc-block" v-if="page === 'Abypass'">
                            <div class="doc-notice">
                                <a class="button dl" href="https://abypass.fumo.lol/updater"><i class="fas fa-download"></i>  Download</a>
                                <a class="button dl" href="https://cute.cat-girls.club/u/logytbz.zip"><i class="fas fa-download"></i>  Download Mirror</a>
                            </div>
                            <div class="doc-section">
                                <h3><i class="fas fa-exclamation-circle"></i> Abypass Client:</h3>
                                <div class="subsection">
                                    <h4><b>Abypass is the successor to Skoot.er created by Chewy/Pythr. </b></h4>
                                    <p>Currently Maintained by Aochi.</br>
                                    This client is a better version of Skoot.er with more features and less bugs. </br>
                                    This client tries to comply with our rules, but it is not always updated. </br>
                                    If Kawata/Aeris doesn't work for you, this is the next best, free choice.</p>
                                    <div class="doc-content">
                                        <h3><i class="fas fa-exclamation"></i> Features:</h3>
                                        <div class="subsection">
                                            <h5>Cheats:</h5>
                                            <div class="level">
                                                <p>
                                                    Aim Correction</br>
                                                    HD Remover</br>
                                                    CTB Relax Hack (Control catcher with mouse)</br>
                                                    Automatic CS Changer</br>
                                                </p>
                                                <p>
                                                    Relax Hack</br>
                                                    FL Remover</br>
                                                    Timewarp</br>
                                                    AR Changer</br>
                                                </p>
                                            </div>
                                        </div>
                                        <div class="subsection">
                                            <h5>Other Features:</h5>
                                            <div class="level">
                                                <p>
                                                    In-Game PP Counter</br>
                                                    Uses an updater.</br>
                                                </p>
                                                <p>
                                                    Server Switcher for Kawata & Fuquila</br>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="doc-block" v-if="page === 'Maple'">
                            <div class="doc-notice">
                                <a class="button dl" href="https://maple.software/"><i class="fas fa-download"></i>  Website</a>
                            </div>
                            <div class="doc-section">
                                <h3><i class="fas fa-exclamation-circle"></i> Maple Hack:</h3>
                                <div class="subsection">
                                    <h4><b>Maple is a Premium hack for osu! created by Maple Syrup</b></h4>
                                    <p>It is a very powerful hack that is constantly being updated. </br>
                                    It's main draw is Aim Assist and Relax that is widely considered to be the best in the community. </br>
                                    This hack does not have any built in limits, so you must be careful not to break our rules. </p>
                                    <div class="doc-content">
                                        <h3><i class="fas fa-exclamation"></i> Features:</h3>
                                        <div class="subsection">
                                            <h5>Cheats:</h5>
                                            <div class="level">
                                                <p>
                                                    Aim Assist (3 Versions)</br>
                                                    Relax Hack</br>
                                                    Timewarp</br>
                                                    AR Changer</br>
                                                </p>
                                                <p>
                                                    FL Remover</br>
                                                    HD Remover</br>
                                                    CS Changer</br>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="doc-block" v-if="page === 'Skooter'">
                        </div>
                        <div class="doc-block" v-if="page === 'AQN'">
                        </div>
                        <div class="doc-block" v-if="page === 'osu!rx'">
                            <div class="doc-notice">
                                <a class="button dl" href="https://www.mpgh.net/forum/showthread.php?t=1538659"><i class="fas fa-download"></i>  Download</a>
                            </div>
                            <div class="doc-section">
                                <h3><i class="fas fa-exclamation-circle"></i> osu!rx Hack:</h3>
                                <div class="subsection">
                                    <h4><b>Instructions:</b></h4>
                                    <p>
                                        osu!rx does not run on the latest version of osu!.</br>
                                        You must download <a href="https://osekai.net/snapshots/versions/b20220424/b20220424.zip">this version</a> of osu! to use it.</br>
                                        You must also download <a href="https://cdn.discordapp.com/attachments/598976475579809860/1082594775988981760/osu.exe">this patched exe</a> to use it on our server. This patches the tls to use a higher version required for our server.</br>
                                        In order to prevent the game from updating you need to make a _STAGING file in your osu! folder.</br>
                                    </p>
                                </div>
                                <div class="subsection">
                                    <h4><b>Features:</b></h4>
                                    <div class="level">
                                        <p>
                                            Timewarp</br>
                                            Relax Hack</br>
                                            HitWindow100 Key</br>
                                        </p>
                                        <p>
                                            Playstyles (Single Tap, Alternate, Mouse Only, Tap X)</br>
                                            Hit Timing Randomization</br>
                                            Hit Scan</br>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="panel" class="content" v-if="module === 'FAQ'">
                        <div class="doc-block" v-if="page === 'Main'">
                            <div class="doc-section">
                                <h1>FAQ:</h1>
                                <div class="subsection">

                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="panel" class="content" v-if="module === 'Verification'">
                        <div class="doc-block" v-if="page === 'Main'">
                            <h2>How do I get Verified?</h2>
                            <p><b>
                                We reserve the right to remove your badge and/or re-verify you.</br>
                                New rules may or may not be retroactive at our discretion. 
                            </b></p>
                            <div class="doc-section">
                                <h3><i class="fas fa-hammer"></i> Verification Rules:</h3>
                                <p><b>
                                    These are the rules and conditions that must be met in order to apply for verification of your account.
                                </b></p>
                                <div class="subsection">
                                    <p>
                                        1. The player cannot have one or more wipes in the last three months (self wipes do not count!).</br>
                                        2. The player must have been active (in the community) for the last 3 weeks!</br>
                                        3. The player must have an account that is at least 60 days old.</br>
                                        4. The player either must have a total amount of PP greater than or equaling 25,000 or have at least one 5,000 PP play.</br>
                                        5. The player must have 1-3 liveplays of a single score or multiple scores that are in their top 10 plays (by pp). (These liveplays MUST follow the liveplay rules that are listed below; otherwise, they won't be valid.)
                                    </p>
                                </div>
                            </div>
                            <div class="doc-section">
                                <h3><i class="fas fa-hammer"></i> Liveplay Rules:</h3>
                                <p><b>
                                    These are the rules that must be followed when recording a liveplay for verification.
                                </b></p>
                                <div class="subsection">
                                    <p>
                                        1. Show your hands and monitor every moment of the liveplay. (Webcam or phone cam are allowed if of good enough quality.)
                                        2. Show task manager, and then show the process of injecting/opening (in the case of a client) your cheat.
                                        3. The player must show EVERY setting of the cheat that they are using before and after each play is submitted.
                                        4. The player must save the replay or replays of the score/scores they made and send them along with the liveplay to a member of the <b>Gestion Team or higher</b>.
                                        5. The player must have an analog clock running and visible during their liveplay if they are suspected of using a lower timewarp than allowed.
                                        6. If you are a player that uses more than one client (e.g., Abypass, Maple, and Osubuddy), then you must submit a liveplay using each client to prove your legitimacy.
                                        7. Custom clients for liveplays aren't allowed.
                                    </p>
                                </div>
                            </div>
                            <div class="doc-section">
                                <h3><i class="fas fa-hammer"></i> Special way to get the badge:</h3>
                                <div class="subsection">
                                    <p>
                                    -> The player is known for submitting videos or doing streams of their plays to prove their legitimacy in the Kawata Discord or via Twitch, YouTube, or any other social media website. If you follow this requirement and you don't have the badge already, please DM a member of the Gestion Team or a role above.
                                    </p>
                                </div>
                            </div>
                            <h5>All of the above rules may be changed if we think they should be different or if they are unbalanced.</h5>
                            <div class="doc-section">
                                <h3><i class="fas fa-hammer"></i> Where do I apply to get Verified?</h3>
                                <div class="subsection">
                                    <p>
                                    You can get verified by contacting a Gestion team member or above in the <a href="https://discord.gg/4CzsqkK">Kawata Discord</a>; it will be done as quickly as possible.</br>
                                    </br>
                                    If you have any question, Join our <a href="https://discord.gg/4CzsqkK">Discord</a> and contact any member of our staff team.
                                    </p>
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
var beatmapBus = new Vue();
new Vue({
    el: '#beatmap',
    data: {
        id: null,
        set_id: null,
    },
    async created() {
        const urlParams = new URLSearchParams(window.location.search);
        const urlPath = window.location.pathname;
        const pathParts = urlPath.split('/');
        
        // Check if the URL path matches the expected format
        if (pathParts[1] === 'b') {
            const id = pathParts[2];
            console.log("URL BM ID: " + id + "");
            this.id = parseInt(id);
            this.set_id = await this.fetchMapInfo();
            console.log("Triggering Beatmap Panel with ID: " + this.id + " and Set ID: " + this.set_id + "");
            await setTimeout(() => {
                this.showBeatmapPanel(this.id, this.set_id);
            }, 10);
        }
        if (pathParts[1] === 's') {
            const set_id = pathParts[2];

            console.log("Triggering Beatmap Panel with SetID: " + set_id + "");

            await setTimeout(() => {
                this.showBeatmapPanel(null, parseInt(set_id));
            }, 10); 
        }
    },
    methods: {
        showBeatmapPanel: function(id, set_id) {
            this.id = id || null;
            this.set_id = set_id || null;
            beatmapBus.$emit('show-beatmap-panel', this.id, this.set_id);
        },
        fetchMapInfo: async function() {
            try {
                const response = await fetch(`https://api.` + domain + `/v2/maps/${this.id}`);
                const data = await response.json();
                console.log(data);
                return data.data.set_id;
            } catch (error) {
                // Handle any errors
                console.error(error);
            }
        },
    }
});
new Vue({
    el: '#beatmap-panel',
    data: {
        show: false,
        id: null,
        set_id: null,
        title: "",
        artist: "",
        beatmaps: [],
        selected: {},
        leaderboards: [],
    },
    created: async function() {
        beatmapBus.$on('show-beatmap-panel', (id, set_id) => { 
            this.id = id || null; 
            this.set_id = set_id || null;
            this.init();
        });
        beatmapBus.$on('select-beatmap', (id) => { this.selectMap(id); });
    },
    methods: {
        init: async function() {
            await this.fetchMapInfo();
            this.show = true;
            console.log("Showing Beatmap Panel | ID: " + this.id + "(set: " + this.set_id + ")");
        },
        close: function() {
            this.show = false;
        },
        fetchMapInfo: async function() {
            try {
                const response = await fetch(`https://api.` + domain + `/v2/maps?set_id=${this.set_id}`);
                const data = await response.json();
                const maps = data.data;
                maps.sort((a, b) => a.diff - b.diff);
                this.title = maps[0].title;
                this.artist = maps[0].artist;
                this.beatmaps = maps;
                console.log(data);
                await this.selectMap();
            } catch (error) {
                // Handle any errors
                console.error(error);
            }
        },
        fetchMapLb: async function() {
            if (!this.selected) {
                this.selected = {id: null,};
                if (this.id !== null){this.selected.id = this.id;}
                else {this.selected.id = this.beatmaps[0].id;}
                
            }
            try {
                const response = await fetch(`https://api.` + domain + `/v1/get_map_scores?id=${this.selected.id}&scope=best`);
                const data = await response.json();
                this.leaderboards = data.scores;
                console.log(data);
            } catch (error) {
                // Handle any errors
                console.error(error);
            }
        },
        selectMap: function(id) {
            if (id) {
                console.log("Selected map: " + id + "");
                this.id = id;
            }
            this.leaderboards = [];
            if (this.id === null) {
                this.selected = this.beatmaps[0];
            } else {
                console.log("Selected ID: " + this.id + "");
                console.log("Beatmaps: ");
                console.log(this.beatmaps);
                if (this.beatmaps.length > 0) {
                    console.log("ID Types: ")
                    console.log(typeof this.id, typeof this.beatmaps[0].id);  // Check the types of the ids
                }
                this.selected = this.beatmaps.find(map => map.id === this.id);
            }
            console.log("Selected: ");
            console.log(this.selected);
            this.fetchMapLb();
        },
        playMapAudio: function(setId) {
            const audioElement = document.getElementById('audio-' + setId);
            if (this.currentAudio && this.currentAudio !== audioElement) {
                this.currentAudio.pause();
            }
            if (audioElement.paused) {
                audioElement.play();
            } else {
                audioElement.pause();
            }
            this.currentAudio = audioElement;
        },
    },
    watch: {
        
    },
    template: `
    <div id="beatmap-panel" class="modal" v-bind:class="{ 'is-active': show }" style="z-index: 25;">
        <div class="modal-background" @click="close"></div>
        <div data-panel="Beatmap" id="beatmap-window" class="modal-content" v-if="show">
            <div class="main-block">
                <div class="main-banner">
                    <div class="selector">
                        <a v-for="(map, index) in beatmaps" data-id="beatmapPanel" class="map-diff" style="width: fit-content;" @click="beatmapBus.$emit('select-beatmap', map.id)">
                            <img :src="'/static/images/icons/mode-' + map.mode + '.png'"></img>
                            {{ map.version }}
                        </a>
                    </div>
                    <div id="panel" class="map-stats">
                        <a class="stat-block map-play top" @click="playMapAudio(set_id)">
                            <i class="fas fa-play" :id="'play-' + set_id">
                                <audio :src="'https://b.ppy.sh/preview/' + set_id + '.mp3'" :id="'audio-' + set_id"></audio>
                            </i>
                        </a>
                        <div class="stat-block map-diff">
                            <div style="width: 100%; display: flex; flex-direction: row; justify-content: space-between;">
                                <span class="level-left" style="margin-right: auto;">Circle Size</span><span class="level-right">{{ selected.cs }}</span>
                            </div>
                            <div style="width: 100%; display: flex; flex-direction: row; justify-content: space-between;">
                                <span class="level-left" style="margin-right: auto;">Approach Rate</span><span class="level-right">{{ selected.ar }}</span>
                            </div>
                            <div style="width: 100%; display: flex; flex-direction: row; justify-content: space-between;">
                                <span class="level-left" style="margin-right: auto;">Overall Difficulty</span><span class="level-right">{{ selected.od }}</span>
                            </div>
                            <div style="width: 100%; display: flex; flex-direction: row; justify-content: space-between;">
                                <span class="level-left" style="margin-right: auto;">HP Drain</span><span class="level-right">{{ selected.hp }}</span>
                            </div>
                        </div>
                        <div class="stat-block map-info bottom">
                            
                        </div>
                    </div>
                    <div class="banner-background" v-bind:style="{ backgroundImage: 'url(https://assets.ppy.sh/beatmaps/' + set_id + '/covers/cover.jpg)' }"></div>
                    <div class="banner-overlay"></div>
                </div>
            </div>
            <div id="panel" class="second-block">
                <div id="panel" class="content">
                    <div class="beatmap-info">
                        <div class="info-block">
                            <h2>{{ selected.title }}</h2>
                            <h4>{{ selected.artist }}</h4>
                            <div class="divider"></div>
                            <div class="buttons">
                                <button class="button is-primary" @click="window.location.href = 'https://api.osu.direct/d/' + set_id">Download</button>
                                <button class="button is-primary" @click="window.location.href = 'osu://dl/' + set_id">osu!Direct</button>
                                <button class="button is-primary" @click="window.location.href = 'https://osu.ppy.sh/b/' + selected.id">View on ppy.sh</button>
                            </div>
                        </div>
                        <div class="info-block">
                            <div class="mapper">
                                <!--<div class="mapper-avatar" :style="'background-image: url(https://a.ppy.sh/' + ');'">-->
                                <span>Mapped by: <a :href="'https://osu.ppy.sh/u/' + selected.creator">{{ selected.creator }}</a></span>
                            </div>
                            <div class="rating">

                            </div>
                            <div class="success-rate">
                            
                            </div>
                        </div>
                    </div>
                    <div class="beatmap-lb">
                        <div class="lb-selector">
                        </div>
                        <div class="table-responsive" v-if="leaderboards.length > 0 && leaderboards[0]">
                            <div class="lb-first-place-header">
                                <div class="user-block">
                                    <div class="play-rank">
                                        <span class="score-rank">#1</span>
                                        <span :class="'map-rank rank-' + leaderboards[0].grade">{{ leaderboards[0].grade }}</span>
                                    </div>
                                    <a class="user-avatar" :href="'/u/' + leaderboards[0].userid" :style="'background-image: url(https://a.' + domain + '/' + leaderboards[0].userid + ');'"></a>
                                    <div class="user">
                                        <a class="username"><a v-if="leaderboards[0].clan_id != null">[{{ leaderboards[0].clan_tag }}]</a> <a :href="'/u/' + leaderboards[0].userid">{{ leaderboards[0].player_name }}</a></a>
                                        <div class="score-date">
                                        
                                        </div>
                                        <div class="user-flag" :style="'background-image: url(/static/images/flags/' + leaderboards[0].player_country.toUpperCase() + '.png);'"></div>
                                    </div>
                                </div>
                                <div class="playstats-block">
                                    <div class="beatmap-score-top__stats">
                                        <div class="stat-block stat-bolder">
                                            <div class="stat-title">PP</div>{{ leaderboards[0].pp }}
                                        </div>
                                        <div class="stat-block">
                                            <div class="stat-title">Accuracy</div>{{ leaderboards[0].acc }}%
                                        </div>
                                        <div class="stat-block">
                                            <div class="stat-title">Combo</div>{{ leaderboards[0].max_combo }}x
                                        </div>
                                        <div class="stat-block stat-bolder">
                                            <div class="stat-title">Mods</div>{{ leaderboards[0].mods }}
                                        </div>
                                    </div>
                                    <div class="beatmap-score-top__stats">
                                        <div class="stat-block">
                                            <div class="stat-title">Score</div>{{ leaderboards[0].score }}
                                        </div>
                                        <div class="stat-block">
                                            <div class="stat-title">300</div>{{ leaderboards[0].n300 + leaderboards[0].ngeki }}
                                        </div>
                                        <div class="stat-block">
                                            <div class="stat-title">100</div>{{ leaderboards[0].n100 + leaderboards[0].nkatu }}
                                        </div>
                                        <div class="stat-block">
                                            <div class="stat-title">50</div>{{ leaderboards[0].n50 }}
                                        </div>
                                        <div class="stat-block stat-bolder">
                                            <div class="stat-title">Miss</div>{{ leaderboards[0].nmiss }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="panel" class="bm-lb-bg table-responsive" v-if="leaderboards.length > 0">
                            <table id="panel" class="bm-lb-table table-responsive">
                                <thead id="panel" class="leaderboard-thread">
                                    <tr id="panel">
                                        <th id="panel" class="leaderboard-table__heading table-header-rank"> Rank</th> 
                                        <th id="panel" class="leaderboard-table__heading table-header-grade"></th> 
                                        <th id="panel" class="leaderboard-table__heading table-header-flag"></th> 
                                        <th id="panel" class="leaderboard-table__heading table-header-player">Player</th> 
                                        <th id="panel" class="leaderboard-table__heading table-header-pp">PP</th> 
                                        <th id="panel" class="leaderboard-table__heading table-header-score">Score</th> 
                                        <th id="panel" class="leaderboard-table__heading table-header-acc">Accuracy</th> 
                                        <th id="panel" class="leaderboard-table__heading table-header-combo">Combo</th>
                                        <th id="panel" class="leaderboard-table__heading table-header-hitstat">300</th>
                                        <th id="panel" class="leaderboard-table__heading table-header-hitstat">100</th> 
                                        <th id="panel" class="leaderboard-table__heading table-header-hitstat">50</th> 
                                        <th id="panel" class="leaderboard-table__heading table-header-miss">Miss</th> 
                                        <th id="panel" class="leaderboard-table__heading table-header-mods">Mods</th> 
                                        <th id="panel" class="leaderboard-table__heading table-header-date">Date</th> 
                                        <th id="panel" class="leaderboard-table__heading table-header-report"></th>
                                    </tr>
                                </thead>
                                <tbody id="panel" style="display: table-row-group;">
                                    <tr id="panel" v-for="(score, index) in leaderboards" class="leaderboard-row" :class="index % 2 === 0 ? 'row2p' : 'row1p'">
                                        <td id="panel" class="leaderboard-table__column leaderboard-column__rank"><a @click="scoreBus.$emit('show-score-window', score.id)">#{{ index + 1 }}</a></td>
                                        <td id="panel" class="leaderboard-table__column leaderboard-column__grade">{{ score.grade }}</td>
                                        <td id="panel" class="leaderboard-table__column leaderboard-column__flag"><img :src="'/static/images/flags/' + score.player_country.toUpperCase() + '.png'" class="leaderboard-player-flag"></td>
                                        <td id="panel" class="leaderboard-table__column leaderboard-column__player"><a v-if="score.clan_id != null">[{{ score.clan_tag }}]</a> <a :href="'/u/' + score.userid">{{ score.player_name }}</a></td>
                                        <td id="panel" class="leaderboard-table__column leaderboard-column__pp">{{ score.pp }}</td>
                                        <td id="panel" class="leaderboard-table__column leaderboard-column__score">{{ score.score }}</td>
                                        <td id="panel" class="leaderboard-table__column leaderboard-column__accuracy">{{ score.acc }}%</td>
                                        <td id="panel" class="leaderboard-table__column leaderboard-column__combo">{{ score.max_combo }}x</td>
                                        <td id="panel" class="leaderboard-table__column leaderboard-column__hitstat">{{ score.n300 + score.ngeki }}</td>
                                        <td id="panel" class="leaderboard-table__column leaderboard-column__hitstat">{{ score.n100 + score.nkatu }}</td>
                                        <td id="panel" class="leaderboard-table__column leaderboard-column__hitstat">{{ score.n50 }}</td>
                                        <td id="panel" class="leaderboard-table__column leaderboard-column__miss zero">{{ score.nmiss }}</td>
                                        <td id="panel" class="leaderboard-table__column leaderboard-column__mods">{{ score.mods }}</td>
                                        <td id="panel" class="leaderboard-table__column leaderboard-column__date">{{ score.play_time }}</td>
                                        <td id="panel" class="leaderboard-table__column leaderboard-column__report">Report</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
});