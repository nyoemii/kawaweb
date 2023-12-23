new Vue({
    el: "#app",
    delimiters: ["<%", "%>"],
    data() {
        return {
            flags: window.flags,
            clans : {},
            load : false,
            no_player : false, // soon
        };
    },
    created() {
        this.LoadClans(page);
    },
    methods: {
        LoadClans(page) {
            if (window.event)
                window.event.preventDefault();

            window.history.replaceState('', document.title, `/clans`);
            this.$set(this, 'page', page);
            this.$set(this, 'load', true);
            this.$axios.get(`${window.location.protocol}//api.${domain}/v2/clans`, { params: {
                page: this.StrtoGulagInt()
            }}).then(res => {
                this.clans = res.data.data;
                this.$set(this, 'load', false);
            });
        },
    },
    computed: {}
});
