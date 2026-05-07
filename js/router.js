import { AuthState } from './state/auth.js';
import { Dashboard } from './components/Dashboard.js';
import { Login } from './components/Login.js';

export const Router = {
    currentRoute: null,
    routes: {
        '/login': Login,
        '/dashboard': Dashboard
    },

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    },

    navigate(path) {
        window.location.hash = path;
    },

    handleRoute() {
        const path = window.location.hash.replace('#', '') || '/';
        const root = document.getElementById('app');

        // Check auth
        if (!AuthState.isAuthenticated() && path !== '/login') {
            this.navigate('/login');
            return;
        }

        if (AuthState.isAuthenticated() && (path === '/login' || path === '/')) {
            this.navigate('/dashboard');
            return;
        }

        // Determine base route
        let baseRoute = path;
        if (path.startsWith('/dashboard')) {
            baseRoute = '/dashboard';
        }

        const component = this.routes[baseRoute] || this.routes['/login'];
        
        // Re-render if route changed completely
        if (this.currentRoute !== baseRoute) {
            this.currentRoute = baseRoute;
            root.innerHTML = '';
            root.appendChild(component.render());
            if (component.afterRender) {
                component.afterRender();
            }
        }

        // Handle sub-routing within dashboard
        if (baseRoute === '/dashboard' && component.handleSubRoute) {
            const subPath = path.split('/')[2] || 'kassa';
            component.handleSubRoute(subPath);
        }
    }
};
