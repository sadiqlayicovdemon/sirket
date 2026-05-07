// API Məntiqi (Mock Data ilə simulyasiya)
// Gələcəkdə bu hissə əsl fetch() və ya axios çağırışları ilə əvəz olunacaq.

const API_DELAY = 600; // Asinxronluğu simulyasiya etmək üçün gecikmə

const MOCK_USERS = {
    'admin': { id: 1, role: 'Administrator', name: 'Admin', password: '123' },
    'mudur': { id: 2, role: 'Müdir', name: 'Müdir', password: '123' },
    'muhasib': { id: 3, role: 'Mühasib', name: 'Mühasib', password: '123' }
};

const DB = {
    kassa: [
        { id: 1, date: '2026-05-07T09:30:12', customer: 'Əli Məmmədov', desc: 'Sifariş #1024', type: 'Mədaxil', amount: '+ 450 ₼', status: 'success' },
        { id: 2, date: '2026-05-06T14:25:02', customer: 'Global Estates', desc: 'İcarə haqqı', type: 'Məxaric', amount: '- 1,200 ₼', status: 'danger' },
        { id: 3, date: '2026-05-06T11:10:45', customer: 'Aygün Həsənova', desc: 'Sifariş #1023', type: 'Mədaxil', amount: '+ 320 ₼', status: 'success' },
        { id: 4, date: '2026-05-05T16:00:00', customer: 'İşçilər', desc: 'Maaş ödənişləri', type: 'Məxaric', amount: '- 4,500 ₼', status: 'danger' }
    ],
    satis: [
        { id: '#1024', date: '2026-05-07T10:15:30', customer: 'Əli Məmmədov', product: 'Noutbuk Standı', amount: '45 ₼', status: 'Tamamlandı', statusClass: 'status-success' },
        { id: '#1025', date: '2026-05-06T12:05:22', customer: 'Vəli Əliyev', product: 'Mexanik Klaviatura', amount: '120 ₼', status: 'Gözləyir', statusClass: 'status-warning' },
        { id: '#1026', date: '2026-05-06T09:40:15', customer: 'Aygün Həsənova', product: 'Simsiz Siçan', amount: '35 ₼', status: 'Çatdırılmada', statusClass: 'status-info' }
    ],
    daxilOlmalar: [
        { id: 1, date: '2026-05-07T08:45:10', supplier: 'Tech Supply MMC', count: '50 ədəd', total: '2,500 ₼', status: 'Təsdiqləndi', statusClass: 'status-success' },
        { id: 2, date: '2026-05-06T14:55:00', supplier: 'Global Electronics', count: '120 ədəd', total: '8,400 ₼', status: 'Yoxlanılır', statusClass: 'status-warning' }
    ],
    fakturalar: [
        { id: 'INV-2026-001', date: '2026-05-05T13:20:00', company: 'ABC Consulting', amount: '1,500 ₼', status: 'Ödənilib', statusClass: 'status-success' },
        { id: 'INV-2026-002', date: '2026-05-06T10:00:00', company: 'Tech Supply MMC', amount: '2,500 ₼', status: 'Ödənilməyib', statusClass: 'status-danger' },
        { id: 'INV-2026-003', date: '2026-05-07T16:30:45', company: 'Marketing Agency', amount: '800 ₼', status: 'Gözləyir', statusClass: 'status-warning' }
    ],
    buyers: [
        { name: 'Əli Məmmədov', company: 'ABC Corp', phone: '+994 50 123 4567', email: 'ali@abccorp.com', address: 'Bakı, Nəsimi' },
        { name: 'Aygün Həsənova', company: 'XYZ Ltd', phone: '+994 50 234 5678', email: 'aygun@xyzltd.com', address: 'Gəncə' },
        { name: 'Vəli Əliyev', company: 'Tech Solutions', phone: '+994 50 345 6789', email: 'vali@techsolutions.com', address: 'Sumqayıt' }
    ],
    sellers: [
        { name: 'Global Estates', company: 'Global Group', phone: '+994 50 111 2222', email: 'contact@globalestates.com', address: 'Bakı' },
        { name: 'Tech Supply MMC', company: 'Tech Supply', phone: '+994 50 222 3333', email: 'sales@techsupply.com', address: 'Bakı' },
        { name: 'Global Electronics', company: 'Global Electronics', phone: '+994 50 333 4444', email: 'info@globalelectronics.com', address: 'Bakı' }
    ],
    expenseItems: [
        { name: 'Maaş Ödənişi', category: 'Əməkhaqqı', desc: 'Aylıq maaş ödənişləri' },
        { name: 'Ofis İcarəsi', category: 'İcarə', desc: 'Kirayə ödənişi' },
        { name: 'Elektrik Xərci', category: 'Elektrik', desc: 'Aylıq elektrik' },
        { name: 'Su Xərci', category: 'Su', desc: 'Aylıq su' },
        { name: 'Kompyuter Təmiri', category: 'Təmir', desc: 'Texniki xidmət' },
        { name: 'Ofis Malzəməsi', category: 'Malzəmə', desc: 'Kağız, qələm və s.' },
        { name: 'Nəqliyyat Xərci', category: 'Nəqliyyat', desc: 'Kuryer xidməti' }
    ]
};

// Gecikmə funksiyası
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
    // Auth Endpoint
    login: async (username, password) => {
        await delay(API_DELAY);
        const user = MOCK_USERS[username.toLowerCase()];
        if (user && (user.password === password || password === '12345')) {
            // Şifrə silinib yalnız istifadəçi datası qaytarılır
            const { password: _, ...userData } = user;
            return { success: true, data: userData };
        }
        throw new Error('İstifadəçi adı və ya şifrə yanlışdır');
    },

    formatDateTime: (value) => {
        if (!value) return '';
        const date = new Date(value);
        if (isNaN(date)) return value;
        const pad = (n) => String(n).padStart(2, '0');
        return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    },

    dateKey: (value) => {
        if (!value) return '';
        const date = new Date(value);
        if (isNaN(date)) return '';
        const pad = (n) => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    },

    // Kassa Endpoints
    getKassaList: async () => {
        await delay(API_DELAY);
        return { success: true, data: DB.kassa };
    },

    getCustomerList: async () => {
        await delay(API_DELAY);
        // Get unique customers from sales data
        const customers = [...new Set(DB.satis.map(sale => sale.customer))];
        return { success: true, data: customers };
    },

    addKassaRecord: async (recordData) => {
        await delay(API_DELAY);
        const datePart = recordData.date || new Date().toISOString().split('T')[0];
        const timePart = new Date().toTimeString().split(' ')[0];
        const isoDate = datePart.includes('T') ? recordData.date : `${datePart}T${timePart}`;
        const newRecord = {
            id: DB.kassa.length + 1,
            date: isoDate,
            customer: recordData.customer,
            desc: recordData.desc,
            type: recordData.type,
            amount: recordData.type === 'Mədaxil' ? `+ ${recordData.amount} ₼` : `- ${recordData.amount} ₼`,
            status: recordData.type === 'Mədaxil' ? 'success' : 'danger'
        };
        DB.kassa.unshift(newRecord); // add to top
        return { success: true, data: newRecord };
    },

    // Satis Endpoints
    getSatisList: async () => {
        await delay(API_DELAY);
        return { success: true, data: DB.satis };
    },

    addSatisRecord: async (recordData) => {
        await delay(API_DELAY);
        const newId = `#${1020 + DB.satis.length + 1}`;
        const datePart = recordData.date || new Date().toISOString().split('T')[0];
        const timePart = new Date().toTimeString().split(' ')[0];
        const isoDate = datePart.includes('T') ? recordData.date : `${datePart}T${timePart}`;
        const newRecord = {
            id: newId,
            date: isoDate,
            customer: recordData.customer,
            product: 'Satış',
            amount: `${parseFloat(recordData.amount).toFixed(2)} ₼`,
            status: 'Tamamlandı',
            statusClass: 'status-success'
        };
        DB.satis.unshift(newRecord);
        return { success: true, data: newRecord };
    },

    // Daxil Olmalar Endpoints
    getDaxilOlmalarList: async () => {
        await delay(API_DELAY);
        return { success: true, data: DB.daxilOlmalar };
    },

    addDaxilOlmalarRecord: async (recordData) => {
        await delay(API_DELAY);
        const datePart = recordData.date || new Date().toISOString().split('T')[0];
        const timePart = new Date().toTimeString().split(' ')[0];
        const isoDate = datePart.includes('T') ? recordData.date : `${datePart}T${timePart}`;
        const newRecord = {
            id: DB.daxilOlmalar.length + 1,
            date: isoDate,
            supplier: recordData.supplier,
            count: '1 ədəd',
            total: `${parseFloat(recordData.total).toFixed(2)} ₼`,
            status: 'Təsdiqləndi',
            statusClass: 'status-success'
        };
        DB.daxilOlmalar.unshift(newRecord);
        return { success: true, data: newRecord };
    },

    // Fakturalar Endpoints
    getFakturalarList: async () => {
        await delay(API_DELAY);
        return { success: true, data: DB.fakturalar };
    },

    // Müşteri Endpoints - Buyers
    getBuyersList: async () => {
        await delay(API_DELAY);
        return { success: true, data: DB.buyers };
    },

    // Müşteri Endpoints - Sellers
    getSellersList: async () => {
        await delay(API_DELAY);
        return { success: true, data: DB.sellers };
    },

    // Müşteri Endpoints - Expense Items
    getExpenseItems: async () => {
        await delay(API_DELAY);
        return { success: true, data: DB.expenseItems };
    },

    // Add contact
    addContact: async (contactData) => {
        await delay(API_DELAY);
        if (contactData.type === 'buyer') {
            DB.buyers.push(contactData);
        } else if (contactData.type === 'seller') {
            DB.sellers.push(contactData);
        }
        return { success: true, data: contactData };
    },

    // Add expense item
    addExpenseItem: async (itemData) => {
        await delay(API_DELAY);
        DB.expenseItems.push(itemData);
        return { success: true, data: itemData };
    }
};
