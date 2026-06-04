import { toCreateOrderDto } from './cart.utils';
import { CartItem } from '../types/cart-item.type';
import { AddressDto } from '../../../core/types/dtos/location.dto';

const MOCK_ADDRESS: AddressDto = {
    country: 'Romania',
    city: 'Cluj-Napoca',
    county: 'Cluj',
    streetAddress: 'Str. Eroilor 10'
};

const MOCK_ITEMS: CartItem[] = [
    { productId: 'prod-1', quantity: 2 },
    { productId: 'prod-2', quantity: 1 }
];

describe('toCreateOrderDto()', () => {
    it('should include address in the payload', () => {
        // Prepare
        // (MOCK_ADDRESS and MOCK_ITEMS defined above)

        // Action
        const result = toCreateOrderDto(MOCK_ITEMS, MOCK_ADDRESS);

        // Verify
        expect(result.address).toEqual(MOCK_ADDRESS);
    });

    it('should map all cart items to order items', () => {
        // Prepare
        // (MOCK_ITEMS defined above)

        // Action
        const result = toCreateOrderDto(MOCK_ITEMS, MOCK_ADDRESS);

        // Verify
        expect(result.items).toHaveLength(2);
        expect(result.items[0]).toEqual({ productId: 'prod-1', quantity: 2 });
        expect(result.items[1]).toEqual({ productId: 'prod-2', quantity: 1 });
    });

    it('should return empty items array when cart is empty', () => {
        // Prepare
        const emptyItems: CartItem[] = [];

        // Action
        const result = toCreateOrderDto(emptyItems, MOCK_ADDRESS);

        // Verify
        expect(result.items).toHaveLength(0);
        expect(result.address).toEqual(MOCK_ADDRESS);
    });
});
