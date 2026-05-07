export const AuthState = {
    user: null,

    login(userData) {
        this.user = userData;
        localStorage.setItem('authUser', JSON.stringify(userData));
    },

    logout() {
        this.user = null;
        localStorage.removeItem('authUser');
    },

    checkAuth() {
        const stored = localStorage.getItem('authUser');
        if (stored) {
            this.user = JSON.parse(stored);
        }
        return this.user;
    },

    isAuthenticated() {
        return this.user !== null;
    }
};
