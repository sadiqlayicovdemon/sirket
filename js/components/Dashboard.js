import { AuthState } from '../state/auth.js';
import { Router } from '../router.js';
import { KassaView } from './views/Kassa.js';
import { SatisView } from './views/Satis.js';
import { DaxilOlmalarView } from './views/DaxilOlmalar.js';
import { FakturalarView } from './views/Fakturalar.js';
import { MusteriView } from './views/Musteri.js';

export const Dashboard = {
    render() {
        const section = document.createElement('section');
        section.id = 'dashboard-section';
        const user = AuthState.user;

        section.innerHTML = `
            <div class="dashboard-layout">
                <aside class="sidebar glass-panel">
                    <div class="sidebar-header">
                        <i class="ph ph-briefcase logo-icon"></i>
                        <h2>BiznesPanel</h2>
                    </div>
                    
                    <div class="user-profile">
                        <div class="avatar">
                            <i class="ph ph-user-circle"></i>
                        </div>
                        <div class="user-info">
                            <h3>${user.name}</h3>
                            <span class="badge">${user.role}</span>
                        </div>
                    </div>

                    <nav class="sidebar-nav">
                        <a href="#/dashboard/kassa" class="nav-item" data-view="kassa">
                            <i class="ph ph-wallet"></i><span>Kassa</span>
                        </a>
                        <a href="#/dashboard/satis" class="nav-item" data-view="satis">
                            <i class="ph ph-shopping-cart"></i><span>Satış</span>
                        </a>
                        <a href="#/dashboard/daxil-olmalar" class="nav-item" data-view="daxil-olmalar">
                            <i class="ph ph-package"></i><span>Daxil olmalar</span>
                        </a>
                        <a href="#/dashboard/fakturalar" class="nav-item" data-view="fakturalar">
                            <i class="ph ph-receipt"></i><span>Fakturalar</span>
                        </a>
                        <a href="#/dashboard/musteri" class="nav-item" data-view="musteri">
                            <i class="ph ph-address-book"></i><span>Müşteri & Xərc</span>
                        </a>
                    </nav>

                    <div class="sidebar-footer">
                        <button id="logout-btn" class="nav-item text-danger">
                            <i class="ph ph-sign-out"></i><span>Çıxış et</span>
                        </button>
                    </div>
                </aside>

                <main class="main-content">
                    <header class="top-header">
                        <div class="header-search">
                            <i class="ph ph-magnifying-glass"></i>
                            <input type="text" placeholder="Axtarış...">
                        </div>
                        <div class="header-actions">
                            <button class="icon-btn"><i class="ph ph-bell"></i></button>
                            <button class="icon-btn"><i class="ph ph-gear"></i></button>
                        </div>
                    </header>

                    <div class="content-area" id="dashboard-content">
                        <!-- Views injected here -->
                    </div>
                </main>
            </div>
        `;
        return section;
    },

    afterRender() {
        document.getElementById('logout-btn').addEventListener('click', () => {
            AuthState.logout();
            Router.navigate('/login');
        });
    },

    handleSubRoute(viewName) {
        // Update Active Nav
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => {
            if (el.dataset.view === viewName) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });

        const content = document.getElementById('dashboard-content');
        if (!content) return;

        content.innerHTML = '<div style="text-align:center; padding: 50px;"><i class="ph ph-spinner ph-spin" style="font-size:2rem; color:var(--primary);"></i> Yüklənir...</div>';

        // Lazy load views
        setTimeout(() => {
            content.innerHTML = '';
            if (viewName === 'kassa') {
                content.appendChild(KassaView.render());
                if(KassaView.afterRender) KassaView.afterRender();
            } else if (viewName === 'satis') {
                content.appendChild(SatisView.render());
                if(SatisView.afterRender) SatisView.afterRender();
            } else if (viewName === 'daxil-olmalar') {
                content.appendChild(DaxilOlmalarView.render());
                if(DaxilOlmalarView.afterRender) DaxilOlmalarView.afterRender();
            } else if (viewName === 'fakturalar') {
                content.appendChild(FakturalarView.render());
                if(FakturalarView.afterRender) FakturalarView.afterRender();
            } else if (viewName === 'musteri') {
                content.appendChild(MusteriView.render());
                if(MusteriView.afterRender) MusteriView.afterRender();
            }
        }, 100); // UI delay for transition
    }
};
