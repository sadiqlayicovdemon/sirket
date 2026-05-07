import { api } from '../../services/api.js';
import { AuthState } from '../../state/auth.js';
import { supabase } from '../../services/supabase.js';

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
                    <thead><tr><th>Tarix</th><th>Tədarükçü</th><th>Toplam Dəyər</th><th>Əməliyyat</th></tr></thead>
                    <tbody id="daxil-table-body">
                        <tr><td colspan="4" style="text-align:center;"><i class="ph ph-spinner ph-spin"></i> Yüklənir...</td></tr>
                    </tbody>
                </table>
            </div>

            <div id="daxil-modal" class="modal hidden">
                <div class="modal-content glass-panel">
                    <div class="modal-header">
                        <h3 id="daxil-modal-title">Yeni Sənəd</h3>
                        <button id="close-daxil-modal" class="icon-btn"><i class="ph ph-x"></i></button>
                    </div>
                    <form id="daxil-form" class="modal-form">
                        <div class="form-group">
                            <label>Tarix</label>
                            <input type="date" id="daxil-date">
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
        const role = AuthState.user?.role;
        const canEditDocs = role === 'Administrator' || role === 'Müdir';

        this._canEditDocs = canEditDocs;
        this._daxilEditingId = null;

        this.loadData();
        this.setupRealtime();
        document.getElementById('refresh-daxil')?.addEventListener('click', () => this.loadData());

        const modal = document.getElementById('daxil-modal');
        const btnNew = document.getElementById('btn-new-daxil');
        const btnClose = document.getElementById('close-daxil-modal');
        const form = document.getElementById('daxil-form');

        document.getElementById('daxil-table-body')?.addEventListener('click', async (e) => {
            const deleteBtn = e.target?.closest?.('[data-delete-daxil]');
            const editBtn = e.target?.closest?.('[data-edit-daxil]');

            if (deleteBtn) {
                if (!canEditDocs) {
                    alert('Yalnız admin və müdir silə bilər.');
                    return;
                }
                const id = Number(deleteBtn.dataset.deleteDaxil);
                if (!id) return;
                const ok = confirm('Bu əməliyyatı silmək istəyirsiniz?');
                if (!ok) return;

                try {
                    await api.deleteDaxilOlmalarRecord(id);
                    this._daxilEditingId = null;
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

            const id = Number(editBtn.dataset.editDaxil);
            const row = (this._daxilData || []).find(r => r.id === id);
            if (row) this.openEditModal(row);
        });

        btnNew.addEventListener('click', async () => {
            this._daxilEditingId = null;
            document.getElementById('daxil-modal-title').textContent = 'Yeni Sənəd';
            document.getElementById('daxil-submit').textContent = 'Yadda Saxla';

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
            this._daxilEditingId = null;
            document.getElementById('daxil-modal-title').textContent = 'Yeni Sənəd';
            document.getElementById('daxil-submit').textContent = 'Yadda Saxla';
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const isEdit = this._daxilEditingId !== null && this._daxilEditingId !== undefined;
            if (isEdit && !canEditDocs) {
                alert('Yalnız admin və müdir sənədləri düzəldə bilər.');
                return;
            }
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
                if (isEdit) {
                    await api.updateDaxilOlmalarRecord(this._daxilEditingId, { date, supplier, total });
                } else {
                    await api.addDaxilOlmalarRecord({ date, supplier, total });
                }
                modal.classList.add('hidden');
                modal.classList.remove('modal-active');
                this.loadData();
                this._daxilEditingId = null;
                document.getElementById('daxil-modal-title').textContent = 'Yeni Sənəd';
            } catch (err) {
                alert('Sənəd qeydə alınmadı: ' + err.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Yadda Saxla';
            }
        });
    },

    setupRealtime() {
        if (!supabase) return;
        try {
            if (this._daxilChannel) supabase.removeChannel(this._daxilChannel);
        } catch (_) {}

        this._daxilChannel = supabase
            .channel('incoming_records_realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'incoming_records' },
                () => this.loadData()
            )
            .subscribe();
    },

    openEditModal(row) {
        if (!this._canEditDocs) return;

        this._daxilEditingId = row.id;

        const modal = document.getElementById('daxil-modal');
        const modalTitle = document.getElementById('daxil-modal-title');
        const submitBtn = document.getElementById('daxil-submit');
        const dateInput = document.getElementById('daxil-date');
        const supplierSelect = document.getElementById('daxil-supplier');
        const totalInput = document.getElementById('daxil-total');

        if (!modal || !modalTitle || !submitBtn) return;

        modalTitle.textContent = 'Düzəliş et';
        submitBtn.textContent = 'Yenilə';

        dateInput.disabled = false;
        dateInput.value = String(row.date || '').slice(0, 10);

        supplierSelect.disabled = false;
        supplierSelect.required = true;
        supplierSelect.innerHTML = '';
        const opt = document.createElement('option');
        opt.value = row.supplier || '';
        opt.textContent = row.supplier || '';
        supplierSelect.appendChild(opt);
        supplierSelect.value = row.supplier || '';

        const abs = api.parseMoney(row.total);
        totalInput.value = abs.toFixed(2);

        modal.classList.remove('hidden');
        modal.classList.add('modal-active');
    },

    async loadData() {
        const tbody = document.getElementById('daxil-table-body');
        if (!tbody) return;
        
        try {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;"><i class="ph ph-spinner ph-spin"></i> API-dən məlumat çəkilir...</td></tr>';
            const res = await api.getDaxilOlmalarList();

            this._daxilData = res.data || [];
            tbody.innerHTML = this._daxilData.map(row => `
                <tr>
                    <td>${api.formatDateTime(row.date)}</td>
                    <td>${row.supplier}</td>
                    <td>${row.total}</td>
                    <td>
                        ${
                            this._canEditDocs
                                ? `
                                    <div style="display:flex; gap:8px; justify-content:flex-end;">
                                        <button class="btn-outline btn-sm btn-danger" data-delete-daxil="${row.id}">Sil</button>
                                        <button class="btn-outline btn-sm" data-edit-daxil="${row.id}">Düzəliş</button>
                                    </div>
                                  `
                                : '-'
                        }
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="4" style="color:var(--danger); text-align:center;">Xəta baş verdi!</td></tr>';
        }
    }
};
