INSERT INTO suppliers (id, name, contact_email, phone_number)
VALUES ('5ab10001-0000-0000-0000-000000000001', 'TechSource Ltd', 'contact@techsource.com', '+40 720 000 001'),
       ('5ab10002-0000-0000-0000-000000000002', 'FashionHub', 'info@fashionhub.com', '+40 720 000 002'),
       ('5ab10003-0000-0000-0000-000000000003', 'HomeWorld', 'sales@homeworld.com', '+40 720 000 003');

UPDATE products SET supplier_id = '5ab10001-0000-0000-0000-000000000001'
WHERE id IN ('fade0001-0000-0000-0000-000000000001',
             'fade0002-0000-0000-0000-000000000002',
             'fade0003-0000-0000-0000-000000000003',
             'fade000a-0000-0000-0000-00000000000a');

UPDATE products SET supplier_id = '5ab10002-0000-0000-0000-000000000002'
WHERE id IN ('fade0004-0000-0000-0000-000000000004',
             'fade0005-0000-0000-0000-000000000005');

UPDATE products SET supplier_id = '5ab10003-0000-0000-0000-000000000003'
WHERE id IN ('fade0006-0000-0000-0000-000000000006',
             'fade0007-0000-0000-0000-000000000007',
             'fade0008-0000-0000-0000-000000000008',
             'fade0009-0000-0000-0000-000000000009');
