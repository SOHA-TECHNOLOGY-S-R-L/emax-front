import { ProductoService } from './../../../../services/producto.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { concatMap, Subscription } from 'rxjs';
import { ItemPedido } from '../../../../models/item-pedido';
import { AuthService } from '../../../../services/auth.service';
import { PersonaService } from '../../../../services/persona.service';
import { ItemService } from '../../../../services/item.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { PrimeNgModule } from '../../../compartido/prime-ng.module';
import { StringToTitleWithAccents } from '../../../../pipes/StringToTitleWithAccents.pipe';
import { environment } from '../../../../../environments/environment';
import { MediosUtilsService } from '../../../../services/medios-utils.service';
import { AlertService } from '../../../../services/alert.service';


@Component({
  selector: 'carrito-item-producto',
  templateUrl: './carrito-item-producto.component.html',
  styleUrl: './carrito-item-producto.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, PrimeNgModule, StringToTitleWithAccents]

})
export class CarritoItemProductoComponent implements OnInit, OnDestroy {
  router = inject(Router);
  public authService = inject(AuthService);
  itemService = inject(ItemService)
  productoService = inject(ProductoService)
  personaService = inject(PersonaService);
  usuarioService = inject(UsuarioService);
  mediosUtilsService = inject(MediosUtilsService);
  alertService = inject(AlertService);

  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;


  itemServiceSuscription$!: Subscription;
  lstItemPedido: ItemPedido[] = [];
  //@Input() tipoPedido!: string;
  @Input() personaId!: number;
  item!: ItemPedido;
  total: number = 0;
  @Output() modalEmitter = new EventEmitter<void>();


  constructor(
    public matDialog: MatDialog,
  ) {
    this.itemServiceSuscription$ = this.itemService.getItems().subscribe({
      next: items => {
        //this.lstItemPedido = items;
        this.lstItemPedido = this.itemService.importePorMargenCantidad(items);
        this.calcularTotal();
      },
      error: error => {
        console.error('Error al obtener el item:', error);
      }
    })
  }

  ngOnInit(): void {
    //console.log("CarritoComprasComponent.ngOnInit", this.lstItemPedido);
    //if (this.lstItemPedido.length === 0) {
    //  this.lstItemPedido = this.itemService.importePorMargenCantidad(this.itemService.getLocalStorageItems());
    this.calcularTotal();

  }

  actualizarCantidad(productoId: number, event: any): void {
    const cantidad: number = parseInt(event.target.value);
    this.lstItemPedido = this.itemService.UpdateAmountItemFromItems(this.lstItemPedido, productoId, cantidad);
    this.itemService.setItems(this.lstItemPedido);
    //this.itemService.saveLocalStorageItems(this.lstItemPedido);
  }

  eliminarItemPedido(item: ItemPedido): void {
    this.productoService.getProductoByImage(item.imagen).subscribe(
      prod => { console.log("Producto encontrado", prod) },
      err => { //Producto no encontrado
        console.log("Producto no encontrado ...", err);
        if (err.status === 404) {
          this.mediosUtilsService.eliminarImagen(item.imagen).subscribe(resp => {
            console.log("Eliminado correctamente:", resp);
          });
        }
      }
    );
    this.lstItemPedido = this.itemService.deleteItemFromItems(this.lstItemPedido, item.producto.id);
    this.itemService.setItems(this.lstItemPedido);
    //this.itemService.saveLocalStorageItems(this.lstItemPedido);
  }

  calcularTotal() {
    this.total = this.itemService.calculateTotalFromItems(this.lstItemPedido)
  }


  irRealizarPedido() {
    if (this.authService.isAuthenticated()) {
      if (this.personaId == 0) {
        this.usuarioService.getUsuarioByUsername(this.authService.usuario.username)
          .subscribe(usr => {
            this.personaService.getPersonaByUsuarioId(usr.id).subscribe(cli => {
              this.router.navigate(['/tienda/pedido-persona-online-finalizado', cli.id])
            })
          });
      } else {
        this.router.navigate(['/pedidos/pedido-persona-tienda-finalizado', this.personaId])
      }
    }
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  closeModal() {
    this.modalEmitter.emit();
  }

  ngOnDestroy(): void {
    this.itemServiceSuscription$.unsubscribe();
  }

}
