import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Persona } from '../../../models/persona';
import { PersonaService } from '../../../services/persona.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'autocomplete-persona',
  templateUrl: './autocomplete-persona.component.html',
  styleUrl: './autocomplete-persona.component.css',
  standalone:true,
  imports: [CommonModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule]
})
export class AutocompletePersonaComponent implements OnInit {

  autocompleteControl = new FormControl();
  filteredOptions!: Observable<Persona[]>;


  constructor(private personaService: PersonaService) {

  }

  ngOnInit() {
    this.filteredOptions = this.autocompleteControl.valueChanges
      .pipe(
        map(value => typeof value === 'string' ? value : value.apellNomRz),
        switchMap(value => value? this._filter(value):[])
      );
  }

  private _filter(value: string): Observable<Persona[]> {
    const filterValue = value.toLowerCase();
    return this.personaService.filtrarPersonas(filterValue);
  }

  mostrarApellidoPersona(persona: Persona): string {
    return persona && persona.nomApellRz ? persona.nomApellRz : '';
  }

   seleccionarProducto(event: MatAutocompleteSelectedEvent): void {
    let persona = event.option.value as Persona;
    console.log(persona);
/*      if (this.existeItem(producto.id)) {
      this.incrementaCantidad(producto.id);
    } else {
      let nuevoItem = new ItemPedido();
      nuevoItem.producto = producto;
      this.pedido.items.push(nuevoItem);
    }

    this.autocompleteControl.setValue('');
    event.option.focus();
    event.option.deselect(); */

  }

}
