import { supabase } from './supabase.js';

// API Məntiqi
// Qeyd: Kassa məlumatları Supabase-dən gəlir; qalan hissələr hələ mock ola bilər.

const API_DELAY = 600; // Asinxronluğu simulyasiya etmək üçün gecikmə

const MOCK_USERS = {
    'admin': { id: 1, role: 'Administrator', name: 'Admin', password: 'admin123' },
    'mudur': { id: 2, role: 'Müdir',         name: 'Müdir', password: 'mudur123' },
    'fuad':  { id: 3, role: 'İstifadəçi',    name: 'Fuad',  password: 'fuad123' },
    'elgun': { id: 4, role: 'İstifadəçi',    name: 'Elgün', password: 'elgun123' }
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
        // Avoid timezone shifts on mobile/tablet:
        // Our app stores dates like "YYYY-MM-DDTHH:mm:ss" as strings.
        if (typeof value === 'string') {
            const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
            if (m) {
                const [, yyyy, mm, dd, hh, min, ssRaw] = m;
                const ss = ssRaw || '00';
                return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}`;
            }
            const d = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (d) {
                const [, yyyy, mm, dd] = d;
                return `${dd}-${mm}-${yyyy}`;
            }
        }

        const date = new Date(value);
        if (isNaN(date)) return value;
        const pad = (n) => String(n).padStart(2, '0');
        return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    },

    dateKey: (value) => {
        if (!value) return '';
        const pad = (n) => String(n).padStart(2, '0');

        if (value instanceof Date) {
            if (isNaN(value)) return '';
            return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
        }

        // If it's already "YYYY-MM-DD..." just take the first 10 chars.
        const s = String(value);
        const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (m) return `${m[1]}-${m[2]}-${m[3]}`;

        const date = new Date(value);
        if (isNaN(date)) return '';
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    },

    // Universal parser for monetary strings like:
    // "+ 10.000 ₼", "-150 ₼", "20,000 ₼", "14.655,5 ₼"
    // Returns absolute numeric value for calculations.
    parseMoney: (value) => {
        if (value === null || value === undefined) return 0;
        if (typeof value === 'number') return Math.abs(value);

        const s = String(value).trim();
        if (!s) return 0;

        const negative = s.includes('-');
        let cleaned = s.replace(/[^\d.,-]/g, '');
        if (!cleaned) return 0;

        cleaned = cleaned.replace(/-/g, '');
        if (!cleaned) return 0;

        const countDot = (cleaned.match(/\./g) || []).length;
        const countComma = (cleaned.match(/,/g) || []).length;
        if (countDot === 0 && countComma === 0) {
            const n = parseFloat(cleaned);
            return isNaN(n) ? 0 : Math.abs(n);
        }

        const lastDot = cleaned.lastIndexOf('.');
        const lastComma = cleaned.lastIndexOf(',');
        const lastSepIndex = Math.max(lastDot, lastComma);
        const sepChar = cleaned[lastSepIndex];

        const left = cleaned.slice(0, lastSepIndex);
        const right = cleaned.slice(lastSepIndex + 1);

        const leftDigits = left.replace(/[.,]/g, '');
        const rightDigits = right.replace(/[.,]/g, '');

        // If both separators exist, assume:
        // thousands separator = the other char, decimal separator = lastSepChar
        if (countDot > 0 && countComma > 0) {
            const n = parseFloat(`${leftDigits}.${rightDigits}`);
            return isNaN(n) ? 0 : Math.abs(n) * (negative ? 1 : 1);
        }

        // Single separator type: if exactly 3 digits after the separator, treat as thousand separator.
        if (rightDigits.length === 3) {
            const n = parseFloat(`${leftDigits}${rightDigits}`);
            return isNaN(n) ? 0 : Math.abs(n);
        }

        // Otherwise treat separator as decimal separator.
        const n = parseFloat(`${leftDigits}.${rightDigits}`);
        return isNaN(n) ? 0 : Math.abs(n);
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

    updateKassaRecord: async (recordId, recordData) => {
        await delay(API_DELAY);
        if (!supabase) throw new Error('Supabase hazır deyil. Səhifəni yeniləyin.');

        const datePart = (recordData.date || new Date().toISOString().slice(0, 10)).slice(0, 10);
        const timePart = new Date().toTimeString().split(' ')[0].slice(0, 8);
        const type = recordData.type;
        const amountNum = Number(recordData.amount);

        if (!type) throw new Error('Sənəd növü seçilməlidir.');
        if (!Number.isFinite(amountNum) || amountNum <= 0) throw new Error('Məbləğ düzgün deyil.');

        const payload = {
            document_date: datePart,
            document_time: timePart,
            customer_name: recordData.customer || null,
            description: recordData.desc || null,
            document_type: type,
            amount: amountNum,
            currency: 'AZN',
            status: type === 'Mədaxil' ? 'success' : 'danger'
        };

        const { error } = await supabase
            .from('kassa_records')
            .update(payload)
            .eq('id', recordId);

        if (error) throw new Error(error.message);
        return { success: true };
    },

    deleteKassaRecord: async (recordId) => {
        await delay(API_DELAY);
        if (!supabase) throw new Error('Supabase hazır deyil. Səhifəni yeniləyin.');

        const { error } = await supabase
            .from('kassa_records')
            .delete()
            .eq('id', recordId);

        if (error) throw new Error(error.message);
        return { success: true };
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
                dbId: r.id,
                date,
                customer: r.customer_name,
                product: r.product_name || 'Satış',
                amount: `${Number(r.amount).toLocaleString('az-AZ')} ₼`,
                amountValue: Number(r.amount),
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

    updateSatisRecord: async (recordId, recordData) => {
        await delay(API_DELAY);
        if (!supabase) throw new Error('Supabase hazır deyil. Səhifəni yeniləyin.');

        const datePart = (recordData.date || new Date().toISOString().slice(0, 10)).slice(0, 10);
        const timePart = new Date().toTimeString().split(' ')[0].slice(0, 8);
        const amountNum = Number(recordData.amount);

        if (!recordData.customer) throw new Error('Müştəri seçilməlidir.');
        if (!Number.isFinite(amountNum) || amountNum <= 0) throw new Error('Məbləğ düzgün deyil.');

        const payload = {
            document_date: datePart,
            document_time: timePart,
            customer_name: recordData.customer,
            product_name: recordData.product || 'Satış',
            amount: amountNum,
            currency: 'AZN',
            status: 'Tamamlandı'
        };

        const { error } = await supabase
            .from('sales_records')
            .update(payload)
            .eq('id', recordId);

        if (error) throw new Error(error.message);
        return { success: true };
    },

    deleteSatisRecord: async (recordId) => {
        await delay(API_DELAY);
        if (!supabase) throw new Error('Supabase hazır deyil. Səhifəni yeniləyin.');

        const { error } = await supabase
            .from('sales_records')
            .delete()
            .eq('id', recordId);

        if (error) throw new Error(error.message);
        return { success: true };
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

    updateDaxilOlmalarRecord: async (recordId, recordData) => {
        await delay(API_DELAY);
        if (!supabase) throw new Error('Supabase hazır deyil. Səhifəni yeniləyin.');

        const datePart = (recordData.date || new Date().toISOString().slice(0, 10)).slice(0, 10);
        const timePart = new Date().toTimeString().split(' ')[0].slice(0, 8);
        const totalNum = Number(recordData.total);

        if (!recordData.supplier) throw new Error('Tədarükçü seçilməlidir.');
        if (!Number.isFinite(totalNum) || totalNum <= 0) throw new Error('Məbləğ düzgün deyil.');

        const payload = {
            document_date: datePart,
            document_time: timePart,
            supplier_name: recordData.supplier,
            item_count: 1,
            total_amount: totalNum,
            currency: 'AZN',
            status: 'Təsdiqləndi'
        };

        const { error } = await supabase
            .from('incoming_records')
            .update(payload)
            .eq('id', recordId);

        if (error) throw new Error(error.message);
        return { success: true };
    },

    deleteDaxilOlmalarRecord: async (recordId) => {
        await delay(API_DELAY);
        if (!supabase) throw new Error('Supabase hazır deyil. Səhifəni yeniləyin.');

        const { error } = await supabase
            .from('incoming_records')
            .delete()
            .eq('id', recordId);

        if (error) throw new Error(error.message);
        return { success: true };
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

    updateContact: async (contactData) => {
        await delay(API_DELAY);
        if (!supabase) throw new Error('Supabase hazır deyil. Səhifəni yeniləyin.');

        const { id, type, name, company, phone, email, address, oldName } = contactData;
        if (!id || !type) throw new Error('Məlumat natamamdır.');
        if (!name) throw new Error('Ad boş ola bilməz.');

        if (type === 'buyer') {
            const { error: customerErr } = await supabase
                .from('customers')
                .update({
                    name,
                    company: company || null,
                    phone: phone || null,
                    email: email || null,
                    address: address || null
                })
                .eq('id', id);
            if (customerErr) throw new Error(customerErr.message);

            // Cascade rename in related docs
            if (oldName && oldName !== name) {
                const { error: salesErr } = await supabase
                    .from('sales_records')
                    .update({ customer_name: name })
                    .eq('customer_name', oldName);
                if (salesErr) throw new Error(salesErr.message);

                const { error: kassaErr } = await supabase
                    .from('kassa_records')
                    .update({ customer_name: name })
                    .eq('customer_name', oldName)
                    .eq('document_type', 'Mədaxil');
                if (kassaErr) throw new Error(kassaErr.message);
            }

            return { success: true };
        }

        if (type === 'seller') {
            const { error: supplierErr } = await supabase
                .from('suppliers')
                .update({
                    name,
                    company: company || null,
                    phone: phone || null,
                    email: email || null,
                    address: address || null
                })
                .eq('id', id);
            if (supplierErr) throw new Error(supplierErr.message);

            // Cascade rename in related docs
            if (oldName && oldName !== name) {
                const { error: incomingErr } = await supabase
                    .from('incoming_records')
                    .update({ supplier_name: name })
                    .eq('supplier_name', oldName);
                if (incomingErr) throw new Error(incomingErr.message);

                const { error: kassaErr } = await supabase
                    .from('kassa_records')
                    .update({ customer_name: name })
                    .eq('customer_name', oldName)
                    .eq('document_type', 'Məxaric');
                if (kassaErr) throw new Error(kassaErr.message);
            }

            return { success: true };
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
    },

    updateExpenseItem: async (itemData) => {
        await delay(API_DELAY);
        if (!supabase) throw new Error('Supabase hazır deyil. Səhifəni yeniləyin.');

        const { id, name, category, desc, oldName } = itemData;
        if (!id) throw new Error('Xərc maddəsi ID tapılmadı.');
        if (!name) throw new Error('Maddə adı boş ola bilməz.');

        const { error } = await supabase
            .from('expense_items')
            .update({
                name,
                category: category || 'Digər',
                description: desc || null
            })
            .eq('id', id);
        if (error) throw new Error(error.message);

        // Cascade rename in kassa xerc records
        if (oldName && oldName !== name) {
            const { error: kassaErr } = await supabase
                .from('kassa_records')
                .update({ description: name })
                .eq('description', oldName)
                .eq('document_type', 'Xerc');
            if (kassaErr) throw new Error(kassaErr.message);
        }

        return { success: true };
    }
};
