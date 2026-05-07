-- 4 İstifadəçi yarat (Supabase SQL Editor-da çalışdırın)

INSERT INTO public.users (username, full_name, role, email) VALUES
('admin', 'Admin User', 'Administrator', 'admin@biznes.az'),
('mudur', 'Manager User', 'Müdir', 'mudur@biznes.az'),
('fuad', 'Fuad Əhmədov', 'İşçi', 'fuad@biznes.az'),
('elgun', 'Elgun Qəribov', 'İşçi', 'elgun@biznes.az');

-- Yaradılmış istifadəçiləri göstər
SELECT id, username, full_name, role, email, created_at FROM public.users ORDER BY created_at DESC;
