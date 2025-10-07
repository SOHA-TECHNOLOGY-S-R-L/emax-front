import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { COLOR_ESTADO_PRODUCTO } from '../../../../constants/color-estado-producto';
import { SERVICIO_DISENIO, SERVICIO_SUBLIMACION } from '../../../../constants/constantes';
import { ItemPedido } from '../../../../models/item-pedido';
import { Producto } from '../../../../models/producto';
import { AuthService } from '../../../../services/auth.service';
import { ItemService } from '../../../../services/item.service';
import { MediosUtilsService } from '../../../../services/medios-utils.service';
import { ProductoService } from '../../../../services/producto.service';
import { ChatUtils } from '../../../../utils/chat-utils';
import { FormUtils } from '../../../../utils/form-utils';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';

@Component({
  selector: 'customize-item-producto-to-client',
  templateUrl: './customize-item-producto-to-client.component.html',
  styleUrl: './customize-item-producto-to-client.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule]

})
export class CustomizeItemProductoToClientComponent implements OnInit, OnChanges {
  public mediosUtilsService = inject(MediosUtilsService);
  private formBuilder = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private itemService = inject(ItemService);
  private activatedRoute = inject(ActivatedRoute);
  public authService = inject(AuthService);

  @Input() producto!: Producto;

  itemServiceSuscription$!: Subscription;
  formUtils = FormUtils;
  chatUtils = ChatUtils;
  verImagenProducto!: string;
  verImagenItem!: string;
  servicioDisenio!: Producto;
  servicioSublimacion!: Producto;

  item = new ItemPedido()
  items: ItemPedido[] = [];
  gruposDe!: number;
  minCantidadPedido!: number;
  maxCantidadPedido!: number;
  isDisenio: boolean = false;
  frm = this.formBuilder.group({
    descripcion: [''],
    cantidad: [0],
    disenio: [false]
  })
  constructor() {
    this.itemServiceSuscription$ = this.itemService.getItems().subscribe({
      next: items => {
        this.items = items;
      },
      error: error => {
        console.error('Error al obtener el item:', error);
      }
    })
  }

  ngOnInit(): void {
    /*     if (this.items.length === 0) {
          this.items = this.itemService.getLocalStorageItems()
        } */

    this.productoService.getProductoByCod(SERVICIO_DISENIO).subscribe(prd => {
      this.servicioDisenio = prd;
    });

    this.productoService.getProductoByCod(SERVICIO_SUBLIMACION).subscribe(prd => {
      this.servicioSublimacion = prd;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['producto'].currentValue != changes['producto'].previousValue) {
      this.producto.estadoProducto.color = COLOR_ESTADO_PRODUCTO[('' + this.producto.estadoProducto.id) as keyof typeof COLOR_ESTADO_PRODUCTO];
      this.gruposDe = this.producto.gruposDe
      this.minCantidadPedido = this.producto.minCantidadPedido
      this.maxCantidadPedido = this.producto.maxCantidadPedido
      this.verImagenProducto = environment.API_URL_VER_IMAGEN + this.producto.imagen;
      this.frm.get('cantidad')?.setValue(this.minCantidadPedido);
      this.verImagenItem = environment.API_URL_VER_IMAGEN + this.item.imagen;
      console.log("this.verImagenItem", this.verImagenItem);
    }
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }


  isImage(fileInput: HTMLInputElement): boolean {
    return this.mediosUtilsService.isImage(fileInput);
  }

  subirImagen(fileInput: HTMLInputElement) {
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      const imagen: File = fileInput.files[0];
      this.mediosUtilsService.subirImagen(imagen, true).subscribe(resp => {
        //this.mediosUtilsService.imageToBase64(imagen);
        this.verImagenItem = environment.API_URL_VER_IMAGEN + resp.imagen;
        this.item.imagen = resp.imagen;
        // this.mediosUtilsService.imagenSeleccionada = null;  Limpiar la imagen seleccionada
      })
    }
  }

  addOneItemServicioDisenio(event: any) {
    this.isDisenio = event.target.checked;
    if (this.isDisenio) {
      this.item.cantidad = this.servicioDisenio.minCantidadPedido;
      this.item.descripcion = this.servicioDisenio.descripcion;
      this.item.producto = { ...this.servicioDisenio };
      this.item.imagenUri = environment.API_URL_VER_IMAGEN + this.item.imagen

      if (!this.itemService.existItemInItems(this.items, this.item.producto.id)
        && this.item.cantidad <= this.item.producto.maxCantidadPedido) {
        this.items = [...this.items, { ...this.item }];
        this.itemService.setItems(this.items);
        //this.itemService.saveLocalStorageItems(this.items);
      }
    } else {
      this.deleteItem(this.items, this.item.producto.id);

    }
  }

  addOneItemServicioSublimacion(event: any) {
    this.isDisenio = event.target.checked;
    console.log(this.servicioSublimacion);

    if (this.isDisenio) {
      this.item.cantidad = this.servicioSublimacion.minCantidadPedido;
      this.item.descripcion = this.servicioSublimacion.descripcion;
      this.item.producto = { ...this.servicioSublimacion };
      this.item.imagenUri = environment.API_URL_VER_IMAGEN + this.item.imagen

      if (!this.itemService.existItemInItems(this.items, this.item.producto.id)
        && this.item.cantidad <= this.item.producto.maxCantidadPedido) {
        this.items = [...this.items, { ...this.item }];
        this.itemService.setItems(this.items);
        //this.itemService.saveLocalStorageItems(this.items);
      }
    } else {
      this.deleteItem(this.items, this.item.producto.id);
    }
  }

  deleteItem(items: ItemPedido[], productoId: number) {
    this.items = this.itemService.deleteItemFromItems(items, productoId);
    this.itemService.setItems(items);
    //this.itemService.saveLocalStorageItems(items);
  }

  addItem(items: ItemPedido[], item: ItemPedido) {
    this.items = [...items, { ...item }];
    this.itemService.setItems(items);
    //this.itemService.saveLocalStorageItems(items);
  }

  sendOneItemProducto() {
    this.item.cantidad = (this.frm.get('cantidad')?.value ? this.frm.get('cantidad')?.value : 0)!;
    this.item.descripcion = (this.frm.get('descripcion')?.value ? this.frm.get('descripcion')?.value : '')!;
    this.item.producto = { ...this.producto };
    this.item.imagenUri = environment.API_URL_VER_IMAGEN + this.item.imagen
    if (this.itemService.existItemInItems(this.items, this.item.producto.id)) {
      this.items = this.itemService.UpdateAmountItemFromExterno(this.items, this.item.producto.id, this.item.cantidad);
      this.itemService.setItems(this.items);
      //this.itemService.saveLocalStorageItems(this.items);
    }
    else if (this.item.cantidad <= this.item.producto.maxCantidadPedido) {
      this.items = [...this.items, { ...this.item }];
      this.addItem(this.items, this.item);
    }
  }

  chatear(producto: Producto) {
    this.chatUtils.infoProduct(producto);
  }

  ngOnDestroy(): void {
    if (this.itemServiceSuscription$) {
      this.itemServiceSuscription$.unsubscribe();
    }
  }


}
