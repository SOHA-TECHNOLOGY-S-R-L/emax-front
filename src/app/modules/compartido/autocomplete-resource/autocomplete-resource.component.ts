import { CommonModule } from '@angular/common';
import { Component, computed, ContentChild, EventEmitter, Input, OnInit, Output, Signal, TemplateRef } from '@angular/core';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Persona } from '../../../models/persona';
import { PersonaService } from '../../../services/persona.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { AngularMaterialModule } from '../angular-material.module';

@Component({
  selector: 'autocomplete-resource',
  templateUrl: './autocomplete-resource.component.html',
  styleUrl: './autocomplete-resource.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AngularMaterialModule]
})
export class AutocompleteResourceComponent<T> {
  @ContentChild(TemplateRef) optionTemplate!: TemplateRef<any>;

  @Input() placeholder = 'Buscar...';

  @Input({ required: true })
  searchFn!: (term: string) => Observable<T[]>;

  @Input({ required: true })
  displayWith!: (item: T) => string;

  @Output() selected = new EventEmitter<T>();

  control = new FormControl('');
  filtro = toSignal(this.control.valueChanges, { initialValue: '' });

  filtroNormalizado: Signal<string> = computed(() => {
    const value = this.filtro();
    return typeof value === 'string'
      ? value.toLowerCase()
      : this.displayWith(value as T)?.toLowerCase() ?? '';
  });

  readonly resource = rxResource<T[], string>({
    params: () => this.filtroNormalizado(),
    stream: ({ params }) =>
      this.searchFn(params),
    defaultValue: []
  });

  resultados = computed(() => this.resource.value());

  seleccionar(event: MatAutocompleteSelectedEvent) {
    const item = event.option.value as T;
    this.selected.emit(item);
    this.control.setValue('');
  }

  clear() {
    this.control.setValue('');
    this.control.markAsTouched();
    this.control.updateValueAndValidity();
    //this.resultados.set([]);

  }
}
