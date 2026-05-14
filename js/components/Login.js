import { api } from '../services/api.js';
import { AuthState } from '../state/auth.js';
import { Router } from '../router.js';

export const Login = {
    render() {
        const section = document.createElement('section');
        section.id = 'login-section';
        section.className = 'active';
        
        section.innerHTML = `
            <div class="login-company-brand login-company-brand--page" aria-label="QUSEYNOFF MMC">
                <span class="login-company-brand__glow" aria-hidden="true"></span>
                <span class="login-company-brand__ring" aria-hidden="true"></span>
                <div class="login-company-brand__inner">
                    <span class="login-company-brand__word">QUSEYNOFF</span>
                    <span class="login-company-brand__suffix">MMC</span>
                </div>
            </div>
            <div class="login-container">
                <div class="glass-panel login-panel">
                    <div class="login-header">
                        <i class="ph ph-briefcase logo-icon"></i>
                        <h1>Sistemə Giriş</h1>
                        <p>Biznes panelinə xoş gəlmisiniz (Müasir)</p>
                    </div>
                    <form id="login-form">
                        <div class="input-group">
                            <i class="ph ph-user"></i>
                            <input type="text" id="username" placeholder="İstifadəçi adı (admin, mudur, muhasib)" required autocomplete="off">
                        </div>
                        <div class="input-group">
                            <i class="ph ph-lock"></i>
                            <input type="password" id="password" placeholder="Şifrə (123)" required autocomplete="off">
                        </div>
                        <button type="submit" id="login-btn" class="btn-primary">
                            <span>Daxil ol</span>
                            <i class="ph ph-arrow-right"></i>
                        </button>
                        <div id="login-error" class="error-msg">İstifadəçi adı və ya şifrə yanlışdır</div>
                    </form>
                </div>
            </div>
        `;
        return section;
    },

    afterRender() {
        const form = document.getElementById('login-form');
        const errorDiv = document.getElementById('login-error');
        const btn = document.getElementById('login-btn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            try {
                btn.innerHTML = `<i class="ph ph-spinner ph-spin"></i> Gözləyin...`;
                btn.disabled = true;
                
                const response = await api.login(username, password);
                
                if (response.success) {
                    AuthState.login(response.data);
                    Router.navigate('/dashboard/kassa');
                }
            } catch (err) {
                errorDiv.textContent = err.message;
                errorDiv.style.display = 'block';
                setTimeout(() => errorDiv.style.display = 'none', 3000);
            } finally {
                btn.innerHTML = `<span>Daxil ol</span><i class="ph ph-arrow-right"></i>`;
                btn.disabled = false;
            }
        });
    }
};
