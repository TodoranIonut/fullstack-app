import { FormControl, FormGroup, Validators } from '@angular/forms';

export function createAddressForm(): FormGroup {
    return new FormGroup({
        streetAddress: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required]
        }),
        city: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required]
        }),
        county: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required]
        }),
        country: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required]
        })
    });
}
