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
        console.log('Users.js User Page Created');
        this.handleUserInput(userquery);
    },
    methods: {
        handleUserInput() {
            clearTimeout(this.searchTimeout);
            if (this.userquery.length > 0)
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
            else {
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
                
            }
        },
    },
    computed: {
    }
});