new Vue({
    el: "#dashboard",
    delimiters: ["<%", "%>"],
    data() {
        return {
            flags: window.flags,
            users: {},
            page: 1,
            search: '',
            load: false,
            playersLoading: false,
        }
    },
    created() {
        this.LoadData(users, page, search);
        this.LoadUsers(users, page, search);
    },
    methods: {
        LoadData(users, page, search) {
            this.$set(this, 'users', users);
            this.$set(this, 'page', page);
            this.$set(this, 'search', search);
        },
        LoadUsers(users, page, search) {
            if (window.event)
                window.event.preventDefault();

            window.history.replaceState('', document.title, `/admin/users/${this.page}/${this.search}`);
            this.$set(this, 'users', users);
            this.$set(this, 'page', page);
            this.$set(this, 'search', search);
            this.$set(this, 'load', true);
        },
    },
    computed: {
    }
});
