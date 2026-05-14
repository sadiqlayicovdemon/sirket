import { api } from '../../services/api.js';
import { AuthState } from '../../state/auth.js';
import { supabase } from '../../services/supabase.js';

export const FakturalarView = {
    render() {
        const div = document.createElement('div');
        div.className = 'view-section active';
        div.innerHTML = `
            <div class="page-header">
                <h2>Fakturalar (Müasir)</h2>
                <p>Göndərilmiş və alınmış fakturalar</p>
            </div>
            <div class="glass-panel" style="padding:14px; margin-top:16px;">
                <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:end; justify-content:space-between;">
                    <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:end;">
                        <div class="form-group" style="margin:0; min-width:180px;">
                            <label>Tarix (başlanğıc)</label>
                            <input type="date" id="f-filter-from">
                        </div>
                        <div class="form-group" style="margin:0; min-width:180px;">
                            <label>Tarix (son)</label>
                            <input type="date" id="f-filter-to">
                        </div>
                        <div class="form-group" style="margin:0; min-width:220px;">
                            <label>Alıcı</label>
                            <select id="f-filter-buyer">
                                <option value="">Hamısı</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin:0; min-width:220px;">
                            <label>Satıcı</label>
                            <select id="f-filter-seller">
                                <option value="">Hamısı</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin:0; min-width:220px;">
                            <label>Sənəd növü</label>
                            <select id="f-filter-kind">
                                <option value="">Hamısı</option>
                                <option value="satis">Satış</option>
                                <option value="kassa-medaxil">Kassa - Mədaxil</option>
                                <option value="kassa-mexaric">Kassa - Məxaric</option>
                                <option value="kassa-xerc">Kassa - Xərc</option>
                                <option value="daxil-olma">Daxil Olma</option>
                                <option value="faktura">Faktura</option>
                            </select>
                        </div>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="btn-outline btn-sm" id="f-filter-clear">Filtri sıfırla</button>
                        <button class="btn-outline btn-sm" id="refresh-faktura">Yenilə</button>
                    </div>
                </div>
            </div>
            <div id="f-debt-summary" class="glass-panel" style="padding:14px; margin-top:16px; display:none;">
                <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
                    <div>
                        <div style="color:var(--text-light); font-size:0.9rem;">Borc kalkulyasiyası</div>
                        <h3 id="f-debt-title" style="margin:4px 0 0 0;">-</h3>
                    </div>
                    <div style="color:var(--text-light); font-size:0.9rem;">
                        <span id="f-debt-period">-</span>
                    </div>
                </div>
                <div class="stats-grid" style="margin-top:12px;">
                    <div class="stat-card glass-panel">
                        <div class="stat-icon" style="background:rgba(0,0,0,0.15);"><i class="ph ph-piggy-bank"></i></div>
                        <div class="stat-details"><p>İlkin borc</p><h3 id="f-debt-initial">0 ₼</h3></div>
                    </div>
                    <div class="stat-card glass-panel">
                        <div class="stat-icon income"><i class="ph ph-shopping-cart"></i></div>
                        <div class="stat-details"><p id="f-debt-sold-label">Satılan məbləğ</p><h3 id="f-debt-sold">0 ₼</h3></div>
                    </div>
                    <div class="stat-card glass-panel">
                        <div class="stat-icon expense"><i class="ph ph-bank"></i></div>
                        <div class="stat-details"><p>Ödənilən pul</p><h3 id="f-debt-paid">0 ₼</h3></div>
                    </div>
                    <div class="stat-card glass-panel">
                        <div class="stat-icon balance"><i class="ph ph-calculator"></i></div>
                        <div class="stat-details"><p>Yekun borc</p><h3 id="f-debt-final">0 ₼</h3></div>
                    </div>
                </div>
            </div>
            <div class="table-container glass-panel mt-4">
                <div class="table-header">
                    <h3>Sənədlərin Xronoloji Cədvəli</h3>
                    <div style="color:var(--text-light); font-size:0.9rem;">
                        <span id="faktura-count">0</span> sətir
                    </div>
                </div>
                <table class="data-table">
                    <thead><tr><th>Sənəd</th><th>Bölmə</th><th>Tarix</th><th>Tərəf</th><th>Məbləğ</th><th>Status</th><th>Əməliyyat</th></tr></thead>
                    <tbody id="faktura-table-body">
                        <tr><td colspan="7" style="text-align:center;"><i class="ph ph-spinner ph-spin"></i> Yüklənir...</td></tr>
                    </tbody>
                </table>
            </div>

            <div id="f-doc-modal" class="modal hidden">
                <div class="modal-content glass-panel" style="max-width:520px;">
                    <div class="modal-header">
                        <h3 id="f-doc-modal-title">Sənədi düzəliş et</h3>
                        <button type="button" id="f-doc-modal-close" class="icon-btn"><i class="ph ph-x"></i></button>
                    </div>
                    <form id="f-doc-form" class="modal-form">
                        <input type="hidden" id="f-doc-kind">
                        <input type="hidden" id="f-doc-dbid">
                        <div class="form-group">
                            <label>Tarix</label>
                            <input type="date" id="f-edit-date">
                        </div>
                        <div id="f-grp-faktura" style="display:none;">
                            <div class="form-group"><label>Şirkət *</label><input type="text" id="f-faktura-company"></div>
                            <div class="form-group"><label>Məbləğ (₼) *</label><input type="number" id="f-faktura-amount" min="0" step="0.01"></div>
                            <div class="form-group"><label>Status</label>
                                <select id="f-faktura-status">
                                    <option value="Ödənilib">Ödənilib</option>
                                    <option value="Ödənilməyib">Ödənilməyib</option>
                                    <option value="Gözləyir">Gözləyir</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Qeyd</label><input type="text" id="f-faktura-desc"></div>
                        </div>
                        <div id="f-grp-satis" style="display:none;">
                            <div class="form-group"><label>Alıcı *</label><select id="f-satis-customer"></select></div>
                            <div class="form-group"><label>Məbləğ (₼) *</label><input type="number" id="f-satis-amount" min="0" step="0.01"></div>
                        </div>
                        <div id="f-grp-daxil" style="display:none;">
                            <div class="form-group"><label>Tədarükçü *</label><select id="f-daxil-supplier"></select></div>
                            <div class="form-group"><label>Cəmi (₼) *</label><input type="number" id="f-daxil-total" min="0" step="0.01"></div>
                        </div>
                        <div id="f-grp-kassa" style="display:none;">
                            <div class="form-group"><label>Növ</label>
                                <select id="f-kassa-type" disabled>
                                    <option value="Mədaxil">Mədaxil</option>
                                    <option value="Məxaric">Məxaric</option>
                                    <option value="Xerc">Xərc</option>
                                </select>
                            </div>
                            <div class="form-group" id="f-kassa-customer-wrap">
                                <label id="f-kassa-customer-label">Tərəf</label>
                                <select id="f-kassa-customer"></select>
                            </div>
                            <div class="form-group" id="f-kassa-expense-wrap" style="display:none;">
                                <label>Xərc maddəsi *</label>
                                <select id="f-kassa-expense"></select>
                            </div>
                            <div class="form-group" id="f-kassa-desc-wrap">
                                <label>Təsvir</label>
                                <input type="text" id="f-kassa-desc">
                            </div>
                            <div class="form-group"><label>Məbləğ (₼) *</label><input type="number" id="f-kassa-amount" min="0" step="0.01"></div>
                        </div>
                        <button type="submit" class="btn-primary" id="f-doc-submit" style="width:100%;margin-top:12px;">Yenilə</button>
                    </form>
                </div>
            </div>
        `;
        return div;
    },

    async afterRender() {
        const role = AuthState.user?.role;
        this._canEditDocs = role === 'Administrator' || role === 'Müdir';

        this.allRows = [];
        this.bindFilterEvents();
        this.bindDocActions();
        await this.populatePartyFilters();
        await this.loadData();
        this.setupRealtime();
        document.getElementById('refresh-faktura')?.addEventListener('click', () => this.loadData());
    },

    bindDocActions() {
        const tbody = document.getElementById('faktura-table-body');
        const modal = document.getElementById('f-doc-modal');
        const form = document.getElementById('f-doc-form');
        const btnClose = document.getElementById('f-doc-modal-close');

        tbody?.addEventListener('click', async (e) => {
            const delBtn = e.target?.closest?.('[data-f-delete]');
            const editBtn = e.target?.closest?.('[data-f-edit]');
            const canEditDocs = this._canEditDocs;

            if (delBtn) {
                if (!canEditDocs) {
                    alert('Yalnız admin və müdir silə bilər.');
                    return;
                }
                const parsed = this.parseFDocToken(delBtn.dataset.fDelete);
                if (!parsed) return;
                const row = this.findCombinedRow(parsed.kind, parsed.dbId);
                if (!row) return;
                const ok = confirm('Bu sənədi silmək istəyirsiniz?');
                if (!ok) return;
                try {
                    await this.deleteCombinedRow(row);
                    await this.loadData();
                } catch (err) {
                    alert('Silinmə alınmadı: ' + err.message);
                }
                return;
            }

            if (editBtn) {
                if (!canEditDocs) {
                    alert('Yalnız admin və müdir sənədləri düzəldə bilər.');
                    return;
                }
                const parsed = this.parseFDocToken(editBtn.dataset.fEdit);
                if (!parsed) return;
                const row = this.findCombinedRow(parsed.kind, parsed.dbId);
                if (row) await this.openFDocEditModal(row);
            }
        });

        btnClose?.addEventListener('click', () => this.closeFDocModal());
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) this.closeFDocModal();
        });

        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!this._canEditDocs) {
                alert('Yalnız admin və müdir sənədləri düzəldə bilər.');
                return;
            }
            const kind = document.getElementById('f-doc-kind')?.value;
            const dbId = Number(document.getElementById('f-doc-dbid')?.value);
            const submitBtn = document.getElementById('f-doc-submit');
            if (!kind || !Number.isFinite(dbId)) return;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Yüklənir...';

            try {
                const date = document.getElementById('f-edit-date')?.value;
                if (!date) {
                    alert('Tarix seçin.');
                    return;
                }

                if (kind === 'faktura') {
                    const company = document.getElementById('f-faktura-company')?.value?.trim();
                    const amount = document.getElementById('f-faktura-amount')?.value;
                    if (!company) {
                        alert('Şirkət adını daxil edin.');
                        return;
                    }
                    if (!amount || Number(amount) <= 0) {
                        alert('Məbləği düzgün daxil edin.');
                        return;
                    }
                    await api.updateFakturaRecord(dbId, {
                        date,
                        time: this._fEditInvoiceTime || '12:00:00',
                        company: document.getElementById('f-faktura-company')?.value,
                        amount: document.getElementById('f-faktura-amount')?.value,
                        status: document.getElementById('f-faktura-status')?.value,
                        description: document.getElementById('f-faktura-desc')?.value || ''
                    });
                } else if (kind === 'satis') {
                    if (!document.getElementById('f-satis-customer')?.value) {
                        alert('Alıcı seçin.');
                        return;
                    }
                    const sa = document.getElementById('f-satis-amount')?.value;
                    if (!sa || Number(sa) <= 0) {
                        alert('Məbləği düzgün daxil edin.');
                        return;
                    }
                    await api.updateSatisRecord(dbId, {
                        date,
                        customer: document.getElementById('f-satis-customer')?.value,
                        amount: document.getElementById('f-satis-amount')?.value
                    });
                } else if (kind === 'daxil') {
                    if (!document.getElementById('f-daxil-supplier')?.value) {
                        alert('Tədarükçü seçin.');
                        return;
                    }
                    const dt = document.getElementById('f-daxil-total')?.value;
                    if (!dt || Number(dt) <= 0) {
                        alert('Məbləği düzgün daxil edin.');
                        return;
                    }
                    await api.updateDaxilOlmalarRecord(dbId, {
                        date,
                        supplier: document.getElementById('f-daxil-supplier')?.value,
                        total: document.getElementById('f-daxil-total')?.value
                    });
                } else if (kind === 'kassa') {
                    const type = document.getElementById('f-kassa-type')?.value;
                    const ka = document.getElementById('f-kassa-amount')?.value;
                    if (!ka || Number(ka) <= 0) {
                        alert('Məbləği düzgün daxil edin.');
                        return;
                    }
                    const data = {
                        date,
                        type,
                        customer: type === 'Xerc' ? '' : document.getElementById('f-kassa-customer')?.value,
                        desc: type === 'Xerc'
                            ? document.getElementById('f-kassa-expense')?.value
                            : (document.getElementById('f-kassa-desc')?.value || ''),
                        amount: document.getElementById('f-kassa-amount')?.value
                    };
                    if (type !== 'Xerc' && !data.customer) {
                        alert('Alıcı/satıcı seçilməlidir.');
                        return;
                    }
                    if (type === 'Xerc' && !data.desc) {
                        alert('Xərc maddəsi seçilməlidir.');
                        return;
                    }
                    await api.updateKassaRecord(dbId, data);
                }

                this.closeFDocModal();
                await this.loadData();
            } catch (err) {
                alert('Yenilənmə alınmadı: ' + err.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Yenilə';
            }
        });
    },

    parseFDocToken(raw) {
        if (!raw || typeof raw !== 'string') return null;
        const [kind, idStr] = raw.split(':');
        const dbId = Number(idStr);
        if (!kind || !Number.isFinite(dbId)) return null;
        return { kind, dbId };
    },

    findCombinedRow(kind, dbId) {
        return (this.allRows || []).find(r => r.docKind === kind && r.dbId === dbId);
    },

    async deleteCombinedRow(row) {
        if (row.docKind === 'faktura') await api.deleteFakturaRecord(row.dbId);
        else if (row.docKind === 'kassa') await api.deleteKassaRecord(row.dbId);
        else if (row.docKind === 'satis') await api.deleteSatisRecord(row.dbId);
        else if (row.docKind === 'daxil') await api.deleteDaxilOlmalarRecord(row.dbId);
    },

    closeFDocModal() {
        const modal = document.getElementById('f-doc-modal');
        modal?.classList.add('hidden');
        modal?.classList.remove('modal-active');
        this._fEditInvoiceTime = null;
    },

    showEditGroup(id) {
        ['f-grp-faktura', 'f-grp-satis', 'f-grp-daxil', 'f-grp-kassa'].forEach(x => {
            const el = document.getElementById(x);
            if (el) el.style.display = x === id ? 'block' : 'none';
        });
    },

    async openFDocEditModal(row) {
        const modal = document.getElementById('f-doc-modal');
        const kindInput = document.getElementById('f-doc-kind');
        const dbIdInput = document.getElementById('f-doc-dbid');
        const dateInput = document.getElementById('f-edit-date');
        if (!modal || !kindInput || !dbIdInput || !dateInput) return;

        kindInput.value = row.docKind;
        dbIdInput.value = String(row.dbId);
        dateInput.value = String(row.date || '').slice(0, 10);

        document.getElementById('f-doc-modal-title').textContent = 'Sənədi düzəliş et';

        if (row.docKind === 'faktura') {
            this.showEditGroup('f-grp-faktura');
            const src = row._src || {};
            document.getElementById('f-faktura-company').value = src.company || row.party || '';
            document.getElementById('f-faktura-amount').value = api.parseMoney(src.amount || row.amount).toFixed(2);
            document.getElementById('f-faktura-status').value = src.status || row.status || 'Gözləyir';
            document.getElementById('f-faktura-desc').value = src.desc || '';
            const m = String(row.date || '').match(/T(\d{2}:\d{2}:\d{2})/);
            this._fEditInvoiceTime = m ? m[1] : '12:00:00';
        } else if (row.docKind === 'satis') {
            this.showEditGroup('f-grp-satis');
            const src = row._src || {};
            const sel = document.getElementById('f-satis-customer');
            sel.innerHTML = '<option value="">Yüklənir...</option>';
            try {
                const res = await api.getBuyersList();
                sel.innerHTML = '<option value="">Alıcı seçin...</option>';
                (res.data || []).forEach(b => {
                    const name = typeof b === 'object' ? b.name : b;
                    if (!name) return;
                    const opt = document.createElement('option');
                    opt.value = name;
                    opt.textContent = name;
                    sel.appendChild(opt);
                });
                sel.value = src.customer || '';
            } catch (_) {
                sel.innerHTML = '';
                const opt = document.createElement('option');
                opt.value = src.customer || '';
                opt.textContent = src.customer || '';
                sel.appendChild(opt);
            }
            document.getElementById('f-satis-amount').value = api.parseMoney(src.amount || row.amount).toFixed(2);
        } else if (row.docKind === 'daxil') {
            this.showEditGroup('f-grp-daxil');
            const src = row._src || {};
            const sel = document.getElementById('f-daxil-supplier');
            sel.innerHTML = '<option value="">Yüklənir...</option>';
            try {
                const res = await api.getSellersList();
                sel.innerHTML = '<option value="">Tədarükçü seçin...</option>';
                (res.data || []).forEach(s => {
                    const name = typeof s === 'object' ? s.name : s;
                    if (!name) return;
                    const opt = document.createElement('option');
                    opt.value = name;
                    opt.textContent = name;
                    sel.appendChild(opt);
                });
                sel.value = src.supplier || '';
            } catch (_) {
                sel.innerHTML = '';
                const opt = document.createElement('option');
                opt.value = src.supplier || '';
                opt.textContent = src.supplier || '';
                sel.appendChild(opt);
            }
            document.getElementById('f-daxil-total').value = api.parseMoney(src.total || row.amount).toFixed(2);
        } else if (row.docKind === 'kassa') {
            this.showEditGroup('f-grp-kassa');
            const src = row._src || {};
            const type = src.type || row.kassaType || 'Mədaxil';
            const typeSel = document.getElementById('f-kassa-type');
            typeSel.value = type;

            const custWrap = document.getElementById('f-kassa-customer-wrap');
            const expWrap = document.getElementById('f-kassa-expense-wrap');
            const descWrap = document.getElementById('f-kassa-desc-wrap');
            const custLabel = document.getElementById('f-kassa-customer-label');
            const custSel = document.getElementById('f-kassa-customer');
            const expSel = document.getElementById('f-kassa-expense');
            const descInp = document.getElementById('f-kassa-desc');

            if (type === 'Mədaxil' || type === 'Məxaric') {
                custWrap.style.display = 'block';
                expWrap.style.display = 'none';
                descWrap.style.display = 'block';
                custLabel.textContent = type === 'Mədaxil' ? 'Alıcı *' : 'Satıcı *';
                custSel.innerHTML = '<option value="">Yüklənir...</option>';
                try {
                    const res = type === 'Mədaxil' ? await api.getBuyersList() : await api.getSellersList();
                    custSel.innerHTML = `<option value="">${type === 'Mədaxil' ? 'Alıcı seçin...' : 'Satıcı seçin...'}</option>`;
                    (res.data || []).forEach(item => {
                        const name = typeof item === 'object' ? item.name : item;
                        if (!name) return;
                        const opt = document.createElement('option');
                        opt.value = name;
                        opt.textContent = name;
                        custSel.appendChild(opt);
                    });
                    custSel.value = src.customer || '';
                } catch (_) {
                    custSel.innerHTML = '';
                    const opt = document.createElement('option');
                    opt.value = src.customer || '';
                    opt.textContent = src.customer || '';
                    custSel.appendChild(opt);
                }
                descInp.value = src.desc || '';
            } else {
                custWrap.style.display = 'none';
                expWrap.style.display = 'block';
                descWrap.style.display = 'none';
                custSel.innerHTML = '';
                expSel.innerHTML = '<option value="">Yüklənir...</option>';
                try {
                    const res = await api.getExpenseItems();
                    expSel.innerHTML = '<option value="">Xərc maddəsi seçin...</option>';
                    (res.data || []).forEach(item => {
                        const name = typeof item === 'object' ? item.name : item;
                        if (!name) return;
                        const opt = document.createElement('option');
                        opt.value = name;
                        opt.textContent = name;
                        expSel.appendChild(opt);
                    });
                    expSel.value = src.desc || '';
                } catch (_) {
                    expSel.innerHTML = '';
                    const opt = document.createElement('option');
                    opt.value = src.desc || '';
                    opt.textContent = src.desc || '';
                    expSel.appendChild(opt);
                }
            }
            document.getElementById('f-kassa-amount').value = api.parseMoney(src.amount || row.amount).toFixed(2);
        }

        modal.classList.remove('hidden');
        modal.classList.add('modal-active');
    },

    bindFilterEvents() {
        const fromEl = document.getElementById('f-filter-from');
        const toEl = document.getElementById('f-filter-to');
        const buyerEl = document.getElementById('f-filter-buyer');
        const sellerEl = document.getElementById('f-filter-seller');
        const kindEl = document.getElementById('f-filter-kind');
        const clearBtn = document.getElementById('f-filter-clear');

        const onChange = () => this.applyFiltersAndRender();
        fromEl?.addEventListener('change', onChange);
        toEl?.addEventListener('change', onChange);
        buyerEl?.addEventListener('change', () => {
            if (buyerEl?.value) {
                if (sellerEl) sellerEl.value = '';
            }
            onChange();
        });
        sellerEl?.addEventListener('change', () => {
            if (sellerEl?.value) {
                if (buyerEl) buyerEl.value = '';
            }
            onChange();
        });
        kindEl?.addEventListener('change', onChange);
        clearBtn?.addEventListener('click', () => {
            if (fromEl) fromEl.value = '';
            if (toEl) toEl.value = '';
            if (buyerEl) buyerEl.value = '';
            if (sellerEl) sellerEl.value = '';
            if (kindEl) kindEl.value = '';
            this.applyFiltersAndRender();
        });
    },

    async populatePartyFilters() {
        const buyerEl = document.getElementById('f-filter-buyer');
        const sellerEl = document.getElementById('f-filter-seller');
        if (!buyerEl || !sellerEl) return;

        try {
            const [buyersRes, sellersRes] = await Promise.all([
                api.getBuyersList?.() || { data: [] },
                api.getSellersList?.() || { data: [] }
            ]);
            const buyers = (buyersRes.data || []).map(x => (typeof x === 'object' ? x.name : x)).filter(Boolean);
            const sellers = (sellersRes.data || []).map(x => (typeof x === 'object' ? x.name : x)).filter(Boolean);

            buyerEl.innerHTML = '<option value="">Hamısı</option>' + buyers.map(n => `<option value="${this.escapeHtml(n)}">${this.escapeHtml(n)}</option>`).join('');
            sellerEl.innerHTML = '<option value="">Hamısı</option>' + sellers.map(n => `<option value="${this.escapeHtml(n)}">${this.escapeHtml(n)}</option>`).join('');
        } catch (e) {
            // ignore; filters can still work on loaded data
        }
    },

    escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    async loadData() {
        const tbody = document.getElementById('faktura-table-body');
        if (!tbody) return;
        
        try {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;"><i class="ph ph-spinner ph-spin"></i> API-dən məlumat çəkilir...</td></tr>';
            const [invoicesRes, kassaRes, satisRes, daxilRes] = await Promise.all([
                api.getFakturalarList(),
                api.getKassaList(),
                api.getSatisList(),
                api.getDaxilOlmalarList()
            ]);

            const combined = [
                ...invoicesRes.data.map(row => ({
                    docKind: 'faktura',
                    dbId: row.dbId,
                    id: row.id,
                    section: 'Faktura',
                    date: row.date,
                    party: row.company,
                    buyer: null,
                    seller: null,
                    amount: row.amount,
                    amountValue: api.parseMoney(row.amount),
                    status: row.status,
                    statusClass: row.statusClass,
                    _src: row
                })),
                ...kassaRes.data.map(row => ({
                    docKind: 'kassa',
                    dbId: row.id,
                    id: `K-${row.id}`,
                    section: 'Kassa',
                    date: row.date,
                    party: row.customer || row.desc || 'Kassa',
                    buyer: row.type === 'Mədaxil' ? (row.customer || null) : null,
                    seller: row.type === 'Məxaric' ? (row.customer || null) : null,
                    amount: row.amount,
                    amountValue: api.parseMoney(row.amount),
                    kassaType: row.type,
                    status: row.type,
                    statusClass: 'status-info',
                    _src: row
                })),
                ...satisRes.data.map(row => ({
                    docKind: 'satis',
                    dbId: row.dbId,
                    id: row.id,
                    section: 'Satış',
                    date: row.date,
                    party: row.customer,
                    buyer: row.customer || null,
                    seller: null,
                    amount: row.amount,
                    amountValue: api.parseMoney(row.amount),
                    status: row.status,
                    statusClass: 'status-success',
                    _src: row
                })),
                ...daxilRes.data.map(row => ({
                    docKind: 'daxil',
                    dbId: row.id,
                    id: `D-${row.id}`,
                    section: 'Daxil Olma',
                    date: row.date,
                    party: row.supplier,
                    buyer: null,
                    seller: row.supplier || null,
                    amount: row.total,
                    amountValue: api.parseMoney(row.total),
                    status: row.status,
                    statusClass: row.statusClass,
                    _src: row
                }))
            ];

            combined.sort((a, b) => new Date(b.date) - new Date(a.date));
            this.allRows = combined;
            this.applyFiltersAndRender();
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="7" style="color:var(--danger); text-align:center;">Xəta baş verdi!</td></tr>';
        }
    },

    applyFiltersAndRender() {
        const tbody = document.getElementById('faktura-table-body');
        if (!tbody) return;

        const fromValue = document.getElementById('f-filter-from')?.value || '';
        const toValue = document.getElementById('f-filter-to')?.value || '';
        const buyerValue = document.getElementById('f-filter-buyer')?.value || '';
        const sellerValue = document.getElementById('f-filter-seller')?.value || '';
        const kindValue = document.getElementById('f-filter-kind')?.value || '';

        const fromTs = fromValue ? new Date(`${fromValue}T00:00:00`).getTime() : null;
        const toTs = toValue ? new Date(`${toValue}T23:59:59`).getTime() : null;

        const filtered = (this.allRows || []).filter(r => {
            const ts = new Date(r.date).getTime();
            if (Number.isFinite(fromTs) && ts < fromTs) return false;
            if (Number.isFinite(toTs) && ts > toTs) return false;
            if (buyerValue && r.buyer !== buyerValue) return false;
            if (sellerValue && r.seller !== sellerValue) return false;
            if (kindValue) {
                if (kindValue === 'satis' && r.section !== 'Satış') return false;
                if (kindValue === 'daxil-olma' && r.section !== 'Daxil Olma') return false;
                if (kindValue === 'faktura' && r.section !== 'Faktura') return false;
                if (kindValue === 'kassa-medaxil' && !(r.section === 'Kassa' && r.kassaType === 'Mədaxil')) return false;
                if (kindValue === 'kassa-mexaric' && !(r.section === 'Kassa' && r.kassaType === 'Məxaric')) return false;
                if (kindValue === 'kassa-xerc' && !(r.section === 'Kassa' && r.kassaType === 'Xerc')) return false;
            }
            return true;
        });

        const countEl = document.getElementById('faktura-count');
        if (countEl) countEl.textContent = String(filtered.length);

        if (!filtered.length) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-light);">Filtrə uyğun nəticə yoxdur.</td></tr>';
            this.renderDebtSummary({ buyerValue, sellerValue, fromValue, toValue });
            return;
        }

        this.renderDebtSummary({ buyerValue, sellerValue, fromValue, toValue });

        tbody.innerHTML = filtered.map(row => `
            <tr style="${this.getRowStyle(row)}">
                <td>${this.escapeHtml(row.id)}</td>
                <td>${this.escapeHtml(row.section)}</td>
                <td>${api.formatDateTime(row.date)}</td>
                <td>${this.escapeHtml(row.party)}</td>
                <td>${this.escapeHtml(row.amount)}</td>
                <td><span class="status-badge ${row.statusClass}">${this.escapeHtml(row.status)}</span></td>
                <td>${
                    this._canEditDocs
                        ? `<div style="display:flex; gap:8px; justify-content:flex-end; flex-wrap:wrap;">
                            <button type="button" class="btn-outline btn-sm btn-danger" data-f-delete="${row.docKind}:${row.dbId}">Sil</button>
                            <button type="button" class="btn-outline btn-sm" data-f-edit="${row.docKind}:${row.dbId}">Düzəliş</button>
                           </div>`
                        : '-'
                }</td>
            </tr>
        `).join('');
    }
    ,

    getRowStyle(row) {
        // Stronger visual separation between sales and payments in filtered results.
        if (row.section === 'Satış') {
            return 'background: rgba(16, 185, 129, 0.08);';
        }
        if (row.section === 'Kassa') {
            return 'background: rgba(59, 130, 246, 0.08);';
        }
        if (row.section === 'Daxil Olma') {
            return 'background: rgba(245, 158, 11, 0.08);';
        }
        return '';
    },

    renderDebtSummary({ buyerValue, sellerValue, fromValue, toValue }) {
        const wrapper = document.getElementById('f-debt-summary');
        if (!wrapper) return;

        const initialEl = document.getElementById('f-debt-initial');
        const soldEl = document.getElementById('f-debt-sold');
        const soldLabelEl = document.getElementById('f-debt-sold-label');
        const paidEl = document.getElementById('f-debt-paid');
        const finalEl = document.getElementById('f-debt-final');
        const titleEl = document.getElementById('f-debt-title');
        const periodEl = document.getElementById('f-debt-period');

        if (!initialEl || !soldEl || !soldLabelEl || !paidEl || !finalEl || !titleEl || !periodEl) return;

        const hasBuyer = Boolean(buyerValue);
        const hasSeller = Boolean(sellerValue);
        if (!hasBuyer && !hasSeller) {
            wrapper.style.display = 'none';
            return;
        }

        wrapper.style.display = 'block';

        // If both are selected, prioritize buyer.
        const isBuyerMode = hasBuyer;
        const partyName = isBuyerMode ? buyerValue : sellerValue;

        titleEl.textContent = isBuyerMode ? `Alıcı: ${partyName}` : `Satıcı: ${partyName}`;
        soldLabelEl.textContent = isBuyerMode ? 'Satılan məbləğ' : 'Alınan mal';

        const fromTs = fromValue ? new Date(`${fromValue}T00:00:00`).getTime() : null;
        const toTs = toValue ? new Date(`${toValue}T23:59:59`).getTime() : null;

        const periodText = (() => {
            if (!fromValue && !toValue) return 'Bütün dövriyyə';
            if (fromValue && toValue) return `${fromValue} → ${toValue}`;
            if (fromValue) return `${fromValue} →`;
            return `→ ${toValue}`;
        })();
        periodEl.textContent = periodText;

        let initialDebt = 0;
        let soldAmount = 0;
        let paidAmount = 0;

        const rows = this.allRows || [];

        // Collect transactions for debt:
        // - Buyer mode:
        //   sold = Satış where buyer matches
        //   paid = Kassa where kassaType is 'Mədaxil' and buyer matches
        // - Seller mode:
        //   sold = Daxil Olma where seller matches
        //   paid = Kassa where kassaType is 'Məxaric' and seller matches
        const isInRange = (ts) => {
            if (Number.isFinite(fromTs) && ts < fromTs) return false;
            if (Number.isFinite(toTs) && ts > toTs) return false;
            return true;
        };

        const isBeforeFrom = (ts) => {
            if (!Number.isFinite(fromTs)) return false;
            return ts < fromTs;
        };

        for (const r of rows) {
            const ts = new Date(r.date).getTime();
            if (!Number.isFinite(ts)) continue;

            if (isBuyerMode) {
                if (r.section === 'Satış' && r.buyer === partyName) {
                    if (isBeforeFrom(ts)) initialDebt += r.amountValue;
                    else if (isInRange(ts) || (!fromValue && !toValue)) soldAmount += r.amountValue;
                }
                if (r.section === 'Kassa' && r.kassaType === 'Mədaxil' && r.buyer === partyName) {
                    if (isBeforeFrom(ts)) initialDebt -= r.amountValue;
                    else if (isInRange(ts) || (!fromValue && !toValue)) paidAmount += r.amountValue;
                }
            } else {
                if (r.section === 'Daxil Olma' && r.seller === partyName) {
                    if (isBeforeFrom(ts)) initialDebt += r.amountValue;
                    else if (isInRange(ts) || (!fromValue && !toValue)) soldAmount += r.amountValue;
                }
                if (r.section === 'Kassa' && r.kassaType === 'Məxaric' && r.seller === partyName) {
                    if (isBeforeFrom(ts)) initialDebt -= r.amountValue;
                    else if (isInRange(ts) || (!fromValue && !toValue)) paidAmount += r.amountValue;
                }
            }
        }

        // If no date was selected, we treat initialDebt as 0 and everything is in-range.
        if (!fromValue && !toValue) {
            // initialDebt already stays 0 by logic, but keep formula explicit.
            initialDebt = 0;
        }

        const finalDebt = initialDebt + soldAmount - paidAmount;

        initialEl.textContent = `${initialDebt.toLocaleString('az-AZ')} ₼`;
        soldEl.textContent = `${soldAmount.toLocaleString('az-AZ')} ₼`;
        paidEl.textContent = `${paidAmount.toLocaleString('az-AZ')} ₼`;
        finalEl.textContent = `${finalDebt.toLocaleString('az-AZ')} ₼`;
        finalEl.style.color = finalDebt >= 0 ? 'var(--success)' : 'var(--danger)';
    },

    setupRealtime() {
        if (!supabase) return;
        try {
            if (this._fakturaChannel) supabase.removeChannel(this._fakturaChannel);
        } catch (_) {}

        this._fakturaChannel = supabase
            .channel('fakturalar_realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'kassa_records' },
                () => this.loadData()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'sales_records' },
                () => this.loadData()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'incoming_records' },
                () => this.loadData()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'invoices' },
                () => this.loadData()
            )
            .subscribe();
    }
};
