
// sticky header
$(window).scroll(() => {
    var header = document.getElementById("navbar");
    var sticky = header.offsetTop;

    if (window.pageYOffset > sticky) {
        header.classList.add("minimized");
    } else {
        header.classList.remove("minimized");
    }
});

//toggle navbar for mobile
function togglenavbar() {
    document.getElementById('navbar').classList.toggle("is-active");
    document.getElementById('navbar-burger').classList.toggle("is-active");
}
var panelBus = new Vue();
new Vue({
    el: "#panel",
    delimiters: ["<%", "%>"],
    data() {
        return {
            data: {
                show: false,
                panel: '',
                panelData: {},
            },
        };
    },
    async created() {
        panelBus.$on('show-score-window', (scoreId) => { 
            // Reset Score Window Data
            this.data = {
                show: true,
                panel: 'Score',
            };
            this.data.panelData = {
                scoreId: scoreId,
                score: null,
                video: null,
                renderedreplayurl: '',
                progress: 0,
            };
        });
    },
    methods: {
        handleUpdate(newData) {
            // handle the new data...
            this.data = newData;
        },
        close: function() {
            this.show = false;
        },
    },
    computed: {}
});
vue.component('beatmap-panel', { 
    props: ['beatmap'],
    template: `
    
    `,
    methods: {
        handleUpdate(newData) {
            // handle the new data...
            this.data = newData;
        }
    },
    computed: {},
    created() {
    },
    mounted() {
    },
    updated() {
    },
    destroyed() {
    },
    watch: {
    },
    components: {
    },
    directives: {
    },
    filters: {
    },
    mixins: [],
    extends: {},
    beforeCreate() {
    }
});