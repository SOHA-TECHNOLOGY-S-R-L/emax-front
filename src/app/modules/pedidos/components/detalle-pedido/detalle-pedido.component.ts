import { ComprobantePdfRequest } from './../../../../interfaces/comprobante-pdf-request';
import { TipoDocumentoIdentidadEnum, TipoDocumentoIdentidadEtiquetas } from './../../../../enums/tipo-documento-identidad.enum';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { TipoPedidoEnum } from '../../../../enums/tipo-pedido.enum';
import { ItemPedido } from '../../../../models/item-pedido';
import { Pedido } from '../../../../models/pedido';
import { Persona } from '../../../../models/persona';
import { ProductoService } from '../../../../services/producto.service';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { ColorDetails } from './../../../../enums/color.enum';
import { EstadoPedidoEnum, EstadoPedidoEtiquetas } from '../../../../enums/estado-pedido.enum';
import { construirPedidoRequest } from '../../../../utils/build-pedido';
import { PedidoService } from '../../../../services/pedido.service';
import * as fileSaver from 'file-saver-es';
import { ComprobanteSunat } from '../../../../interfaces/comprobante-sunat';
import { LauncherSfsService } from '../../../../services/launcher-sfs.service';
import { FormatoImpresionEnum } from '../../../../enums/formato-impresion.enum';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-detalle-pedido',
  templateUrl: './detalle-pedido.component.html',
  styleUrl: './detalle-pedido.component.css',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AngularMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTooltipModule
  ],
})
export class DetallePedidoComponent {

  private pedidoService = inject(PedidoService);
  private productoService = inject(ProductoService);
  private launcherSfsService = inject(LauncherSfsService);
  inPedido = input.required<Pedido>();

  persona = computed<Persona>(() => {
    return this.inPedido().persona!;
  })

  titulo: string = 'Pedido de venta';
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;
  //estadoPedidoEnum = EstadoPedidoEnum;

  materialesResource = rxResource({
    stream: () => this.productoService.getMaterialesProducto(),
  });


  items = computed<ItemPedido[]>(() => {
    const items = this.inPedido().items as ItemPedido[];
    if (!items) { return [] };

    return items.map((item) => {
      const mp = item.producto.multimediasAsignada;

      if (!mp) {
        return { ...item, imagenShow: 'no-imagen.png' };
      }

      const primerElemento = mp.find((mp) =>
        mp.multimedia.mimeType.startsWith('image'),
      );

      const imagenShow = primerElemento
        ? this.API_URL_VER_IMAGEN + primerElemento.multimedia.nombre
        : 'no-imagen.png';

      return { ...item, imagenShow };
    });
  });


  comprobantes = computed<string[]>(() => {
    const comprobantes = this.inPedido().comprobantesSunat as ComprobanteSunat[];
    if (!comprobantes) { return []; }

    return comprobantes.map((com) => {
      return `${com.vendedorEnCaja}-${com.tipoDocumentoSunat}-${com.serie}-${com.numero}`;
    })
    //.join(', ');
  });

  readonly TipoPedidoEnum = TipoPedidoEnum;

  colorDetails = ColorDetails
  estadoPedidoEtiquetas = EstadoPedidoEtiquetas;

  tipoDocumentoIdentidadEtiquetas = TipoDocumentoIdentidadEtiquetas;



  constructor() { }

  /*   findColorById(colorId: number) {
      const colores = this.coloresResource.value();
      if (!colores) return null;
      const color = colores.find((c) => c.id === colorId);
      return color ? color.nombre : 'Sin color';
    } */

  descargarPedido() {
    this.pedidoService.downloadOrderToPersonaInPDF(construirPedidoRequest(this.inPedido()))
      .subscribe(p => {
        fileSaver.saveAs(p.body!, this.pedidoService.filenameFromHeader(p.headers));
        //this.itemService.setItems([]);
      });
  }

  descargarComprobante(nombreComprobante: string) {
    const request: ComprobantePdfRequest = {
      identificadorComprobante: nombreComprobante,
      formatoImpresion: FormatoImpresionEnum.TICKET
    }
    this.launcherSfsService.previewComprobanteToPersonaInPDF(request)
      .subscribe(p => {
        fileSaver.saveAs(p.body!, this.pedidoService.filenameFromHeader(p.headers));
        //this.itemService.setItems([]);
      });
  }


  findMaterialById(materialId: number) {
    const materiales = this.materialesResource.value();
    if (!materiales) return null;
    const material = materiales.find((m) => m.id === materialId);
    return material ? material.nombre : 'Sin material';
  }
}
