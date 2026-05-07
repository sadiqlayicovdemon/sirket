import { api } from '../../services/api.js';

export const MusteriView = {
    render() {
        const div = document.createElement('div');
        div.className = 'view-section active';
        div.innerHTML = `
            <div class="page-header" style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h2>Müşteri & Xərc Maddələri</h2>
                    <p>Alıcı, satıcı və xərc maddələrini idarə edin</p>
                </div>
            </div>

            <!-- Tabs Navigation -->
            <div class="tabs-container" style="display:flex; gap:10px; margin-bottom:20px; border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
                <button class="tab-btn active" data-tab="buyers" style="padding: 8px 20px; background: transparent; border: none; color: var(--text); cursor: pointer; font-weight: 500; border-bottom: 3px solid var(--primary); padding-bottom: 5px; margin-bottom: -10px;">
                    <i class="ph ph-users"></i> Alıcılar
                </button>
                <button class="tab-btn" data-tab="sellers" style="padding: 8px 20px; background: transparent; border: none; color: var(--text); cursor: pointer; font-weight: 500; border-bottom: 3px solid transparent; padding-bottom: 5px; margin-bottom: -10px;">
                    <i class="ph ph-handshake"></i> Satıcılar
                </button>
                <button class="tab-btn" data-tab="expenses" style="padding: 8px 20px; background: transparent; border: none; color: var(--text); cursor: pointer; font-weight: 500; border-bottom: 3px solid transparent; padding-bottom: 5px; margin-bottom: -10px;">
                    <i class="ph ph-list"></i> Xərc Maddələri
                </button>
            </div>

            <!-- TAB 1: BUYERS -->
            <div id="tab-buyers" class="tab-content" style="display:block;">
                <div class="table-container glass-panel">
                    <div class="table-header">
                        <h3>Alıcı Siyahısı</h3>
                        <button class="btn-outline btn-sm" id="btn-add-buyer"><i class="ph ph-plus"></i> Yeni Alıcı</button>
                    </div>
                    <table class="data-table">
                        <thead><tr><th>Adı</th><th>Şirkət</th><th>Telefon</th><th>Email</th><th>Ünvan</th><th>Əməliyyatlar</th></tr></thead>
                        <tbody id="buyers-table-body">
                            <tr><td colspan="6" style="text-align:center;"><i class="ph ph-spinner ph-spin"></i> Yüklənir...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- TAB 2: SELLERS -->
            <div id="tab-sellers" class="tab-content" style="display:none;">
                <div class="table-container glass-panel">
                    <div class="table-header">
                        <h3>Satıcı Siyahısı</h3>
                        <button class="btn-outline btn-sm" id="btn-add-seller"><i class="ph ph-plus"></i> Yeni Satıcı</button>
                    </div>
                    <table class="data-table">
                        <thead><tr><th>Adı</th><th>Şirkət</th><th>Telefon</th><th>Email</th><th>Ünvan</th><th>Əməliyyatlar</th></tr></thead>
                        <tbody id="sellers-table-body">
                            <tr><td colspan="6" style="text-align:center;"><i class="ph ph-spinner ph-spin"></i> Yüklənir...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- TAB 3: EXPENSE ITEMS -->
            <div id="tab-expenses" class="tab-content" style="display:none;">
                <div class="table-container glass-panel">
                    <div class="table-header">
                        <h3>Xərc Maddələri</h3>
                        <button class="btn-outline btn-sm" id="btn-add-expense"><i class="ph ph-plus"></i> Yeni Xərc Maddəsi</button>
                    </div>
                    <table class="data-table">
                        <thead><tr><th>Maddə Adı</th><th>Kateqoriya</th><th>Təsvir</th><th>Status</th><th>Əməliyyatlar</th></tr></thead>
                        <tbody id="expenses-table-body">
                            <tr><td colspan="5" style="text-align:center;"><i class="ph ph-spinner ph-spin"></i> Yüklənir...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Modal for Adding Buyer -->
            <div id="buyer-modal" class="modal hidden">
                <div class="modal-content glass-panel">
                    <div class="modal-header">
                        <h3>Yeni Alıcı Əlavə Et</h3>
                        <button class="close-buyer-modal icon-btn"><i class="ph ph-x"></i></button>
                    </div>
                    <form id="buyer-form" class="modal-form">
                        <div class="form-group">
                            <label>Adı *</label>
                            <input type="text" id="buyer-name" required>
                        </div>
                        <div class="form-group">
                            <label>Şirkət</label>
                            <input type="text" id="buyer-company">
                        </div>
                        <div class="form-group">
                            <label>Telefon</label>
                            <input type="tel" id="buyer-phone">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="buyer-email">
                        </div>
                        <div class="form-group">
                            <label>Ünvan</label>
                            <input type="text" id="buyer-address">
                        </div>
                        <button type="submit" class="btn-primary" style="width:100%; margin-top:15px;">Əlavə Et</button>
                    </form>
                </div>
            </div>

            <!-- Modal for Adding Seller -->
            <div id="seller-modal" class="modal hidden">
                <div class="modal-content glass-panel">
                    <div class="modal-header">
                        <h3>Yeni Satıcı Əlavə Et</h3>
                        <button class="close-seller-modal icon-btn"><i class="ph ph-x"></i></button>
                    </div>
                    <form id="seller-form" class="modal-form">
                        <div class="form-group">
                            <label>Adı *</label>
                            <input type="text" id="seller-name" required>
                        </div>
                        <div class="form-group">
                            <label>Şirkət</label>
                            <input type="text" id="seller-company">
                        </div>
                        <div class="form-group">
                            <label>Telefon</label>
                            <input type="tel" id="seller-phone">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="seller-email">
                        </div>
                        <div class="form-group">
                            <label>Ünvan</label>
                            <input type="text" id="seller-address">
                        </div>
                        <button type="submit" class="btn-primary" style="width:100%; margin-top:15px;">Əlavə Et</button>
                    </form>
                </div>
            </div>

            <!-- Modal for Adding Expense Item -->
            <div id="expense-modal" class="modal hidden">
                <div class="modal-content glass-panel">
                    <div class="modal-header">
                        <h3>Yeni Xərc Maddəsi Əlavə Et</h3>
                        <button class="close-expense-modal icon-btn"><i class="ph ph-x"></i></button>
                    </div>
                    <form id="expense-form" class="modal-form">
                        <div class="form-group">
                            <label>Maddə Adı *</label>
                            <input type="text" id="expense-name" required>
                        </div>
                        <div class="form-group">
                            <label>Kateqoriya *</label>
                            <select id="expense-category" required>
                                <option value="">Kateqoriya seçin...</option>
                                <option value="Əməkhaqqı">Əməkhaqqı</option>
                                <option value="İcarə">İcarə</option>
                                <option value="Elektrik">Elektrik</option>
                                <option value="Su">Su</option>
                                <option value="Təmir">Təmir</option>
                                <option value="Malzəmə">Malzəmə</option>
                                <option value="Nəqliyyat">Nəqliyyat</option>
                                <option value="Digər">Digər</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Təsvir</label>
                            <textarea id="expense-desc" rows="3"></textarea>
                        </div>
                        <button type="submit" class="btn-primary" style="width:100%; margin-top:15px;">Əlavə Et</button>
                    </form>
                </div>
            </div>
        `;
        return div;
    },

    async afterRender() {
        this.setupTabNavigation();
        this.loadBuyers();
        this.loadSellers();
        this.loadExpenses();
        this.setupEventListeners();
    },

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;

                // Remove active from all buttons and contents
                tabButtons.forEach(b => {
                    b.style.borderBottom = '3px solid transparent';
                    b.style.marginBottom = '-10px';
                    b.style.paddingBottom = '5px';
                });
                tabContents.forEach(tc => tc.style.display = 'none');

                // Add active to clicked button
                btn.style.borderBottom = '3px solid var(--primary)';
                document.getElementById(`tab-${tabName}`).style.display = 'block';
            });
        });
    },

    setupEventListeners() {
        // Buyers
        document.getElementById('btn-add-buyer')?.addEventListener('click', () => {
            document.getElementById('buyer-form').reset();
            document.getElementById('buyer-modal').classList.remove('hidden');
            document.getElementById('buyer-modal').classList.add('modal-active');
        });

        document.querySelector('.close-buyer-modal')?.addEventListener('click', () => {
            document.getElementById('buyer-modal').classList.add('hidden');
            document.getElementById('buyer-modal').classList.remove('modal-active');
        });

        document.getElementById('buyer-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addBuyer();
        });

        // Sellers
        document.getElementById('btn-add-seller')?.addEventListener('click', () => {
            document.getElementById('seller-form').reset();
            document.getElementById('seller-modal').classList.remove('hidden');
            document.getElementById('seller-modal').classList.add('modal-active');
        });

        document.querySelector('.close-seller-modal')?.addEventListener('click', () => {
            document.getElementById('seller-modal').classList.add('hidden');
            document.getElementById('seller-modal').classList.remove('modal-active');
        });

        document.getElementById('seller-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addSeller();
        });

        // Expenses
        document.getElementById('btn-add-expense')?.addEventListener('click', () => {
            document.getElementById('expense-form').reset();
            document.getElementById('expense-modal').classList.remove('hidden');
            document.getElementById('expense-modal').classList.add('modal-active');
        });

        document.querySelector('.close-expense-modal')?.addEventListener('click', () => {
            document.getElementById('expense-modal').classList.add('hidden');
            document.getElementById('expense-modal').classList.remove('modal-active');
        });

        document.getElementById('expense-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addExpense();
        });

        // Inline edit actions
        document.getElementById('buyers-table-body')?.addEventListener('click', async (e) => {
            const btn = e.target.closest('.edit-buyer-btn');
            if (!btn) return;
            await this.editBuyer(btn.dataset);
        });

        document.getElementById('sellers-table-body')?.addEventListener('click', async (e) => {
            const btn = e.target.closest('.edit-seller-btn');
            if (!btn) return;
            await this.editSeller(btn.dataset);
        });

        document.getElementById('expenses-table-body')?.addEventListener('click', async (e) => {
            const btn = e.target.closest('.edit-expense-btn');
            if (!btn) return;
            await this.editExpense(btn.dataset);
        });
    },

    async loadBuyers() {
        const tbody = document.getElementById('buyers-table-body');
        if (!tbody) return;

        try {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;"><i class="ph ph-spinner ph-spin"></i> Yüklənir...</td></tr>';
            const res = await api.getBuyersList?.() || { data: [] };
            
            if (res.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-light);">Alıcı tapılmadı</td></tr>';
                return;
            }

            tbody.innerHTML = res.data.map(buyer => `
                <tr>
                    <td>${buyer.name}</td>
                    <td>${buyer.company || '-'}</td>
                    <td>${buyer.phone || '-'}</td>
                    <td>${buyer.email || '-'}</td>
                    <td>${buyer.address || '-'}</td>
                    <td>
                        <button class="icon-btn edit-buyer-btn" data-id="${buyer.id}" data-name="${buyer.name}" data-company="${buyer.company || ''}" data-phone="${buyer.phone || ''}" data-email="${buyer.email || ''}" data-address="${buyer.address || ''}"><i class="ph ph-pencil"></i></button>
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="6" style="color:var(--danger); text-align:center;">Xəta baş verdi!</td></tr>';
        }
    },

    async loadSellers() {
        const tbody = document.getElementById('sellers-table-body');
        if (!tbody) return;

        try {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;"><i class="ph ph-spinner ph-spin"></i> Yüklənir...</td></tr>';
            const res = await api.getSellersList?.() || { data: [] };
            
            if (res.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-light);">Satıcı tapılmadı</td></tr>';
                return;
            }

            tbody.innerHTML = res.data.map(seller => `
                <tr>
                    <td>${seller.name}</td>
                    <td>${seller.company || '-'}</td>
                    <td>${seller.phone || '-'}</td>
                    <td>${seller.email || '-'}</td>
                    <td>${seller.address || '-'}</td>
                    <td>
                        <button class="icon-btn edit-seller-btn" data-id="${seller.id}" data-name="${seller.name}" data-company="${seller.company || ''}" data-phone="${seller.phone || ''}" data-email="${seller.email || ''}" data-address="${seller.address || ''}"><i class="ph ph-pencil"></i></button>
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="6" style="color:var(--danger); text-align:center;">Xəta baş verdi!</td></tr>';
        }
    },

    async loadExpenses() {
        const tbody = document.getElementById('expenses-table-body');
        if (!tbody) return;

        try {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;"><i class="ph ph-spinner ph-spin"></i> Yüklənir...</td></tr>';
            const res = await api.getExpenseItems?.() || { data: [] };
            
            if (res.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-light);">Xərc maddəsi tapılmadı</td></tr>';
                return;
            }

            tbody.innerHTML = res.data.map(item => `
                <tr>
                    <td><strong>${item.name}</strong></td>
                    <td><span class="badge" style="background:var(--primary); padding:4px 8px; border-radius:4px;">${item.category}</span></td>
                    <td>${item.desc || '-'}</td>
                    <td><span style="color:var(--success);">✓ Aktiv</span></td>
                    <td>
                        <button class="icon-btn edit-expense-btn" data-id="${item.id}" data-name="${item.name}" data-category="${item.category || 'Digər'}" data-desc="${item.desc || ''}"><i class="ph ph-pencil"></i></button>
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="5" style="color:var(--danger); text-align:center;">Xəta baş verdi!</td></tr>';
        }
    },

    async addBuyer() {
        const data = {
            name: document.getElementById('buyer-name').value,
            company: document.getElementById('buyer-company').value,
            phone: document.getElementById('buyer-phone').value,
            email: document.getElementById('buyer-email').value,
            address: document.getElementById('buyer-address').value,
            type: 'buyer'
        };

        try {
            await api.addContact?.(data) || alert('Alıcı əlavə edildi: ' + data.name);
            document.getElementById('buyer-modal').classList.add('hidden');
            document.getElementById('buyer-modal').classList.remove('modal-active');
            this.loadBuyers();
        } catch (err) {
            alert('Xəta: ' + err.message);
        }
    },

    async addSeller() {
        const data = {
            name: document.getElementById('seller-name').value,
            company: document.getElementById('seller-company').value,
            phone: document.getElementById('seller-phone').value,
            email: document.getElementById('seller-email').value,
            address: document.getElementById('seller-address').value,
            type: 'seller'
        };

        try {
            await api.addContact?.(data) || alert('Satıcı əlavə edildi: ' + data.name);
            document.getElementById('seller-modal').classList.add('hidden');
            document.getElementById('seller-modal').classList.remove('modal-active');
            this.loadSellers();
        } catch (err) {
            alert('Xəta: ' + err.message);
        }
    },

    async addExpense() {
        const data = {
            name: document.getElementById('expense-name').value,
            category: document.getElementById('expense-category').value,
            desc: document.getElementById('expense-desc').value
        };

        try {
            await api.addExpenseItem?.(data) || alert('Xərc maddəsi əlavə edildi: ' + data.name);
            document.getElementById('expense-modal').classList.add('hidden');
            document.getElementById('expense-modal').classList.remove('modal-active');
            this.loadExpenses();
        } catch (err) {
            alert('Xəta: ' + err.message);
        }
    },

    async editBuyer(data) {
        const newName = prompt('Yeni alıcı adı:', data.name || '');
        if (newName === null) return;
        const trimmed = newName.trim();
        if (!trimmed) return alert('Ad boş ola bilməz.');

        try {
            await api.updateContact({
                id: Number(data.id),
                type: 'buyer',
                oldName: data.name,
                name: trimmed,
                company: data.company || '',
                phone: data.phone || '',
                email: data.email || '',
                address: data.address || ''
            });
            await Promise.all([this.loadBuyers(), this.loadSellers(), this.loadExpenses()]);
            alert('Alıcı adı yeniləndi və bağlı sənədlərə tətbiq edildi.');
        } catch (err) {
            alert('Xəta: ' + err.message);
        }
    },

    async editSeller(data) {
        const newName = prompt('Yeni satıcı adı:', data.name || '');
        if (newName === null) return;
        const trimmed = newName.trim();
        if (!trimmed) return alert('Ad boş ola bilməz.');

        try {
            await api.updateContact({
                id: Number(data.id),
                type: 'seller',
                oldName: data.name,
                name: trimmed,
                company: data.company || '',
                phone: data.phone || '',
                email: data.email || '',
                address: data.address || ''
            });
            await Promise.all([this.loadBuyers(), this.loadSellers(), this.loadExpenses()]);
            alert('Satıcı adı yeniləndi və bağlı sənədlərə tətbiq edildi.');
        } catch (err) {
            alert('Xəta: ' + err.message);
        }
    },

    async editExpense(data) {
        const newName = prompt('Yeni xərc maddəsi adı:', data.name || '');
        if (newName === null) return;
        const trimmed = newName.trim();
        if (!trimmed) return alert('Maddə adı boş ola bilməz.');

        try {
            await api.updateExpenseItem({
                id: Number(data.id),
                oldName: data.name,
                name: trimmed,
                category: data.category || 'Digər',
                desc: data.desc || ''
            });
            await Promise.all([this.loadBuyers(), this.loadSellers(), this.loadExpenses()]);
            alert('Xərc maddəsi yeniləndi və bağlı sənədlərə tətbiq edildi.');
        } catch (err) {
            alert('Xəta: ' + err.message);
        }
    }
};
