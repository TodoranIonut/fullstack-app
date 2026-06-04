import { Component, input, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { EMPTY, merge, switchMap } from 'rxjs';
import {
    ValidationMessages,
    ValidationMessagesMap
} from '../../../core/types/providers/validation-messages';

@Component({
    selector: 'app-error-message',
    standalone: true,
    template: `
        @if (errorMessage()) {
            <p class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ errorMessage() }}
            </p>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorMessageComponent {
    control = input.required<AbstractControl | null>();

    private readonly validationMessages = inject<ValidationMessagesMap>(ValidationMessages);

    // Creates a reactive dependency on status/value changes so computed() re-evaluates
    // when markAllAsTouched() or user input mutates the control state.
    private readonly _controlState = toSignal(
        toObservable(this.control).pipe(
            switchMap(ctrl => (ctrl ? merge(ctrl.statusChanges, ctrl.valueChanges) : EMPTY))
        )
    );

    errorMessage = computed(() => {
        this._controlState(); // reactive dependency on control state changes
        const ctrl = this.control();
        if (!ctrl?.errors || !ctrl.touched) {
            return null;
        }

        const errorKeys = Object.keys(ctrl.errors);
        if (errorKeys.length === 0) {
            return null;
        }

        const firstErrorKey = errorKeys[0];
        const messageFunction = this.validationMessages[firstErrorKey];

        if (!messageFunction) {
            return `Validation error: ${firstErrorKey}`;
        }

        return messageFunction(ctrl.errors[firstErrorKey]);
    });
}
