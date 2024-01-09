var docsBus = new Vue();
new Vue({
    el: '#docs',
    methods: {
        showDocsPanel: function() {
            docsBus.$emit('show-docs-panel');
        }
    },
});
new Vue({
    el: '#docs-panel',
    data: {
        show: false,
        docId: '', 
        module: 'Rules' // added module data property
    },
    created: function() {
        docsBus.$on('show-docs-panel', (docId) => { 
            this.docId = docId; 
            this.show = true;
        });
    },
    methods: {
        close: function() {
            this.show = false;
        },
        LoadDoc(module) {
            console.log(`Loading ${module} doc...`); // placeholder print statement
            this.module = module;
        },
    },
    watch: {
            
    },
    template: `
        <div id="docs-modal" class="modal" v-bind:class="{ 'is-active': show }">
            <div class="modal-background" @click="close"></div>
            <div id="docs-window" class="modal-content" v-if="show">
                <div class="main-block">
                    <div class="docs-banner">
                        <div class="docs-banner img" style="height: fit-content" :style="{
                            backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5)), url(/static/images/banners/' + module + '.jpg)'
                        }" v-if="module === 'Rules'">
                        </div>
                        <h1 class="docs-banner title">Docs</h1>
                        <div id="docs-selector" class="selector">
                            <a class="bottom-tab" v-bind:class="{ 'active': module === 'Rules' }"
                            @click="LoadDoc('Rules', module)">
                                <i class="fas fa-user"></i><span class="modetext"> Rules </span>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="second-block">
                    <div class="content" v-if="module === 'Rules'">
                        <div class="doc-block">
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
                            <div class="doc-section">
                                <h3><i class="fas fa-exclamation-circle"></i> Gamemode Specific Rules</h3>
                                <div class="subsection">
                                    <h4><b>CTB:</b></h4>
                                    Hyperwalk maps are not allowed.
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
                            <div class="doc-section">
                                <h3><i class="game icon"></i> Score Hunting</h3>
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
                </div>
            </div>
        </div>
    </div>
    </div>
    `
});