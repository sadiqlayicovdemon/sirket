import { api } from '../../services/api.js';
import { AuthState } from '../../state/auth.js';
import { supabase } from '../../services/supabase.js';

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
                    <thead><tr><th>ID</th><th>Tarix</th><th>Müştəri</th><th>Məhsul</th><th>Məbləğ</th><th>Status</th><th>Əməliyyat</th></tr></thead>
                    <tbody id="satis-table-body">
                        <tr><td colspan="7" style="text-align:center;"><i class="ph ph-spinner ph-spin"></i> Yüklənir...</td></tr>
                    </tbody>
                </table>
            </div>

            <div id="satis-modal" class="modal hidden">
                <div class="modal-content glass-panel">
                    <div class="modal-header">
                        <h3 id="satis-modal-title">Yeni Satış</h3>
                        <button id="close-satis-modal" class="icon-btn"><i class="ph ph-x"></i></button>
                    </div>
                    <form id="satis-form" class="modal-form">
                        <div class="form-group">
                            <label>Tarix</label>
                            <input type="date" id="satis-date">
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
        const role = AuthState.user?.role;
        const canEditDocs = role === 'Administrator' || role === 'Müdir';

        this._canEditDocs = canEditDocs;
        this._satisEditingId = null;

        this.loadData();
        this.setupRealtime();
        document.getElementById('refresh-satis')?.addEventListener('click', () => this.loadData());

        const modal = document.getElementById('satis-modal');
        const btnNew = document.getElementById('btn-new-satis');
        const btnClose = document.getElementById('close-satis-modal');
        const form = document.getElementById('satis-form');

        document.getElementById('satis-table-body')?.addEventListener('click', async (e) => {
            const deleteBtn = e.target?.closest?.('[data-delete-satis]');
            const editBtn = e.target?.closest?.('[data-edit-satis]');

            if (deleteBtn) {
                if (!canEditDocs) {
                    alert('Yalnız admin və müdir silə bilər.');
                    return;
                }
                const dbId = Number(deleteBtn.dataset.deleteSatis);
                if (!dbId) return;
                const ok = confirm('Bu əməliyyatı silmək istəyirsiniz?');
                if (!ok) return;

                try {
                    await api.deleteSatisRecord(dbId);
                    this.loadData();
                } catch (err) {
                    alert('Silinmə alınmadı: ' + err.message);
                }
                return;
            }

            if (!editBtn) return;
            if (!canEditDocs) {
                alert('Yalnız admin və müdir sənədləri düzəldə bilər.');
                return;
            }
            const dbId = Number(editBtn.dataset.editSatis);
            const row = (this._satisData || []).find(r => r.dbId === dbId);
            if (row) this.openEditModal(row);
        });

        btnNew.addEventListener('click', async () => {
            this._satisEditingId = null;
            document.getElementById('satis-modal-title').textContent = 'Yeni Satış';
            document.getElementById('satis-submit').textContent = 'Yadda Saxla';

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
            this._satisEditingId = null;
            document.getElementById('satis-modal-title').textContent = 'Yeni Satış';
            document.getElementById('satis-submit').textContent = 'Yadda Saxla';
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const isEdit = this._satisEditingId !== null && this._satisEditingId !== undefined;
            if (isEdit && !canEditDocs) {
                alert('Yalnız admin və müdir sənədləri düzəldə bilər.');
                return;
            }
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
                if (isEdit) {
                    await api.updateSatisRecord(this._satisEditingId, { date, customer, amount: amountValue });
                } else {
                    await api.addSatisRecord({ date, customer, amount: amountValue });
                }
                modal.classList.add('hidden');
                modal.classList.remove('modal-active');
                this.loadData();
                this._satisEditingId = null;
                document.getElementById('satis-modal-title').textContent = 'Yeni Satış';
            } catch (err) {
                alert('Satış qeydə alınmadı: ' + err.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Yadda Saxla';
            }
        });
    },

    setupRealtime() {
        if (!supabase) return;
        try {
            if (this._satisChannel) supabase.removeChannel(this._satisChannel);
        } catch (_) {}

        this._satisChannel = supabase
            .channel('sales_records_realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'sales_records' },
                () => this.loadData()
            )
            .subscribe();
    },

    openEditModal(row) {
        if (!this._canEditDocs) return;
        this._satisEditingId = row.dbId;

        const modal = document.getElementById('satis-modal');
        const modalTitle = document.getElementById('satis-modal-title');
        const submitBtn = document.getElementById('satis-submit');
        const dateInput = document.getElementById('satis-date');
        const customerSelect = document.getElementById('satis-customer');
        const amountInput = document.getElementById('satis-amount');

        if (!modal || !modalTitle || !submitBtn) return;

        modalTitle.textContent = 'Düzəliş et';
        submitBtn.textContent = 'Yenilə';
        submitBtn.disabled = false;

        dateInput.disabled = false;
        dateInput.value = String(row.date || '').slice(0, 10);

        customerSelect.disabled = false;
        customerSelect.required = true;
        customerSelect.innerHTML = '';
        const opt = document.createElement('option');
        opt.value = row.customer || '';
        opt.textContent = row.customer || '';
        customerSelect.appendChild(opt);
        customerSelect.value = row.customer || '';

        const abs = api.parseMoney(row.amount);
        amountInput.value = abs.toFixed(2);

        modal.classList.remove('hidden');
        modal.classList.add('modal-active');
    },

    async loadData() {
        const tbody = document.getElementById('satis-table-body');
        if (!tbody) return;
        
        try {
            // Use local date key to avoid timezone issues on mobile/tablet.
            const todayStr = api.dateKey(new Date());
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;"><i class="ph ph-spinner ph-spin"></i> API-dən məlumat çəkilir...</td></tr>';
            const res = await api.getSatisList();
            
            const todaySales = res.data
                .filter(row => api.dateKey(row.date) === todayStr)
                .reduce((sum, row) => {
                    return sum + api.parseMoney(row.amount);
                }, 0);

            const todaySalesEl = document.getElementById('stat-today-sales');
            if (todaySalesEl) {
                todaySalesEl.textContent = `${todaySales.toLocaleString('az-AZ')} ₼`;
            }

            this._satisData = res.data || [];
            tbody.innerHTML = this._satisData.map(row => `
                <tr>
                    <td>${row.id}</td>
                    <td>${api.formatDateTime(row.date)}</td>
                    <td>${row.customer}</td>
                    <td>${row.product}</td>
                    <td>${row.amount}</td>
                    <td><span class="status-badge ${row.statusClass}">${row.status}</span></td>
                    <td>
                        ${
                            this._canEditDocs
                                ? `
                                    <div style="display:flex; gap:8px; justify-content:flex-end;">
                                        <button class="btn-outline btn-sm btn-danger" data-delete-satis="${row.dbId}">Sil</button>
                                        <button class="btn-outline btn-sm" data-edit-satis="${row.dbId}">Düzəliş</button>
                                    </div>
                                `
                                : '-'
                        }
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="7" style="color:var(--danger); text-align:center;">Xəta baş verdi!</td></tr>';
        }
    }
};
