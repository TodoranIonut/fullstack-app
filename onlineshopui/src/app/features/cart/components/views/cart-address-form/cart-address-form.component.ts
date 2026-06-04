import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ErrorMessageComponent } from '../../../../../clib/components/error-message/error-message.component';

@Component({
    selector: 'app-cart-address-form',
    imports: [ReactiveFormsModule, ErrorMessageComponent],
    templateUrl: './cart-address-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartAddressFormComponent {
    form = input.required<FormGroup>();
}
