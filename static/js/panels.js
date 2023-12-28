new Vue({
    el: "#panel",
    delimiters: ["<%", "%>"],
    data() {
        return {
            data: {
                show: false,
                userid: userid,
                panel: '',
            },
        };
    },
    async created() {
    },
    methods: {
        handleUpdate(newData) {
            // handle the new data...
            this.data = newData;
        }
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