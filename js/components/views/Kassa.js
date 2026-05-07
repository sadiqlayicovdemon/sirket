import { api } from '../../services/api.js';
import { AuthState } from '../../state/auth.js';
import { supabase } from '../../services/supabase.js';

export const KassaView = {
    render() {
        const div = document.createElement('div');
        div.className = 'view-section active';
        div.innerHTML = `
            <div class="page-header" style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h2>Kassa (Müasir)</h2>
                    <p>Ümumi maliyyə vəziyyəti - Async Data</p>
                </div>
                <button class="btn-primary" id="btn-new-kassa"><i class="ph ph-plus"></i> Yeni Sənəd</button>
            </div>
            <div class="stats-grid">
                <div class="stat-card glass-panel">
                    <div class="stat-icon income"><i class="ph ph-wallet"></i></div>
                    <div class="stat-details"><p>İlkin Qalıq</p><h3 id="stat-initial">0 ₼</h3></div>
                </div>
                <div class="stat-card glass-panel">
                    <div class="stat-icon income"><i class="ph ph-trend-up"></i></div>
                    <div class="stat-details"><p>Mədaxil</p><h3 id="stat-income">0 ₼</h3></div>
                </div>
                <div class="stat-card glass-panel">
                    <div class="stat-icon expense"><i class="ph ph-trend-down"></i></div>
                    <div class="stat-details"><p>Məxaric</p><h3 id="stat-expense">0 ₼</h3></div>
                </div>
                <div class="stat-card glass-panel">
                    <div class="stat-icon balance"><i class="ph ph-note"></i></div>
                    <div class="stat-details"><p>Xərc</p><h3 id="stat-cost">0 ₼</h3></div>
                </div>
                <div class="stat-card glass-panel">
                    <div class="stat-icon balance"><i class="ph ph-calculator"></i></div>
                    <div class="stat-details"><p>Son Qalıq</p><h3 id="stat-final">0 ₼</h3></div>
                </div>
            </div>

            <div class="stats-grid mt-4">
                <div class="stat-card glass-panel" style="justify-self:start; max-width:320px; padding:16px; display:flex; flex-direction:column; gap:12px;">
                    <div style="display:flex; flex-direction:column; gap:4px;">
                        <span style="font-size:13px; color:rgba(255,255,255,0.8);">Ümumi Mədaxil:</span>
                        <span id="stat-income-total" style="font-size:16px; color:var(--success);">0 ₼</span>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:4px; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">
                        <span style="font-size:13px; color:rgba(255,255,255,0.8);">Ümumi Xərc:</span>
                        <span id="stat-total-expense" style="font-size:16px; color:var(--danger);">0 ₼</span>
                    </div>
                </div>
            </div>
            
            <div class="table-container glass-panel mt-4">
                <div class="table-header">
                    <h3>Kassa Əməliyyatları</h3>
                    <button class="btn-outline btn-sm" id="refresh-kassa"><i class="ph ph-arrows-clockwise"></i> Yenilə</button>
                </div>
                <table class="data-table">
                    <thead><tr><th>Tarix</th><th>Müştəri / Şəxs</th><th>Təyinat</th><th>Növ</th><th>Məbləğ</th><th>Əməliyyat</th></tr></thead>
                    <tbody id="kassa-table-body">
                        <tr><td colspan="6" style="text-align:center;"><i class="ph ph-spinner ph-spin"></i> Yüklənir...</td></tr>
                    </tbody>
                </table>

            </div>

            <!-- Modal for New Document -->
            <div id="kassa-modal" class="modal hidden">
                <div class="modal-content glass-panel">
                    <div class="modal-header">
                        <h3 id="k-modal-title">Yeni Əməliyyat</h3>
                        <button id="close-modal" class="icon-btn"><i class="ph ph-x"></i></button>
                    </div>
                    <form id="kassa-form" class="modal-form">
                        <div class="form-group">
                            <label>Tarix</label>
                            <input type="date" id="k-date" required>
                        </div>
                        <div class="form-group">
                            <label>Növ *</label>
                            <select id="k-type" required>
                                <option value="">Sənəd növünü seçin...</option>
                                <option value="Mədaxil">Mədaxil (+)</option>
                                <option value="Məxaric">Məxaric (-)</option>
                                <option value="Xerc">Xerc (-)</option>
                            </select>
                        </div>
                        <div class="form-group" id="customer-group" style="display:none;">
                            <label id="customer-label">Müştəri seçin</label>
                            <select id="k-customer" required>
                                <option value="">Seçim edin...</option>
                            </select>
                        </div>
                        <div class="form-group" id="desc-group">
                            <label>Təyinat</label>
                            <input type="text" id="k-desc" placeholder="İsteğe bağlı - boş buraxıla bilər">
                        </div>
                        <div class="form-group" id="expense-group" style="display:none;">
                            <label>Xərc maddəsi</label>
                            <select id="k-expense" required>
                                <option value="">Xərc maddəsini seçin...</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Məbləğ (₼)</label>
                            <input type="number" id="k-amount" min="0" step="0.01" placeholder="0.00" required>
                        </div>
                        <button type="submit" class="btn-primary" id="k-submit" style="width:100%; margin-top:15px;">Yarat</button>
                    </form>
                </div>
            </div>
        `;
        return div;
    },

    async afterRender() {
        const role = AuthState.user?.role;
        const canEditDocs = role === 'Administrator' || role === 'Müdir';

        this.loadData();
        this.setupRealtime();
        document.getElementById('kassa-table-body')?.addEventListener('click', async (e) => {
            const deleteBtn = e.target?.closest?.('[data-delete-kassa]');
            const editBtn = e.target?.closest?.('[data-edit-kassa]');

            if (deleteBtn) {
                if (!canEditDocs) {
                    alert('Yalnız admin və müdir silə bilər.');
                    return;
                }
                const id = Number(deleteBtn.dataset.deleteKassa);
                if (!id) return;
                const ok = confirm('Bu əməliyyatı silmək istəyirsiniz?');
                if (!ok) return;

                try {
                    await api.deleteKassaRecord(id);
                    this._kassaEditingId = null;
                    modal.classList.add('hidden');
                    modal.classList.remove('modal-active');
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
            const id = Number(editBtn.dataset.editKassa);
            const row = (this._todayKassaData || []).find(r => r.id === id);
            if (row) this.openEditModal(row);
        });
        
        // Listeners
        document.getElementById('refresh-kassa')?.addEventListener('click', () => this.loadData());
        
        const modal = document.getElementById('kassa-modal');
        const btnNew = document.getElementById('btn-new-kassa');
        const btnClose = document.getElementById('close-modal');
        const form = document.getElementById('kassa-form');
        const submitBtn = document.getElementById('k-submit');

        this._canEditDocs = canEditDocs;
        this._kassaEditingId = null;

        btnNew.addEventListener('click', async () => {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            
            form.reset();
            document.getElementById('k-date').value = `${year}-${month}-${day}`;
            document.getElementById('k-modal-title').textContent = 'Yeni Əməliyyat';
            submitBtn.textContent = 'Yarat';
            submitBtn.disabled = false;
            this._kassaEditingId = null;
            document.getElementById('customer-group').style.display = 'none';
            document.getElementById('expense-group').style.display = 'none';
            document.getElementById('k-desc').value = '';
            document.getElementById('k-expense').innerHTML = '<option value="">Xərc maddəsini seçin...</option>';
            modal.classList.remove('hidden');
            modal.classList.add('modal-active');
        });

        // Type change handler
        const typeSelect = document.getElementById('k-type');
        const customerGroup = document.getElementById('customer-group');
        const customerSelect = document.getElementById('k-customer');
        const customerLabel = document.getElementById('customer-label');
        const descGroup = document.getElementById('desc-group');
        const descInput = document.getElementById('k-desc');
        const expenseGroup = document.getElementById('expense-group');
        const expenseSelect = document.getElementById('k-expense');

        typeSelect?.addEventListener('change', async (e) => {
            const selectedType = e.target.value;
            descInput.value = '';
            customerSelect.value = '';
            expenseSelect.value = '';
            expenseSelect.innerHTML = '<option value="">Xərc maddəsini seçin...</option>';
            customerSelect.required = false;
            descInput.required = false;
            expenseSelect.required = false;

            if (!selectedType) {
                customerGroup.style.display = 'none';
                expenseGroup.style.display = 'none';
                descGroup.style.display = 'block';
                return;
            }

            if (selectedType === 'Mədaxil' || selectedType === 'Məxaric') {
                customerGroup.style.display = 'block';
                expenseGroup.style.display = 'none';
                descGroup.style.display = 'block';
                descInput.required = false;
                customerSelect.required = true;
                descInput.placeholder = 'İsteğe bağlı - boş buraxıla bilər';

                customerLabel.textContent = selectedType === 'Mədaxil' ? 'Alıcı seçin' : 'Satıcı seçin';
                customerSelect.innerHTML = '<option value="">Yüklənir...</option>';
                customerSelect.disabled = true;

                try {
                    const res = selectedType === 'Mədaxil'
                        ? await api.getBuyersList?.() || { data: [] }
                        : await api.getSellersList?.() || { data: [] };
                    const list = res.data || [];
                    customerSelect.innerHTML = `<option value="">${selectedType === 'Mədaxil' ? 'Alıcı seçin...' : 'Satıcı seçin...'}</option>`;
                    list.forEach(item => {
                        const option = document.createElement('option');
                        option.value = typeof item === 'object' ? item.name : item;
                        option.textContent = typeof item === 'object' ? item.name : item;
                        customerSelect.appendChild(option);
                    });
                } catch (err) {
                    console.error('Məlumat yüklənə bilmədi:', err);
                    customerSelect.innerHTML = '<option value="">Xəta baş verdi</option>';
                } finally {
                    customerSelect.disabled = false;
                }
            } else if (selectedType === 'Xerc') {
                customerGroup.style.display = 'none';
                expenseGroup.style.display = 'block';
                descGroup.style.display = 'none';
                expenseSelect.required = true;

                try {
                    const res = await api.getExpenseItems?.() || { data: [] };
                    const items = res.data || [];
                    expenseSelect.innerHTML = '<option value="">Xərc maddəsi seçin...</option>';
                    items.forEach(item => {
                        const option = document.createElement('option');
                        option.value = typeof item === 'object' ? item.name : item;
                        option.textContent = typeof item === 'object' ? item.name : item;
                        expenseSelect.appendChild(option);
                    });
                } catch (err) {
                    console.error('Xərc maddələri yüklənmədi:', err);
                    expenseSelect.innerHTML = '<option value="">Xəta baş verdi</option>';
                }
            }
        });

        btnClose.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.classList.remove('modal-active');
            this._kassaEditingId = null;
            document.getElementById('k-modal-title').textContent = 'Yeni Əməliyyat';
            submitBtn.textContent = 'Yarat';
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const type = document.getElementById('k-type').value;
            const isEdit = this._kassaEditingId !== null && this._kassaEditingId !== undefined;
            if (isEdit && !canEditDocs) {
                alert('Yalnız admin və müdir sənədləri düzəldə bilər.');
                return;
            }
            const data = {
                date: document.getElementById('k-date').value,
                customer: type === 'Xerc' ? '' : document.getElementById('k-customer').value,
                desc: type === 'Xerc'
                    ? document.getElementById('k-expense').value
                    : (document.getElementById('k-desc').value || ''),
                type,
                amount: document.getElementById('k-amount').value
            };

            submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Gözləyin...';
            submitBtn.disabled = true;

            try {
                if (isEdit) {
                    await api.updateKassaRecord(this._kassaEditingId, data);
                } else {
                    await api.addKassaRecord(data);
                }
                modal.classList.add('hidden');
                modal.classList.remove('modal-active');
                form.reset();
                this._kassaEditingId = null;
                document.getElementById('k-modal-title').textContent = 'Yeni Əməliyyat';
                this.loadData(); // reload table
            } catch(err) {
                alert('Xəta: ' + err.message);
            } finally {
                submitBtn.innerHTML = 'Yarat';
                submitBtn.disabled = false;
            }
        });
    },

    setupRealtime() {
        // Live updates (other tabs/devices) for kassa records.
        if (!supabase) return;
        try {
            if (this._kassaChannel) supabase.removeChannel(this._kassaChannel);
        } catch (_) {}

        this._kassaChannel = supabase
            .channel('kassa_records_realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'kassa_records' },
                () => this.loadData()
            )
            .subscribe();
    },

    async loadData() {
        const tbody = document.getElementById('kassa-table-body');
        if (!tbody) return;

        // Use local date key to avoid timezone issues on mobile/tablet.
        const todayStr = api.dateKey(new Date());

        try {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;"><i class="ph ph-spinner ph-spin"></i> API-dən məlumat çəkilir...</td></tr>';
            const res = await api.getKassaList();
            this.kassaData = res.data || [];
            const todayData = this.kassaData.filter(row => api.dateKey(row.date) === todayStr);
            this._todayKassaData = todayData;
            this.renderTable(todayData);
            this.updateStats(this.kassaData, todayData, todayStr);
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="6" style="color:var(--danger); text-align:center;">Xəta baş verdi!</td></tr>';
        }
    },

    renderTable(data) {
        const tbody = document.getElementById('kassa-table-body');
        if (!tbody) return;

        if (!data.length) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Bu gün üçün əməliyyat tapılmadı.</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(row => {
            const color = row.status === 'success' ? 'var(--success)' : 'var(--danger)';
            return `<tr>
                <td>${api.formatDateTime(row.date)}</td>
                <td>${row.customer || '-'}</td>
                <td>${row.desc || '-'}</td>
                <td style="color:${color}; font-weight:500;">${row.type}</td>
                <td style="color:${color}; font-weight:500;">${row.amount}</td>
                <td>
                    ${
                        this._canEditDocs
                            ? `
                                <div style="display:flex; gap:8px; justify-content:flex-end;">
                                    <button class="btn-outline btn-sm btn-danger" data-delete-kassa="${row.id}">Sil</button>
                                    <button class="btn-outline btn-sm" data-edit-kassa="${row.id}">Düzəliş</button>
                                </div>
                              `
                            : '-'
                    }
                </td>
            </tr>`;
        }).join('');
    },

    openEditModal(row) {
        if (!this._canEditDocs) return;
        const modal = document.getElementById('kassa-modal');
        const modalTitle = document.getElementById('k-modal-title');
        const submitBtn = document.getElementById('k-submit');

        if (!modal || !modalTitle || !submitBtn) return;

        this._kassaEditingId = row.id;
        modalTitle.textContent = 'Düzəliş et';
        submitBtn.textContent = 'Yenilə';
        submitBtn.disabled = false;

        document.getElementById('k-date').value = String(row.date || '').slice(0, 10);
        document.getElementById('k-type').value = row.type || '';
        document.getElementById('k-amount').value = this.parseAmount(row.amount).toFixed(2);

        const type = row.type;
        const customerGroup = document.getElementById('customer-group');
        const customerSelect = document.getElementById('k-customer');
        const customerLabel = document.getElementById('customer-label');
        const descGroup = document.getElementById('desc-group');
        const descInput = document.getElementById('k-desc');
        const expenseGroup = document.getElementById('expense-group');
        const expenseSelect = document.getElementById('k-expense');

        // Reset minimal UI.
        customerGroup.style.display = 'none';
        expenseGroup.style.display = 'none';
        descGroup.style.display = 'none';
        descInput.required = false;

        if (type === 'Mədaxil' || type === 'Məxaric') {
            customerGroup.style.display = 'block';
            expenseGroup.style.display = 'none';
            descGroup.style.display = 'block';

            customerLabel.textContent = type === 'Mədaxil' ? 'Alıcı seçin' : 'Satıcı seçin';
            customerSelect.required = true;
            customerSelect.disabled = false;

            // Customer select: set single option.
            customerSelect.innerHTML = '';
            const opt = document.createElement('option');
            opt.value = row.customer || '';
            opt.textContent = row.customer || '';
            customerSelect.appendChild(opt);
            customerSelect.value = row.customer || '';

            expenseSelect.required = false;
            descInput.value = row.desc || '';
        } else if (type === 'Xerc') {
            customerGroup.style.display = 'none';
            expenseGroup.style.display = 'block';
            descGroup.style.display = 'none';

            customerSelect.required = false;
            customerSelect.disabled = false;
            expenseSelect.required = true;
            expenseSelect.disabled = false;

            expenseSelect.innerHTML = '';
            const opt = document.createElement('option');
            opt.value = row.desc || '';
            opt.textContent = row.desc || '';
            expenseSelect.appendChild(opt);
            expenseSelect.value = row.desc || '';
        }

        modal.classList.remove('hidden');
        modal.classList.add('modal-active');
    },

    parseAmount(value) {
        return api.parseMoney(value);
    },

    updateStats(kassaData, todayData, todayStr) {
        const initialBalance = kassaData
            .filter(record => api.dateKey(record.date) < todayStr)
            .reduce((sum, record) => {
                const amount = this.parseAmount(record.amount);
                if (record.type === 'Mədaxil') return sum + amount;
                return sum - amount;
            }, 0);

        const totalIncome = todayData.reduce((sum, record) => {
            return record.type === 'Mədaxil' ? sum + this.parseAmount(record.amount) : sum;
        }, 0);

        const totalExpense = todayData.reduce((sum, record) => {
            return record.type === 'Məxaric' ? sum + this.parseAmount(record.amount) : sum;
        }, 0);

        const totalCost = todayData.reduce((sum, record) => {
            return record.type === 'Xerc' ? sum + this.parseAmount(record.amount) : sum;
        }, 0);

        // Calculate total income from all kassa data
        const allTimeIncome = kassaData.reduce((sum, record) => {
            return record.type === 'Mədaxil' ? sum + this.parseAmount(record.amount) : sum;
        }, 0);

        // Calculate total expenses from all kassa data
        const allTimeExpense = kassaData.reduce((sum, record) => {
            return record.type === 'Məxaric' ? sum + this.parseAmount(record.amount) : sum;
        }, 0);

        // Calculate total costs from all kassa data
        const allTimeCost = kassaData.reduce((sum, record) => {
            return record.type === 'Xerc' ? sum + this.parseAmount(record.amount) : sum;
        }, 0);

        const finalBalance = initialBalance + totalIncome - totalExpense - totalCost;

        const initialEl = document.getElementById('stat-initial');
        const incomeEl = document.getElementById('stat-income');
        const expenseEl = document.getElementById('stat-expense');
        const costEl = document.getElementById('stat-cost');
        const finalEl = document.getElementById('stat-final');
        const incomeTotalEl = document.getElementById('stat-income-total');
        const totalExpenseEl = document.getElementById('stat-total-expense');

        if (initialEl) initialEl.textContent = `${initialBalance.toLocaleString('az-AZ')} ₼`;
        if (incomeEl) incomeEl.textContent = `${totalIncome.toLocaleString('az-AZ')} ₼`;
        if (expenseEl) expenseEl.textContent = `${totalExpense.toLocaleString('az-AZ')} ₼`;
        if (costEl) costEl.textContent = `${totalCost.toLocaleString('az-AZ')} ₼`;
        if (finalEl) {
            finalEl.textContent = `${finalBalance.toLocaleString('az-AZ')} ₼`;
            finalEl.style.color = finalBalance >= 0 ? 'var(--success)' : 'var(--danger)';
        }
        
        const combinedExpense = allTimeExpense + allTimeCost;
        const totalsMatch = allTimeIncome === combinedExpense;

        // Update summary cards - combined total expense
        if (incomeTotalEl) {
            incomeTotalEl.textContent = `${allTimeIncome.toLocaleString('az-AZ')} ₼`;
            incomeTotalEl.style.color = 'var(--success)';
        }
        if (totalExpenseEl) {
            totalExpenseEl.textContent = `${combinedExpense.toLocaleString('az-AZ')} ₼`;
            totalExpenseEl.style.color = totalsMatch ? 'var(--success)' : 'var(--danger)';
        }
    }
};
