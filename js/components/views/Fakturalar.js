import { api } from '../../services/api.js';

export const FakturalarView = {
    render() {
        const div = document.createElement('div');
        div.className = 'view-section active';
        div.innerHTML = `
            <div class="page-header">
                <h2>Fakturalar (Müasir)</h2>
                <p>Göndərilmiş və alınmış fakturalar</p>
            </div>
            <div class="table-container glass-panel mt-4">
                <div class="table-header">
                    <h3>Sənədlərin Xronoloji Cədvəli</h3>
                    <button class="btn-outline btn-sm" id="refresh-faktura">Yenilə</button>
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
        this.loadData();
        document.getElementById('refresh-faktura')?.addEventListener('click', () => this.loadData());
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
                    amount: row.amount,
                    status: row.status,
                    statusClass: row.statusClass
                })),
                ...kassaRes.data.map(row => ({
                    id: `K-${row.id}`,
                    section: 'Kassa',
                    date: row.date,
                    party: row.customer || row.desc || 'Kassa',
                    amount: row.amount,
                    status: row.type,
                    statusClass: row.status === 'success' ? 'status-success' : 'status-danger'
                })),
                ...satisRes.data.map(row => ({
                    id: row.id,
                    section: 'Satış',
                    date: row.date,
                    party: row.customer,
                    amount: row.amount,
                    status: row.status,
                    statusClass: row.statusClass
                })),
                ...daxilRes.data.map(row => ({
                    id: `D-${row.id}`,
                    section: 'Daxil Olma',
                    date: row.date,
                    party: row.supplier,
                    amount: row.total,
                    status: row.status,
                    statusClass: row.statusClass
                }))
            ];

            combined.sort((a, b) => new Date(b.date) - new Date(a.date));

            tbody.innerHTML = combined.map(row => `
                <tr>
                    <td>${row.id}</td>
                    <td>${row.section}</td>
                    <td>${api.formatDateTime(row.date)}</td>
                    <td>${row.party}</td>
                    <td>${row.amount}</td>
                    <td><span class="status-badge ${row.statusClass}">${row.status}</span></td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="6" style="color:var(--danger); text-align:center;">Xəta baş verdi!</td></tr>';
        }
    }
};
