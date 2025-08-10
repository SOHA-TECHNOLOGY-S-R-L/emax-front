import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Cliente } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'autocomplete-cliente',
  templateUrl: './autocomplete-cliente.component.html',
  styleUrl: './autocomplete-cliente.component.css',
  standalone:true,
  imports: [CommonModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule]
})
export class AutocompleteClienteComponent implements OnInit {

  autocompleteControl = new FormControl();
  filteredOptions!: Observable<Cliente[]>;


  constructor(private clienteService: ClienteService) {

  }

  ngOnInit() {
    this.filteredOptions = this.autocompleteControl.valueChanges
      .pipe(
        map(value => typeof value === 'string' ? value : value.apellNomRz),
        switchMap(value => value? this._filter(value):[])
      );
  }

  private _filter(value: string): Observable<Cliente[]> {
    const filterValue = value.toLowerCase();
    return this.clienteService.filtrarClientes(filterValue);
  }

  mostrarApellidoCliente(cliente: Cliente): string {
    return cliente && cliente.nomApellRz ? cliente.nomApellRz : '';
  }

   seleccionarProducto(event: MatAutocompleteSelectedEvent): void {
    let cliente = event.option.value as Cliente;
    console.log(cliente);
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
