import { api } from '../../services/api.js';
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
                    <thead><tr><th>Sənəd</th><th>Bölmə</th><th>Tarix</th><th>Tərəf</th><th>Məbləğ</th><th>Status</th></tr></thead>
                    <tbody id="faktura-table-body">
                        <tr><td colspan="6" style="text-align:center;"><i class="ph ph-spinner ph-spin"></i> Yüklənir...</td></tr>
                    </tbody>
                </table>
            </div>
        `;
        return div;
    },

    async afterRender() {
        this.allRows = [];
        this.bindFilterEvents();
        await this.populatePartyFilters();
        await this.loadData();
        this.setupRealtime();
        document.getElementById('refresh-faktura')?.addEventListener('click', () => this.loadData());
    },

    bindFilterEvents() {
        const fromEl = document.getElementById('f-filter-from');
        const toEl = document.getElementById('f-filter-to');
        const buyerEl = document.getElementById('f-filter-buyer');
        const sellerEl = document.getElementById('f-filter-seller');
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
        clearBtn?.addEventListener('click', () => {
            if (fromEl) fromEl.value = '';
            if (toEl) toEl.value = '';
            if (buyerEl) buyerEl.value = '';
            if (sellerEl) sellerEl.value = '';
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
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;"><i class="ph ph-spinner ph-spin"></i> API-dən məlumat çəkilir...</td></tr>';
            const [invoicesRes, kassaRes, satisRes, daxilRes] = await Promise.all([
                api.getFakturalarList(),
                api.getKassaList(),
                api.getSatisList(),
                api.getDaxilOlmalarList()
            ]);

            const combined = [
                ...invoicesRes.data.map(row => ({
                    id: row.id,
                    section: 'Faktura',
                    date: row.date,
                    party: row.company,
                    buyer: null,
                    seller: null,
                    amount: row.amount,
                    amountValue: api.parseMoney(row.amount),
                    status: row.status,
                    statusClass: row.statusClass
                })),
                ...kassaRes.data.map(row => ({
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
                    // Force section-based coloring for easier visual scanning.
                    statusClass: 'status-info'
                })),
                ...satisRes.data.map(row => ({
                    id: row.id,
                    section: 'Satış',
                    date: row.date,
                    party: row.customer,
                    buyer: row.customer || null,
                    seller: null,
                    amount: row.amount,
                    amountValue: api.parseMoney(row.amount),
                    status: row.status,
                    // Force section-based coloring for easier visual scanning.
                    statusClass: 'status-success'
                })),
                ...daxilRes.data.map(row => ({
                    id: `D-${row.id}`,
                    section: 'Daxil Olma',
                    date: row.date,
                    party: row.supplier,
                    buyer: null,
                    seller: row.supplier || null,
                    amount: row.total,
                    amountValue: api.parseMoney(row.total),
                    status: row.status,
                    statusClass: row.statusClass
                }))
            ];

            combined.sort((a, b) => new Date(b.date) - new Date(a.date));
            this.allRows = combined;
            this.applyFiltersAndRender();
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="6" style="color:var(--danger); text-align:center;">Xəta baş verdi!</td></tr>';
        }
    },

    applyFiltersAndRender() {
        const tbody = document.getElementById('faktura-table-body');
        if (!tbody) return;

        const fromValue = document.getElementById('f-filter-from')?.value || '';
        const toValue = document.getElementById('f-filter-to')?.value || '';
        const buyerValue = document.getElementById('f-filter-buyer')?.value || '';
        const sellerValue = document.getElementById('f-filter-seller')?.value || '';

        const fromTs = fromValue ? new Date(`${fromValue}T00:00:00`).getTime() : null;
        const toTs = toValue ? new Date(`${toValue}T23:59:59`).getTime() : null;

        const filtered = (this.allRows || []).filter(r => {
            const ts = new Date(r.date).getTime();
            if (Number.isFinite(fromTs) && ts < fromTs) return false;
            if (Number.isFinite(toTs) && ts > toTs) return false;
            if (buyerValue && r.buyer !== buyerValue) return false;
            if (sellerValue && r.seller !== sellerValue) return false;
            return true;
        });

        const countEl = document.getElementById('faktura-count');
        if (countEl) countEl.textContent = String(filtered.length);

        if (!filtered.length) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-light);">Filtrə uyğun nəticə yoxdur.</td></tr>';
            this.renderDebtSummary({ buyerValue, sellerValue, fromValue, toValue });
            return;
        }

        this.renderDebtSummary({ buyerValue, sellerValue, fromValue, toValue });

        tbody.innerHTML = filtered.map(row => `
            <tr>
                <td>${this.escapeHtml(row.id)}</td>
                <td>${this.escapeHtml(row.section)}</td>
                <td>${api.formatDateTime(row.date)}</td>
                <td>${this.escapeHtml(row.party)}</td>
                <td>${this.escapeHtml(row.amount)}</td>
                <td><span class="status-badge ${row.statusClass}">${this.escapeHtml(row.status)}</span></td>
            </tr>
        `).join('');
    }
    ,

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
