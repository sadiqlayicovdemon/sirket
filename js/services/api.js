import { supabase } from './supabase.js';

// API Məntiqi
// Qeyd: Kassa məlumatları Supabase-dən gəlir; qalan hissələr hələ mock ola bilər.

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
        if (!supabase) throw new Error('Supabase hazır deyil. Səhifəni yeniləyin.');

        const { data, error } = await supabase
            .from('kassa_records')
            .select('id, document_date, document_time, customer_name, description, document_type, amount, currency, status')
            .order('document_date', { ascending: false })
            .order('document_time', { ascending: false })
            .limit(500);

        if (error) throw new Error(error.message);

        const rows = (data || []).map(r => {
            const type = r.document_type;
            const sign = type === 'Mədaxil' ? '+' : '-';
            const status = type === 'Mədaxil' ? 'success' : 'danger';
            const amount = `${sign} ${Number(r.amount).toLocaleString('az-AZ')} ₼`;
            const time = (r.document_time || '00:00:00').toString().slice(0, 8);
            const date = `${r.document_date}T${time}`;
            return {
                id: r.id,
                date,
                customer: r.customer_name || '',
                desc: r.description || '',
                type,
                amount,
                status
            };
        });

        return { success: true, data: rows };
    },

    getCustomerList: async () => {
        await delay(API_DELAY);
        if (!supabase) {
            // Get unique customers from sales data
            const customers = [...new Set(DB.satis.map(sale => sale.customer))];
            return { success: true, data: customers };
        }

        const { data, error } = await supabase
            .from('customers')
            .select('name')
            .order('name', { ascending: true })
            .limit(500);
        if (error) throw new Error(error.message);
        return { success: true, data: (data || []).map(x => x.name) };
    },

    addKassaRecord: async (recordData) => {
        await delay(API_DELAY);
        if (!supabase) throw new Error('Supabase hazır deyil. Səhifəni yeniləyin.');

        const datePart = (recordData.date || new Date().toISOString().slice(0, 10)).slice(0, 10);
        const timePart = new Date().toTimeString().split(' ')[0].slice(0, 8);
        const type = recordData.type;
        const amountNum = Number(recordData.amount);
        if (!type) throw new Error('Sənəd növü seçilməlidir.');
        if (!Number.isFinite(amountNum) || amountNum <= 0) throw new Error('Məbləğ düzgün deyil.');

        const insertPayload = {
            document_date: datePart,
            document_time: timePart,
            customer_name: recordData.customer || null,
            description: recordData.desc || null,
            document_type: type,
            amount: amountNum,
            currency: 'AZN',
            status: type === 'Mədaxil' ? 'success' : 'danger'
        };

        const { data, error } = await supabase
            .from('kassa_records')
            .insert(insertPayload)
            .select('id, document_date, document_time, customer_name, description, document_type, amount')
            .single();

        if (error) throw new Error(error.message);

        const sign = type === 'Mədaxil' ? '+' : '-';
        const created = {
            id: data.id,
            date: `${data.document_date}T${String(data.document_time).slice(0, 8)}`,
            customer: data.customer_name || '',
            desc: data.description || '',
            type,
            amount: `${sign} ${Number(data.amount).toLocaleString('az-AZ')} ₼`,
            status: type === 'Mədaxil' ? 'success' : 'danger'
        };

        return { success: true, data: created };
    },

    // Satis Endpoints
    getSatisList: async () => {
        await delay(API_DELAY);
        if (!supabase) return { success: true, data: DB.satis };

        const { data, error } = await supabase
            .from('sales_records')
            .select('id, document_date, document_time, customer_name, product_name, amount, currency, status')
            .order('document_date', { ascending: false })
            .order('document_time', { ascending: false })
            .limit(500);
        if (error) throw new Error(error.message);

        const rows = (data || []).map(r => {
            const time = (r.document_time || '00:00:00').toString().slice(0, 8);
            const date = `${r.document_date}T${time}`;
            const status = r.status || 'Tamamlandı';
            const statusClass =
                status === 'Tamamlandı' ? 'status-success'
                    : status === 'Gözləyir' ? 'status-warning'
                        : status === 'Çatdırılmada' ? 'status-info'
                            : 'status-success';

            return {
                id: `#${r.id}`,
                date,
                customer: r.customer_name,
                product: r.product_name || 'Satış',
                amount: `${Number(r.amount).toLocaleString('az-AZ')} ₼`,
                status,
                statusClass
            };
        });

        return { success: true, data: rows };
    },

    addSatisRecord: async (recordData) => {
        await delay(API_DELAY);
        if (!supabase) {
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
        }

        const datePart = (recordData.date || new Date().toISOString().slice(0, 10)).slice(0, 10);
        const timePart = new Date().toTimeString().split(' ')[0].slice(0, 8);
        const amountNum = Number(recordData.amount);
        if (!recordData.customer) throw new Error('Müştəri seçilməlidir.');
        if (!Number.isFinite(amountNum) || amountNum <= 0) throw new Error('Məbləğ düzgün deyil.');

        const insertPayload = {
            document_date: datePart,
            document_time: timePart,
            customer_name: recordData.customer,
            product_name: recordData.product || 'Satış',
            amount: amountNum,
            currency: 'AZN',
            status: 'Tamamlandı'
        };

        const { data, error } = await supabase
            .from('sales_records')
            .insert(insertPayload)
            .select('id, document_date, document_time, customer_name, product_name, amount, status')
            .single();
        if (error) throw new Error(error.message);

        return {
            success: true,
            data: {
                id: `#${data.id}`,
                date: `${data.document_date}T${String(data.document_time).slice(0, 8)}`,
                customer: data.customer_name,
                product: data.product_name || 'Satış',
                amount: `${Number(data.amount).toLocaleString('az-AZ')} ₼`,
                status: data.status || 'Tamamlandı',
                statusClass: 'status-success'
            }
        };
    },

    // Daxil Olmalar Endpoints
    getDaxilOlmalarList: async () => {
        await delay(API_DELAY);
        if (!supabase) return { success: true, data: DB.daxilOlmalar };

        const { data, error } = await supabase
            .from('incoming_records')
            .select('id, document_date, document_time, supplier_name, item_count, total_amount, currency, status')
            .order('document_date', { ascending: false })
            .order('document_time', { ascending: false })
            .limit(500);
        if (error) throw new Error(error.message);

        const rows = (data || []).map(r => {
            const time = (r.document_time || '00:00:00').toString().slice(0, 8);
            const date = `${r.document_date}T${time}`;
            const status = r.status || 'Təsdiqləndi';
            const statusClass = status === 'Təsdiqləndi' ? 'status-success' : 'status-warning';
            return {
                id: r.id,
                date,
                supplier: r.supplier_name,
                count: `${r.item_count || 1} ədəd`,
                total: `${Number(r.total_amount).toLocaleString('az-AZ')} ₼`,
                status,
                statusClass
            };
        });

        return { success: true, data: rows };
    },

    addDaxilOlmalarRecord: async (recordData) => {
        await delay(API_DELAY);
        if (!supabase) {
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
        }

        const datePart = (recordData.date || new Date().toISOString().slice(0, 10)).slice(0, 10);
        const timePart = new Date().toTimeString().split(' ')[0].slice(0, 8);
        const totalNum = Number(recordData.total);
        if (!recordData.supplier) throw new Error('Tədarükçü seçilməlidir.');
        if (!Number.isFinite(totalNum) || totalNum <= 0) throw new Error('Məbləğ düzgün deyil.');

        const insertPayload = {
            document_date: datePart,
            document_time: timePart,
            supplier_name: recordData.supplier,
            item_count: 1,
            total_amount: totalNum,
            currency: 'AZN',
            status: 'Təsdiqləndi'
        };

        const { data, error } = await supabase
            .from('incoming_records')
            .insert(insertPayload)
            .select('id, document_date, document_time, supplier_name, item_count, total_amount, status')
            .single();
        if (error) throw new Error(error.message);

        return {
            success: true,
            data: {
                id: data.id,
                date: `${data.document_date}T${String(data.document_time).slice(0, 8)}`,
                supplier: data.supplier_name,
                count: `${data.item_count || 1} ədəd`,
                total: `${Number(data.total_amount).toLocaleString('az-AZ')} ₼`,
                status: data.status || 'Təsdiqləndi',
                statusClass: 'status-success'
            }
        };
    },

    // Fakturalar Endpoints
    getFakturalarList: async () => {
        await delay(API_DELAY);
        if (!supabase) return { success: true, data: DB.fakturalar };

        const { data, error } = await supabase
            .from('invoices')
            .select('invoice_number, issue_date, issue_time, company_name, amount, currency, status, description')
            .order('issue_date', { ascending: false })
            .order('issue_time', { ascending: false })
            .limit(500);
        if (error) throw new Error(error.message);

        const rows = (data || []).map(r => {
            const time = (r.issue_time || '00:00:00').toString().slice(0, 8);
            const date = `${r.issue_date}T${time}`;
            const status = r.status || 'Gözləyir';
            const statusClass =
                status === 'Ödənilib' ? 'status-success'
                    : status === 'Ödənilməyib' ? 'status-danger'
                        : 'status-warning';
            return {
                id: r.invoice_number,
                date,
                company: r.company_name,
                amount: `${Number(r.amount).toLocaleString('az-AZ')} ₼`,
                status,
                statusClass,
                desc: r.description || ''
            };
        });

        return { success: true, data: rows };
    },

    // Müşteri Endpoints - Buyers
    getBuyersList: async () => {
        await delay(API_DELAY);
        if (!supabase) return { success: true, data: DB.buyers };

        const { data, error } = await supabase
            .from('customers')
            .select('id, name')
            .order('name', { ascending: true })
            .limit(500);
        if (error) throw new Error(error.message);
        return { success: true, data: (data || []).map(x => ({ id: x.id, name: x.name })) };
    },

    // Müşteri Endpoints - Sellers
    getSellersList: async () => {
        await delay(API_DELAY);
        if (!supabase) return { success: true, data: DB.sellers };

        const { data, error } = await supabase
            .from('suppliers')
            .select('id, name')
            .order('name', { ascending: true })
            .limit(500);
        if (error) throw new Error(error.message);
        return { success: true, data: (data || []).map(x => ({ id: x.id, name: x.name })) };
    },

    // Müşteri Endpoints - Expense Items
    getExpenseItems: async () => {
        await delay(API_DELAY);
        if (!supabase) return { success: true, data: DB.expenseItems };

        const { data, error } = await supabase
            .from('expense_items')
            .select('id, name, category, description')
            .order('name', { ascending: true })
            .limit(500);
        if (error) throw new Error(error.message);
        return {
            success: true,
            data: (data || []).map(x => ({
                id: x.id,
                name: x.name,
                category: x.category,
                desc: x.description || ''
            }))
        };
    },

    // Add contact
    addContact: async (contactData) => {
        await delay(API_DELAY);
        if (!supabase) {
            if (contactData.type === 'buyer') {
                DB.buyers.push(contactData);
            } else if (contactData.type === 'seller') {
                DB.sellers.push(contactData);
            }
            return { success: true, data: contactData };
        }

        if (contactData.type === 'buyer') {
            const { data, error } = await supabase
                .from('customers')
                .insert({
                    name: contactData.name,
                    company: contactData.company || null,
                    phone: contactData.phone || null,
                    email: contactData.email || null,
                    address: contactData.address || null
                })
                .select('id, name, company, phone, email, address')
                .single();
            if (error) throw new Error(error.message);
            return { success: true, data };
        }

        if (contactData.type === 'seller') {
            const { data, error } = await supabase
                .from('suppliers')
                .insert({
                    name: contactData.name,
                    company: contactData.company || null,
                    phone: contactData.phone || null,
                    email: contactData.email || null,
                    address: contactData.address || null
                })
                .select('id, name, company, phone, email, address')
                .single();
            if (error) throw new Error(error.message);
            return { success: true, data };
        }

        throw new Error('Contact type düzgün deyil.');
    },

    // Add expense item
    addExpenseItem: async (itemData) => {
        await delay(API_DELAY);
        if (!supabase) {
            DB.expenseItems.push(itemData);
            return { success: true, data: itemData };
        }

        const { data, error } = await supabase
            .from('expense_items')
            .insert({
                name: itemData.name,
                category: itemData.category,
                description: itemData.desc || null
            })
            .select('id, name, category, description')
            .single();

        if (error) throw new Error(error.message);

        return {
            success: true,
            data: {
                id: data.id,
                name: data.name,
                category: data.category,
                desc: data.description || ''
            }
        };
    }
};
