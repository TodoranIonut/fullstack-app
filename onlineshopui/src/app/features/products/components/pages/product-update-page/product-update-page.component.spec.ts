import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { signal } from '@angular/core';
import { ProductUpdatePageComponent } from './product-update-page.component';
import { ProductService } from '../../../services/product.service';
import { SupplierService } from '../../../services/supplier.service';
import { NotificationsService } from '../../../../../core/services/notifications.service';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../../../../../core/mocks/data/products.mock';
import { MOCK_SUPPLIERS } from '../../../../../core/mocks/data/suppliers.mock';
import { AppNavRoutes } from '../../../../../core/config/constants/navigation.constants';
import { ValidationMessages } from '../../../../../core/types/providers/validation-messages';
import { DefaultValidationMessages } from '../../../../../core/config/constants/validation.constants';

describe('ProductUpdatePageComponent', () => {
    let component: ProductUpdatePageComponent;
    let fixture: ComponentFixture<ProductUpdatePageComponent>;
    let productServiceMock: {
        selectedProduct: ReturnType<typeof signal>;
        categories: ReturnType<typeof signal>;
        loading: ReturnType<typeof signal>;
        error: ReturnType<typeof signal>;
        loadById: ReturnType<typeof vi.fn>;
        loadCategories: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
    };
    let supplierServiceMock: {
        suppliers: ReturnType<typeof signal>;
        loadSuppliers: ReturnType<typeof vi.fn>;
    };
    let routerMock: {
        navigate: ReturnType<typeof vi.fn>;
    };
    let activatedRouteMock: {
        snapshot: {
            paramMap: ReturnType<typeof convertToParamMap>;
        };
    };
    let notificationsServiceMock: {
        notifySuccess: ReturnType<typeof vi.fn>;
        notifyError: ReturnType<typeof vi.fn>;
    };
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        productServiceMock = {
            selectedProduct: signal(MOCK_PRODUCTS[0]),
            categories: signal([...MOCK_CATEGORIES]),
            loading: signal(false),
            error: signal(null),
            loadById: vi.fn().mockReturnValue(of(MOCK_PRODUCTS[0])),
            loadCategories: vi.fn().mockReturnValue(of(MOCK_CATEGORIES)),
            update: vi.fn().mockReturnValue(of(MOCK_PRODUCTS[0]))
        };

        supplierServiceMock = {
            suppliers: signal([...MOCK_SUPPLIERS]),
            loadSuppliers: vi.fn().mockReturnValue(of(MOCK_SUPPLIERS))
        };

        routerMock = {
            navigate: vi.fn()
        };

        activatedRouteMock = {
            snapshot: {
                paramMap: convertToParamMap({ id: 'prod-1' })
            }
        };

        notificationsServiceMock = {
            notifySuccess: vi.fn(),
            notifyError: vi.fn()
        };

        TestBed.configureTestingModule({
            imports: [ProductUpdatePageComponent],
            providers: [
                { provide: ProductService, useValue: productServiceMock },
                { provide: SupplierService, useValue: supplierServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: activatedRouteMock },
                { provide: NotificationsService, useValue: notificationsServiceMock },
                { provide: ValidationMessages, useValue: DefaultValidationMessages }
            ]
        });

        fixture = TestBed.createComponent(ProductUpdatePageComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should load product and categories on init', () => {
            component.ngOnInit();

            expect(productServiceMock.loadById).toHaveBeenCalledWith('prod-1');
            expect(productServiceMock.loadCategories).toHaveBeenCalled();
        });

        it('should load suppliers on init', () => {
            component.ngOnInit();

            expect(supplierServiceMock.loadSuppliers).toHaveBeenCalled();
        });

        it('should navigate to products overview when no id provided', () => {
            activatedRouteMock.snapshot.paramMap = convertToParamMap({});

            component.ngOnInit();

            expect(routerMock.navigate).toHaveBeenCalledWith([
                `/${AppNavRoutes.Products.root}/${AppNavRoutes.Products.features.overview}`
            ]);
        });

        it('should populate form with product data', () => {
            fixture.detectChanges();

            expect(component.form.value).toEqual({
                name: MOCK_PRODUCTS[0].name,
                description: MOCK_PRODUCTS[0].description,
                price: MOCK_PRODUCTS[0].price,
                weight: MOCK_PRODUCTS[0].weight,
                imageUrl: MOCK_PRODUCTS[0].imageUrl,
                categoryId: MOCK_PRODUCTS[0].category.id,
                supplierId: MOCK_PRODUCTS[0].supplier?.id ?? ''
            });
        });
    });

    describe('onSubmit()', () => {
        beforeEach(() => {
            component.ngOnInit();
            fixture.detectChanges();
        });

        it('should not submit when form is invalid', () => {
            component.form.patchValue({ name: '' });

            component.onSubmit();

            expect(productServiceMock.update).not.toHaveBeenCalled();
            expect(component.form.touched).toBe(true);
        });

        it('should update product and navigate on success', () => {
            component.form.patchValue({
                name: 'Updated Product',
                price: 199.99
            });

            component.onSubmit();

            expect(productServiceMock.update).toHaveBeenCalledWith('prod-1', {
                name: 'Updated Product',
                description: MOCK_PRODUCTS[0].description,
                price: 199.99,
                weight: MOCK_PRODUCTS[0].weight,
                imageUrl: MOCK_PRODUCTS[0].imageUrl,
                categoryId: MOCK_PRODUCTS[0].category.id,
                supplierId: MOCK_PRODUCTS[0].supplier?.id ?? ''
            });
            expect(notificationsServiceMock.notifySuccess).toHaveBeenCalledWith({
                title: 'Product updated',
                message: 'Changes have been saved.'
            });
            expect(routerMock.navigate).toHaveBeenCalledWith([
                `/${AppNavRoutes.Products.root}/${AppNavRoutes.Products.features.overview}`
            ]);
        });

        it('should not submit when no product id', () => {
            activatedRouteMock.snapshot.paramMap = convertToParamMap({});

            const newFixture = TestBed.createComponent(ProductUpdatePageComponent);
            const newComponent = newFixture.componentInstance;
            newComponent.ngOnInit();
            productServiceMock.update.mockClear();

            newComponent.onSubmit();

            expect(productServiceMock.update).not.toHaveBeenCalled();
        });

        it('should handle update failure', () => {
            productServiceMock.update.mockReturnValue(throwError(() => new Error('Failed')));

            component.onSubmit();

            expect(notificationsServiceMock.notifyError).toHaveBeenCalledWith({
                title: 'Update failed',
                message: 'Unable to save changes.'
            });
            expect(routerMock.navigate).not.toHaveBeenCalled();
        });

        it('should disable form while submitting', () => {
            expect(component.form.enabled).toBe(true);

            component.isSubmitting.set(true);
            fixture.detectChanges();

            expect(component.form.disabled).toBe(true);
        });
    });

    describe('onCancel()', () => {
        it('should navigate to products overview', () => {
            component.onCancel();

            expect(routerMock.navigate).toHaveBeenCalledWith([
                `/${AppNavRoutes.Products.root}/${AppNavRoutes.Products.features.overview}`
            ]);
        });
    });

    describe('retry()', () => {
        it('should reload product and categories', () => {
            component.ngOnInit();
            productServiceMock.loadById.mockClear();
            productServiceMock.loadCategories.mockClear();
            supplierServiceMock.loadSuppliers.mockClear();

            component.retry();

            expect(productServiceMock.loadById).toHaveBeenCalledWith('prod-1');
            expect(productServiceMock.loadCategories).toHaveBeenCalled();
            expect(supplierServiceMock.loadSuppliers).toHaveBeenCalled();
        });

        it('should not reload when no product id', () => {
            activatedRouteMock.snapshot.paramMap = convertToParamMap({});
            component.ngOnInit();
            productServiceMock.loadById.mockClear();
            productServiceMock.loadCategories.mockClear();
            supplierServiceMock.loadSuppliers.mockClear();

            component.retry();

            expect(productServiceMock.loadById).not.toHaveBeenCalled();
            expect(productServiceMock.loadCategories).not.toHaveBeenCalled();
            expect(supplierServiceMock.loadSuppliers).not.toHaveBeenCalled();
        });
    });
});
