-- Supabase SQL schema for Biznes İdarəetmə Paneli
-- Bu SQL skriptini Supabase SQL Editor-da çalışdırın.

-- 1) İstifadəçilər
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2) Kassa əməliyyatları
CREATE TABLE IF NOT EXISTS kassa_records (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    document_date DATE NOT NULL,
    document_time TIME NOT NULL,
    customer_name TEXT,
    description TEXT,
    document_type TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT DEFAULT 'AZN',
    status TEXT,
    notes TEXT
);

-- 3) Satışlar
CREATE TABLE IF NOT EXISTS sales_records (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    document_date DATE NOT NULL,
    document_time TIME NOT NULL,
    customer_name TEXT NOT NULL,
    product_name TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT DEFAULT 'AZN',
    status TEXT,
    invoice_reference TEXT
);

-- 4) Daxil olmalar
CREATE TABLE IF NOT EXISTS incoming_records (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    document_date DATE NOT NULL,
    document_time TIME NOT NULL,
    supplier_name TEXT NOT NULL,
    item_count INTEGER,
    total_amount NUMERIC(12,2) NOT NULL,
    currency TEXT DEFAULT 'AZN',
    status TEXT,
    notes TEXT
);

-- 5) Fakturalar
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invoice_number TEXT UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    issue_time TIME NOT NULL,
    company_name TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT DEFAULT 'AZN',
    status TEXT,
    description TEXT
);

-- 6) Alıcılar / Müştərilər
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7) Satıcılar / Tədarükçülər
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8) Xərc maddələri
CREATE TABLE IF NOT EXISTS expense_items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9) Xərc qeydləri
CREATE TABLE IF NOT EXISTS expense_records (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    record_date DATE NOT NULL,
    record_time TIME NOT NULL,
    expense_item_id INTEGER REFERENCES expense_items(id),
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT DEFAULT 'AZN',
    payee_name TEXT,
    notes TEXT
);
