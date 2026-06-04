import { SupplierDto } from '../../types/dtos/supplier.dto';

export const MOCK_SUPPLIERS: SupplierDto[] = [
    {
        id: 'sup-1',
        name: 'TechSource Ltd',
        contactEmail: 'contact@techsource.com',
        phoneNumber: '+40 720 000 001'
    },
    {
        id: 'sup-2',
        name: 'FashionHub',
        contactEmail: 'info@fashionhub.com',
        phoneNumber: '+40 720 000 002'
    },
    {
        id: 'sup-3',
        name: 'HomeWorld',
        contactEmail: 'sales@homeworld.com',
        phoneNumber: '+40 720 000 003'
    }
];
