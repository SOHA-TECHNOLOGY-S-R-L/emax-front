import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import * as fileSaver from 'file-saver-es';
import { find } from 'lodash-es';
import { concatMap } from 'rxjs';
import { ESTADO_CAJA_USUARIO } from '../../../../constants/caja-usuario.constants';
import { CajaUsuario } from '../../../../models/caja-usuario';
import { Movimiento } from '../../../../models/movimiento';
import { Pedido } from '../../../../models/pedido';
import { TipoMovimientoPedido } from '../../../../models/tipo-movimiento-pedido';
import { TipoPago } from '../../../../models/tipo-pago';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';
import { CajaService } from '../../../../services/caja.service';
import { MovimientoService } from '../../../../services/movimiento.service';
import { PedidoService } from '../../../../services/pedido.service';
import { InfoCajaUsuarioComponent } from '../../../caja/components/info-caja-usuario/info-caja-usuario.component';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { SearchBoxTableComponent } from '../../../compartido/search-box-table/search-box-table.component';
import { UsuarioService } from '../../../../services/usuario.service';


@Component({
  selector: 'app-movimiento',
  templateUrl: './movimiento.component.html',
  styleUrl: './movimiento.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, AngularMaterialModule, FormsModule, ReactiveFormsModule, InfoCajaUsuarioComponent]
})
export class MovimientoComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private pedidoService = inject(PedidoService);

  titulo: string = '';
  movimiento = new Movimiento();
  cajaUsuario = new CajaUsuario();
  pedido!: Pedido;
  tipoPagos: TipoPago[] = [];
  tipoMovimientosPedidoLst: TipoMovimientoPedido[] = [];
  tipoMovPedidoIngresos: TipoMovimientoPedido[] = [];
  tipoMovPedidoEgresos: TipoMovimientoPedido[] = [];
  iMovimiento: string = "I";
  pedidoIdSearch: string = '';
  isFromPedidos: boolean = false;

  @ViewChild("searchPedidoText") searchText!: ElementRef;



  constructor(private cajasService: CajaService,
    private movimientoService: MovimientoService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private alertService: AlertService,
    private router: Router
  ) {

  }
  ngOnInit(): void {

    this.activatedRoute.paramMap.subscribe(params => {
      this.pedidoIdSearch = params.get('pedidoId')!;
      if (this.pedidoIdSearch != null) {
        this.isFromPedidos = true;
      }
    });
    this.movimientoService.getAllTipoPagos().subscribe(response => this.tipoPagos = response);
    this.getCajaUsuario();
  }

  getCajaUsuario(): void {
    if (this.authService.isAuthenticated()) {
      const username = this.authService.usuario.username;
      this.cajasService.getCajaUsuarioActiveByUserName(username).subscribe(
        result => {
          if (result !== null && result.activa) {
            this.cajaUsuario = result;
          } else {
            this.alertService.info(`Aperturar caja para realizar movimientos en caja `, "Caja")
            this.router.navigate(['/cajas']);
          }
        }
      )
    } else {
      this.alertService.info(`Se cerro la sesión sesión por tiempo de inactividad `, "Caja")
      this.router.navigate(['/']);
    }
  }

  searchByPedidoId(event: any): void {
    const pedidoId = +event
    if (!isNaN(pedidoId) && !Number.isInteger(pedidoId)) {
      this.alertService.error("Debe ingrear un número de Pedido valido", "Registro de pago pedido");
      return;
    }

    this.pedidoService.getPedido(pedidoId).subscribe(pedido => {
      this.pedido = pedido
      this.titulo = `${this.pedido.tipoPedido.nombre}`
      this.movimientoService.getAllTipoMovimientosPedido().subscribe(
        tipoMov => {
          this.tipoMovPedidoIngresos = tipoMov.filter(f => f.tipo === "I")
          this.tipoMovPedidoEgresos = tipoMov.filter(f => f.tipo === "E")
          if (this.pedido.tipoPedido.nombre === "VENTA PERSONA") {
            this.iMovimiento = 'I'
            this.changeTipoMovimiento(this.iMovimiento);
          }
          if (this.pedido.tipoPedido.nombre === "COMPRA O ADQUISICION") {
            this.iMovimiento = 'E'
            this.changeTipoMovimiento(this.iMovimiento);
          }
        })
    }
    );
  }

  changeTipoMovimiento(tipo: string) {
    this.tipoMovimientosPedidoLst = []
    this.movimiento.egresoDinero = 0;
    this.movimiento.ingresoDinero = 0;
    if (tipo === "I") {
      this.tipoMovimientosPedidoLst = [...this.tipoMovPedidoIngresos]
      if (this.pedido.tipoPedido.nombre === "VENTA PERSONA") {
        this.movimiento.tipoMovimientoPedido = this.findTipoMovimientoPedido(1);
      }
      if (this.pedido.tipoPedido.nombre === "COMPRA O ADQUISICION") {
        this.movimiento.tipoMovimientoPedido = this.findTipoMovimientoPedido(4);
      }
    }
    if (tipo === "E") {
      this.tipoMovimientosPedidoLst = [...this.tipoMovPedidoEgresos]
      if (this.pedido.tipoPedido.nombre === "VENTA PERSONA") {
        this.movimiento.tipoMovimientoPedido = this.findTipoMovimientoPedido(2);
      }
      if (this.pedido.tipoPedido.nombre === "COMPRA O ADQUISICION") {
        this.movimiento.tipoMovimientoPedido = this.findTipoMovimientoPedido(3);
      }
    }
    this.movimiento.tipoPago = this.tipoPagos[-1]
  }

  findTipoMovimientoPedido(id: number): TipoMovimientoPedido {
    return find(this.tipoMovimientosPedidoLst, { 'id': id })!
  }

  setMovimientoDinero(tipo: String): void {
    if (tipo == 'I') {
      let newSaldo = (this.pedido.saldoPedido - this.movimiento.ingresoDinero)
      if (newSaldo >= 0) {
        this.movimiento.egresoDinero = 0
        this.movimiento.saldoDinero = newSaldo;
      }
      if (newSaldo < 0) {
        this.movimiento.egresoDinero = newSaldo
        this.movimiento.saldoDinero = 0
      }
    }
    if (tipo == 'E') {
      let newSaldo = (this.pedido.saldoPedido - this.movimiento.egresoDinero)
      if (newSaldo >= 0) {
        this.movimiento.ingresoDinero = 0
        this.movimiento.saldoDinero = newSaldo;
      }
      if (newSaldo < 0) {
        this.movimiento.ingresoDinero = newSaldo
        this.movimiento.saldoDinero = 0
      }
    }
  }

  onSubmitForm(form: NgForm) {
    this.movimiento.pedido = this.pedido
    this.movimiento.pedido.createAt = "";
    this.movimiento.pedido.entregadoEn = "";
    this.movimiento.pedido.adquiridoEn = "";
    this.movimiento.pedido.items = [];
    this.movimiento.pedido.movimientos = [];

    this.cajaUsuario.fechaApertura = "";
    this.cajaUsuario.fechaActualizacion = "";
    this.cajaUsuario.movimientos = []

    this.movimiento.cajaUsuario = { ...this.cajaUsuario }
    if (this.pedido.tipoPedido.nombre == "VENTA PERSONA") {
      this.movimientoService.createMovimiento(this.movimiento).pipe(
        concatMap(mov => this.pedidoService.downloadOrderToPersonaInPDF(mov.pedido))
      ).subscribe(response => {
        fileSaver.saveAs(response.body!,
          this.pedidoService.filenameFromHeader(response.headers)) //utilidad pra qeu descargue automaticamente
        if (this.isFromPedidos) {
          this.router.navigate(['/pedidos/listado-ventas'])
        };
        this.alertService.success(`Se realizó la  ${this.pedido.tipoPedido.nombre} exitosamente`, "Exito");
      })
    }
    if (this.pedido.tipoPedido.nombre == "COMPRA O ADQUISICION") {
      this.movimientoService.createMovimiento(this.movimiento).subscribe(response => {
        this.alertService.success(`Se realizó la  ${this.pedido.tipoPedido.nombre} exitosamente`, "Exito");
        if (this.isFromPedidos) {
          this.router.navigate(['/pedidos/listado-compras']);
        }
      })
    }
    this.getCajaUsuario();
    this.limpiarForm(form);

  }

  limpiarForm(form: NgForm) {
    //form.reset();
    this.searchByPedidoId("0");
    this.movimiento.ingresoDinero = 0;
    this.movimiento.egresoDinero = 0;
    this.iMovimiento = "I";
    this.setMovimientoDinero(this.iMovimiento);
    this.searchText.nativeElement.value = '';
    this.searchText.nativeElement.focus();
  }
}



