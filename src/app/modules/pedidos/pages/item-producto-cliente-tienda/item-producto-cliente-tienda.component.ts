import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map, Observable, switchMap } from 'rxjs';
import { Cliente } from '../../../../models/cliente';
import { ItemPedido } from '../../../../models/item-pedido';
import { Producto } from '../../../../models/producto';
import { TipoDocumento } from '../../../../models/tipo-documento';
import { TipoPedido } from '../../../../models/tipo-pedido';
import { AuthService } from '../../../../services/auth.service';
import { ClienteService } from '../../../../services/cliente.service';
import { PedidoService } from '../../../../services/pedido.service';
import { ProductoService } from '../../../../services/producto.service';
import { FormUtils } from '../../../../utils/form-utils';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { CarritoItemProductoComponent } from '../../components/carrito-item-producto/carrito-item-producto.component';
import { CustomizeItemProductoToClientComponent } from '../../components/customize-item-producto-to-client/customize-item-producto-to-client.component';
import { PedidoProveedorFinalizadoComponent } from './../../components/pedido-proveedor-finalizado/pedido-proveedor-finalizado.component';

@Component({
  selector: 'item-producto-cliente-tienda',
  templateUrl: './item-producto-cliente-tienda.component.html',
  styleUrl: './item-producto-cliente-tienda.component.css',
  standalone: true,
  imports: [PedidoProveedorFinalizadoComponent, CustomizeItemProductoToClientComponent, CarritoItemProductoComponent, CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule]

})
export class ItemProductoClienteTiendaComponent implements OnInit {

  //pedido: Pedido = new Pedido();
  //empaques: Empaque[] = [];
  cliente!: Cliente;
  autocompleteControl = new FormControl();
  tipoPedidoVentaClientes!: TipoPedido;
  tipoPedidos: TipoPedido[] = [];
  productosFiltrados!: Observable<Producto[]>;
  producto!: Producto;
  formUtils = FormUtils
  tipoDocumentos: TipoDocumento[] = [];
  items: ItemPedido[] = [];

  // razonSocialActivate:boolean=false;


  constructor(private clienteService: ClienteService,
    private pedidoService: PedidoService,
    private productoService: ProductoService,
    //private alertService: AlertService,
    //private genericosDeProductoService: GenericosDeProductoService,
    public authService: AuthService,
    //public matDialog: MatDialog,
    //private router: Router,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      let clienteId = +params.get('clienteId')!;
      this.clienteService.getCliente(clienteId).subscribe(cliente => {
        this.cliente = cliente
      }
      );
    });

    this.productosFiltrados = this.autocompleteControl.valueChanges
      .pipe(
        map(value => typeof value === 'string' ? value : value.nombre),
        switchMap(value => value ? this._filter(value) : [])
      );
    this.pedidoService.getAllTipoPedido().subscribe(result => {
      this.tipoPedidos = result
      this.tipoPedidos.forEach(r =>
        r.activo = r.id == 1 ? true : false
      )
      this.tipoPedidoVentaClientes = this.tipoPedidos[0];
    });

    this.clienteService.getTipoDocumento().subscribe(doc => {
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

  /*   seleccionarProducto(event: MatAutocompleteSelectedEvent): void {
      let producto = event.option.value as Producto;

      if (this.existeItem(producto.id)) {
        this.incrementaCantidad(producto.id);
      } else {
        let nuevoItem = new ItemPedido();
        nuevoItem.producto = producto;
        this.pedido.items.push(nuevoItem);
      }

      this.autocompleteControl.setValue('');
      event.option.focus();
      event.option.deselect();

    } */

  seleccionarProducto(event: MatAutocompleteSelectedEvent): void {
    this.producto = event.option.value as Producto;
    //this.productoService.setProductoToSeo(this.producto);
    console.log("this.producto2", this.producto);

    if (!this.tipoPedidoVentaClientes) {
      let nuevoItem = new ItemPedido();
      nuevoItem.producto = this.producto;
      this.items.push(nuevoItem);

      this.items = [...this.items, { ...nuevoItem }]

    }

    /*     if (this.existeItem(producto.id)) {
          this.incrementaCantidad(producto.id);
        } else {
          let nuevoItem = new ItemPedido();
          nuevoItem.producto = producto;
          this.pedido.items.push(nuevoItem);
        } */

    this.autocompleteControl.setValue('');
    event.option.focus();
    event.option.deselect();

  }

  /*   actualizarCantidad(id: number, event: any): void {
      let cantidad: number = event.target.value as number;
      if (cantidad == 0) {
        return this.eliminarItemPedido(id);
      }

      this.pedido.items = this.pedido.items.map((item: ItemPedido) => {
        if (id === item.producto.id) {
          item.cantidad = cantidad;
        }
        return item;
      });
    } */

  /*   calcularGranTotal(id: number, event: any): void {
      let importe: number = event.target.value as number;
      this.pedido.items = this.pedido.items.map((item: ItemPedido) => {
        if (id === item.producto.id) {
          item.importe = importe;
        }
        return item;
      });

      this.pedido.precioNetoTotal = 0;
      this.pedido.costoNetoTotal = 0;
      this.pedido.items.forEach((item: ItemPedido) => {
        if (this.tipoPedidoVentaClientes.activo) {
          this.pedido.precioNetoTotal += parseFloat(item.importe.toString());
        } else {
          this.pedido.costoNetoTotal += parseFloat(item.importe.toString());
        }
      });
    } */

  /*   existeItem(id: number): boolean {
      let existe = false;
      this.pedido.items.forEach((item: ItemPedido) => {
        if (id === item.producto.id) {
          existe = true;
        }
      });
      return existe;
    } */

  /*   incrementaCantidad(id: number): void {
      this.pedido.items = this.pedido.items.map((item: ItemPedido) => {
        if (id === item.producto.id) {
          ++item.cantidad;
        }
        return item;
      });
    } */
  /*
    eliminarItemPedido(id: number): void {
      console.log("Eliminar producot ...." + id);
      this.pedido.items = this.pedido.items.filter((item: ItemPedido) => id !== item.producto.id);
    } */

  /*   openDialog(itemPedido: ItemPedido) {
      const dialogRef = this.matDialog.open(DetalleItemPedidoComponent, {
        data: itemPedido.descripcion,
        width: '550px',
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        itemPedido.descripcion = result
        console.log('Item Pedido: ', itemPedido);
      });
    } */

  /*   create(pedidoForm: any): void {
      if (this.pedido.items.length == 0) {
        this.autocompleteControl.setErrors({ 'invalid': true });
      }

      if (pedidoForm.form.valid && this.pedido.items.length > 0) {
        this.cliente.pedidos = [];
        this.pedido.cliente = { ...this.cliente }
        this.pedido.tipoPedido = this.tipoPedidoVentaClientes
        console.log(JSON.stringify(this.pedido));

        this.pedidoService.create(this.pedido).subscribe(p => {
          this.pedidoService.setPedido(p);
          this.router.navigate(['/movimientos']);
        });
      }
    } */

}
