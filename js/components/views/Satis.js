import { api } from '../../services/api.js';

export const SatisView = {
    render() {
        const div = document.createElement('div');
        div.className = 'view-section active';
        div.innerHTML = `
            <div class="page-header">
                <h2>Satış (Müasir)</h2>
                <p>Satış əməliyyatları və statistikası</p>
            </div>
            <div class="stats-grid">
                <div class="stat-card glass-panel">
                    <div class="stat-icon primary"><i class="ph ph-shopping-bag"></i></div>
                    <div class="stat-details"><p>Bugünkü Satış</p><h3 id="stat-today-sales">0 ₼</h3></div>
                </div>
                <div class="stat-card glass-panel">
                    <div class="stat-icon warning"><i class="ph ph-clock"></i></div>
                    <div class="stat-details"><p>Gözləyən Sifarişlər</p><h3>14</h3></div>
                </div>
            </div>
            <div class="table-container glass-panel mt-4">
                <div class="table-header">
                    <h3>Son Satışlar</h3>
                    <div>
                        <button class="btn-primary btn-sm" id="btn-new-satis"><i class="ph ph-plus"></i> Yeni Satış</button>
                        <button class="btn-outline btn-sm" id="refresh-satis">Yenilə</button>
                    </div>
                </div>
                <table class="data-table">
                    <thead><tr><th>ID</th><th>Tarix</th><th>Müştəri</th><th>Məhsul</th><th>Məbləğ</th><th>Status</th></tr></thead>
                    <tbody id="satis-table-body">
                        <tr><td colspan="6" style="text-align:center;"><i class="ph ph-spinner ph-spin"></i> Yüklənir...</td></tr>
                    </tbody>
                </table>
            </div>

            <div id="satis-modal" class="modal hidden">
                <div class="modal-content glass-panel">
                    <div class="modal-header">
                        <h3>Yeni Satış</h3>
                        <button id="close-satis-modal" class="icon-btn"><i class="ph ph-x"></i></button>
                    </div>
                    <form id="satis-form" class="modal-form">
                        <div class="form-group">
                            <label>Tarix</label>
                            <input type="date" id="satis-date" disabled>
                        </div>
                        <div class="form-group">
                            <label>Müştəri *</label>
                            <select id="satis-customer" required>
                                <option value="">Alıcı seçin...</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Məbləğ (₼) *</label>
                            <input type="number" id="satis-amount" min="0" step="0.01" placeholder="0.00" required>
                        </div>
                        <button type="submit" class="btn-primary" id="satis-submit" style="width:100%; margin-top:15px;">Yadda Saxla</button>
                    </form>
                </div>
            </div>
        `;
        return div;
    },

    async afterRender() {
        this.loadData();
        document.getElementById('refresh-satis')?.addEventListener('click', () => this.loadData());

        const modal = document.getElementById('satis-modal');
        const btnNew = document.getElementById('btn-new-satis');
        const btnClose = document.getElementById('close-satis-modal');
        const form = document.getElementById('satis-form');

        btnNew.addEventListener('click', async () => {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            document.getElementById('satis-date').value = `${year}-${month}-${day}`;
            document.getElementById('satis-amount').value = '';
            document.getElementById('satis-customer').innerHTML = '<option value="">Yüklənir...</option>';
            modal.classList.remove('hidden');
            modal.classList.add('modal-active');

            try {
                const buyers = await api.getBuyersList();
                const select = document.getElementById('satis-customer');
                select.innerHTML = '<option value="">Alıcı seçin...</option>';
                buyers.data.forEach(buyer => {
                    const option = document.createElement('option');
                    option.value = buyer.name;
                    option.textContent = buyer.name;
                    select.appendChild(option);
                });
            } catch (err) {
                console.error('Alıcılar yüklənmədi:', err);
                document.getElementById('satis-customer').innerHTML = '<option value="">Xəta baş verdi</option>';
            }
        });

        btnClose.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.classList.remove('modal-active');
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const customer = document.getElementById('satis-customer').value;
            const amountValue = document.getElementById('satis-amount').value;
            const date = document.getElementById('satis-date').value;

            if (!customer || !amountValue) {
                alert('Zəhmət olmasa, müştəri və məbləği daxil edin.');
                return;
            }

            const submitBtn = document.getElementById('satis-submit');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Yadda saxlanılır...';

            try {
                await api.addSatisRecord({ date, customer, amount: amountValue });
                modal.classList.add('hidden');
                modal.classList.remove('modal-active');
                this.loadData();
            } catch (err) {
                alert('Satış qeydə alınmadı: ' + err.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Yadda Saxla';
            }
        });
    },

    async loadData() {
        const tbody = document.getElementById('satis-table-body');
        if (!tbody) return;
        
        try {
            const todayStr = api.dateKey(new Date().toISOString());
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;"><i class="ph ph-spinner ph-spin"></i> API-dən məlumat çəkilir...</td></tr>';
            const res = await api.getSatisList();
            
            const todaySales = res.data
                .filter(row => api.dateKey(row.date) === todayStr)
                .reduce((sum, row) => {
                    const amount = parseFloat(row.amount.toString().replace(/[^\d.-]/g, '')) || 0;
                    return sum + amount;
                }, 0);

            const todaySalesEl = document.getElementById('stat-today-sales');
            if (todaySalesEl) {
                todaySalesEl.textContent = `${todaySales.toLocaleString('az-AZ')} ₼`;
            }

            tbody.innerHTML = res.data.map(row => `
                <tr>
                    <td>${row.id}</td>
                    <td>${api.formatDateTime(row.date)}</td>
                    <td>${row.customer}</td>
                    <td>${row.product}</td>
                    <td>${row.amount}</td>
                    <td><span class="status-badge ${row.statusClass}">${row.status}</span></td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="6" style="color:var(--danger); text-align:center;">Xəta baş verdi!</td></tr>';
        }
    }
};
