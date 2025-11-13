import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map, Observable, switchMap } from 'rxjs';
import { ItemPedido } from '../../../../models/item-pedido';
import { Persona } from '../../../../models/persona';
import { Producto } from '../../../../models/producto';
import { TipoDocumento } from '../../../../models/tipo-documento';
import { AuthService } from '../../../../services/auth.service';
import { PedidoService } from '../../../../services/pedido.service';
import { PersonaService } from '../../../../services/persona.service';
import { ProductoService } from '../../../../services/producto.service';
import { FormUtils } from '../../../../utils/form-utils';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { CarritoItemProductoComponent } from '../../components/carrito-item-producto/carrito-item-producto.component';
import { CustomizeItemProductoToClientComponent } from '../../components/customize-item-producto-to-client/customize-item-producto-to-client.component';

@Component({
  selector: 'item-producto-persona-tienda',
  templateUrl: './item-producto-persona-tienda.component.html',
  styleUrl: './item-producto-persona-tienda.component.css',
  standalone: true,
  imports: [CustomizeItemProductoToClientComponent, CarritoItemProductoComponent, CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule]

})
export class ItemProductoPersonaTiendaComponent implements OnInit {

  persona!: Persona;
  autocompleteControl = new FormControl();
  //tipoPedidoVentaPersonas!: TipoPedido;
  //tipoPedidos: TipoPedido[] = [];
  productosFiltrados!: Observable<Producto[]>;
  producto!: Producto;
  formUtils = FormUtils
  tipoDocumentos: TipoDocumento[] = [];
  items: ItemPedido[] = [];

  constructor(private personaService: PersonaService,
    private pedidoService: PedidoService,
    private productoService: ProductoService,
    public authService: AuthService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      let personaId = +params.get('personaId')!;
      this.personaService.getPersona(personaId).subscribe(persona => {
        this.persona = persona
      }
      );
    });

    this.productosFiltrados = this.autocompleteControl.valueChanges
      .pipe(
        map(value => typeof value === 'string' ? value : value.nombre),
        switchMap(value => value ? this._filter(value) : [])
      );

/*     this.pedidoService.getAllTipoPedido().subscribe(result => {
      this.tipoPedidos = result
      this.tipoPedidos.forEach(r =>
        r.activo = r.id == 1 ? true : false
      )
      this.tipoPedidoVentaPersonas = this.tipoPedidos[0];
    }); */

    this.personaService.getTipoDocumento().subscribe(doc => {
      this.tipoDocumentos = doc
    });
    //console.log("this.producto", this.producto.id);
  }

  private _filter(value: string): Observable<Producto[]> {
    const filterValue = value.toLowerCase();

    return this.productoService.filtrarProductos(filterValue);
  }

  mostrarNombre(producto: Producto): string {
    return producto ? producto.nombre : '';

  }

  seleccionarProducto(event: MatAutocompleteSelectedEvent): void {
    this.producto = event.option.value as Producto;
    //this.productoService.setProductoToSeo(this.producto);
    console.log("this.producto2", this.producto);

    //if (!this.tipoPedidoVentaPersonas) {
      let nuevoItem = new ItemPedido();
      nuevoItem.producto = this.producto;
      this.items.push(nuevoItem);

      this.items = [...this.items, { ...nuevoItem }]

    //}

    this.autocompleteControl.setValue('');
    event.option.focus();
    event.option.deselect();

  }

}
