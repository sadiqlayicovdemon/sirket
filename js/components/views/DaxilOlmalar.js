import { api } from '../../services/api.js';

export const DaxilOlmalarView = {
    render() {
        const div = document.createElement('div');
        div.className = 'view-section active';
        div.innerHTML = `
            <div class="page-header">
                <h2>Daxil Olmalar (Müasir)</h2>
                <p>Anbara daxil olan məhsullar</p>
            </div>
            <div class="action-bar glass-panel">
                <button class="btn-primary" id="btn-new-daxil"><i class="ph ph-plus"></i> Yeni Sənəd</button>
                <button class="btn-outline" id="refresh-daxil"><i class="ph ph-arrows-clockwise"></i> Məlumatı Yenilə</button>
            </div>
            <div class="table-container glass-panel mt-4">
                <table class="data-table">
                    <thead><tr><th>Tarix</th><th>Tədarükçü</th><th>Toplam Dəyər</th></tr></thead>
                    <tbody id="daxil-table-body">
                        <tr><td colspan="3" style="text-align:center;"><i class="ph ph-spinner ph-spin"></i> Yüklənir...</td></tr>
                    </tbody>
                </table>
            </div>

            <div id="daxil-modal" class="modal hidden">
                <div class="modal-content glass-panel">
                    <div class="modal-header">
                        <h3>Yeni Sənəd</h3>
                        <button id="close-daxil-modal" class="icon-btn"><i class="ph ph-x"></i></button>
                    </div>
                    <form id="daxil-form" class="modal-form">
                        <div class="form-group">
                            <label>Tarix</label>
                            <input type="date" id="daxil-date" disabled>
                        </div>
                        <div class="form-group">
                            <label>Tədarükçü *</label>
                            <select id="daxil-supplier" required>
                                <option value="">Tədarükçü seçin...</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Məbləğ (₼) *</label>
                            <input type="number" id="daxil-total" min="0" step="0.01" placeholder="0.00" required>
                        </div>
                        <button type="submit" class="btn-primary" id="daxil-submit" style="width:100%; margin-top:15px;">Yadda Saxla</button>
                    </form>
                </div>
            </div>
        `;
        return div;
    },

    async afterRender() {
        this.loadData();
        document.getElementById('refresh-daxil')?.addEventListener('click', () => this.loadData());

        const modal = document.getElementById('daxil-modal');
        const btnNew = document.getElementById('btn-new-daxil');
        const btnClose = document.getElementById('close-daxil-modal');
        const form = document.getElementById('daxil-form');

        btnNew.addEventListener('click', async () => {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            document.getElementById('daxil-date').value = `${year}-${month}-${day}`;
            document.getElementById('daxil-total').value = '';
            document.getElementById('daxil-supplier').innerHTML = '<option value="">Yüklənir...</option>';
            modal.classList.remove('hidden');
            modal.classList.add('modal-active');

            try {
                const sellers = await api.getSellersList();
                const select = document.getElementById('daxil-supplier');
                select.innerHTML = '<option value="">Tədarükçü seçin...</option>';
                sellers.data.forEach(seller => {
                    const option = document.createElement('option');
                    option.value = seller.name;
                    option.textContent = seller.name;
                    select.appendChild(option);
                });
            } catch (err) {
                console.error('Tədarükçülər yüklənmədi:', err);
                document.getElementById('daxil-supplier').innerHTML = '<option value="">Xəta baş verdi</option>';
            }
        });

        btnClose.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.classList.remove('modal-active');
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const supplier = document.getElementById('daxil-supplier').value;
            const total = document.getElementById('daxil-total').value;
            const date = document.getElementById('daxil-date').value;

            if (!supplier || !total) {
                alert('Zəhmət olmasa, tədarükçü və məbləği daxil edin.');
                return;
            }

            const submitBtn = document.getElementById('daxil-submit');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Yadda saxlanılır...';

            try {
                await api.addDaxilOlmalarRecord({ date, supplier, total });
                modal.classList.add('hidden');
                modal.classList.remove('modal-active');
                this.loadData();
            } catch (err) {
                alert('Sənəd qeydə alınmadı: ' + err.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Yadda Saxla';
            }
        });
    },

    async loadData() {
        const tbody = document.getElementById('daxil-table-body');
        if (!tbody) return;
        
        try {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;"><i class="ph ph-spinner ph-spin"></i> API-dən məlumat çəkilir...</td></tr>';
            const res = await api.getDaxilOlmalarList();
            
            tbody.innerHTML = res.data.map(row => `
                <tr>
                    <td>${api.formatDateTime(row.date)}</td>
                    <td>${row.supplier}</td>
                    <td>${row.total}</td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="3" style="color:var(--danger); text-align:center;">Xəta baş verdi!</td></tr>';
        }
    }
};
