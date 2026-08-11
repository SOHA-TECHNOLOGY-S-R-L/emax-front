import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, input, model, ViewChild } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { AngularMaterialModule } from '../angular-material.module';


@Component({
  selector: 'chips-autocomplete-resource',
  templateUrl: './chips-autocomplete-resource.html',
  styleUrl: './chips-autocomplete-resource.css',
  standalone: true,
  //changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AngularMaterialModule],

})
export class ChipsAutocompleteResource<T> {
  //@ContentChild(TemplateRef) optionTemplate!: TemplateRef<any>;
  @ViewChild('chipInput')
  chipInput?: ElementRef<HTMLInputElement>;

  placeholder = input('Buscar...');
  searchFn = input.required<(term: string) => Observable<T[]>>()
  displayWith = input.required<(item: T) => string>();
  getKey = input.required<(item: T) => number>();
  //chips = model<Map<number, string>>(new Map());
  chips = model<T[]>([]);
  control = new FormControl('', { nonNullable: true });

  filtro = toSignal(this.control.valueChanges, { initialValue: '' });
  filtroNormalizado = computed(() => this.filtro().trim().toLowerCase());

  readonly resource = rxResource({
    params: () => this.filtroNormalizado(),
    stream: ({ params }: { params: string }) =>
      this.searchFn()(params),
    defaultValue: [] as T[]
  });

  resultados = computed(() => this.resource.value());

  //chipsInArray = computed(() => Array.from(this.chips().entries()));
  chipsInArray = computed(() => this.chips());

  seleccionar(event: MatAutocompleteSelectedEvent) {

    const item = event.option.value as T;

    const existe = this.chips()
      .some(x =>
        this.getKey()(x) === this.getKey()(item)
      );

    if (!existe) {
      this.chips.update(actual => [
        ...actual,
        item
      ]);
    }

    this.control.reset('');

    if (this.chipInput) {
      this.chipInput.nativeElement.value = '';
    }

    event.option.deselect();
  }


  removeChip(item: T) {
    const id = this.getKey()(item);
    this.chips.update(ch =>
      ch.filter(x => this.getKey()(x) !== id)
    );
  }

  /*   findColorById(id: number) {
      const results = this.resource.value();
      if (!results) return null;
      const result = results.find((c) => c.id === id);
      return result ? result.nombre : 'Sin color';
    } */

  clear() {
    this.control.setValue('');
    this.control.markAsTouched();
    this.control.updateValueAndValidity();
    //this.resultados.set([]);

  }

}
