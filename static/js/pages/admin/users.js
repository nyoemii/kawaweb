new Vue({
    el: "#users",
    delimiters: ["<%", "%>"],
    data() {
        return {
            flags: window.flags,
            users: {},
            page: 1,
            userquery: '', // changed from 'search' to 'userquery'
            load: false,
            playersLoading: false,
            searchTimeout: null,
        }
    },
    created() {
        console.log('created');
        console.log(users);
        //this.LoadData(JSON.parse(users), parseInt(page), userquery);
        //this.LoadUsers(JSON.parse(users), parseInt(page), userquery);
        this.handleUserInput(userquery);
    },
    methods: {
        LoadData(users, page, userquery) { // changed from 'search' to 'userquery'
            this.$set(this, 'users', users);
            this.$set(this, 'page', page);
            this.$set(this, 'userquery', userquery); // changed from 'search' to 'userquery'
        },
        LoadUsers(users, page, userquery) { // changed from 'search' to 'userquery'
            if (window.event)
                window.event.preventDefault();

            window.history.replaceState('', document.title, `/admin/users/${this.page}`);
            this.$set(this, 'users', users);
            this.$set(this, 'page', page);
            this.$set(this, 'userquery', userquery); // changed from 'search' to 'userquery'
            this.$set(this, 'load', true);
        },
        handleUserInput() {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                const queryUsers = this.userquery;
                const url = `/admin/users/${this.page}?update=true&search=${queryUsers}`;
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        this.users = data;
                        console.log('users:', this.users);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }, 2000);
        },
    },
    computed: {
    }
});