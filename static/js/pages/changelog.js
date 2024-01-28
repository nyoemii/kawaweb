new Vue({
    el: "#app",
    delimiters: ["<%", "%>"],
    data() {
        return {
            flags: window.flags,
            changelogs: [],
            logs: [],
            type: 'frontend',
            category: 'all',
            load: true,
        };
    },
    created() {
        console.log("Loading Changelog Page");
        this.changelogs = window.changelogs;
        console.log(this.changelogs);
        this.LoadData(this.changelogs, this.type, this.category); // Access as properties of `this`
        this.LoadChangelogs(this.changelogs, this.type, this.category); // Access as properties of `this`
    },
    methods: {
        LoadData(changelogs, type, category) {
            this.$set(this, 'changelogs', changelogs);
            this.$set(this, 'type', type);
            this.$set(this, 'category', category);
        },
        LoadChangelogs(changelogs, type, category) {
            if (window.event)
                window.event.preventDefault();

            window.history.replaceState('', document.title, `/changelog/${this.type}/${this.category}`);

            // Map type from string to integer
            const typeMap = {
                'frontend': 0,
                'backend': 1,
                'client': 2
            };
            const typeInt = typeMap[type];
            // Filter changelogs based on type and category
            const filteredChangelogs = changelogs.filter(changelog => {
                return (changelog.type === typeInt) && (category === 'all' || changelog.category === category);
            });

            // Sort filtered changelogs by time column in descending order
            filteredChangelogs.sort((a, b) => b.time - a.time);

            this.$set(this, 'logs', filteredChangelogs);
            this.$set(this, 'type', type);
            this.$set(this, 'category', category);
            this.$set(this, 'load', false);
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
    },
});