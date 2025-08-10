import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import * as fileSaver from 'file-saver-es';
import { find } from 'lodash-es';
import moment from 'moment';
import { concatMap } from 'rxjs';
import { COLOR_CAJA_USUARIO, ESTADO_CAJA_USUARIO } from '../../../../constants/caja-usuario.constants';
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
import { AngularMaterialModule } from '../../../compartido/angular-material.module';


@Component({
  selector: 'app-movimiento',
  templateUrl: './movimiento.component.html',
  styleUrl: './movimiento.component.css',
  standalone:true,
  imports: [CommonModule, RouterModule, AngularMaterialModule , FormsModule, ReactiveFormsModule ]
})
export class MovimientoComponent implements OnInit {
  titulo: string = 'Movimiento de pago'
  movimiento = new Movimiento();
  cajaUsuario!: CajaUsuario;
  pedido!: Pedido;
  tipoPagos: TipoPago[] = [];
  tipoMovimientosPedidoLst: TipoMovimientoPedido[] = [];
  tipoMovPedidoIngresos: TipoMovimientoPedido[] = [];
  tipoMovPedidoEgresos: TipoMovimientoPedido[] = [];
  isAutenticado!: boolean;
  //user!: Usuario;
  username!: string;
  iMovimiento: string = "I";
  estadoCajaUsuarioMap = ESTADO_CAJA_USUARIO;


  constructor(private cajasService: CajaService,
    private movimientoService: MovimientoService,
    private pedidoService: PedidoService,
    public authService: AuthService,
    private alertService: AlertService,
    private router: Router
  ) {

  }


  ngOnInit(): void {
    //this.isAutenticado = this.authService.isAuthenticated();
    if (this.authService.isAuthenticated()) {
      this.username = this.authService.usuario.username;
    }
    //trae pedidos
    this.pedido = { ...this.pedidoService.pedido };
    this.cajasService.getCajaUsuarioByUserName(this.username).subscribe(
      res => {
        //console.log("getCajaUsuarioByUserName...", res)
        if (res !== null && res.activa) {
          this.cajaUsuario = res
          this.cajaUsuario.fechaApertura = moment(this.cajaUsuario.fechaApertura).format('DD/MM/yyyy HH:mm:ss');
          this.cajaUsuario.fechaActualizacion = moment(this.cajaUsuario.fechaActualizacion).format('DD/MM/yyyy HH:mm:ss');
          this.cajaUsuario.color = COLOR_CAJA_USUARIO[('' + res.activa) as keyof typeof COLOR_CAJA_USUARIO];
        } else {
          this.alertService.info(`Debe aperturar caja`, "Caja")
          //swal.fire('', `Debe aperturar caja`, 'info');
          this.router.navigate(['/cajas']);
        }
      }
    )
    // trae tipo de pagos
    this.movimientoService.getAllTipoPagos().subscribe(
      response => this.tipoPagos = response
    )

    //trae tipo de movimientos
    this.movimientoService.getAllTipoMovimientosPedido().subscribe(
      response => {
        this.tipoMovPedidoIngresos = response.filter(f => f.tipo == "I")
        this.tipoMovPedidoEgresos = response.filter(f => f.tipo == "E")
      })
  }

  ngAfterViewInit(): void {
    if (this.pedido.tipoPedido.nombre == "VENTA AL CLIENTE") {
      this.iMovimiento = 'I'
      this.changeTipoMovimiento(this.iMovimiento);
    }
    if (this.pedido.tipoPedido.nombre == "COMPRA O ADQUISICION") {
      this.iMovimiento = 'E'
      this.changeTipoMovimiento(this.iMovimiento);
    }
  }

  changeTipoMovimiento(tipo: string) {
    this.tipoMovimientosPedidoLst = []
    this.movimiento.egresoDinero = 0;
    this.movimiento.ingresoDinero = 0;
    if (tipo == "I") {
      this.tipoMovimientosPedidoLst = this.tipoMovPedidoIngresos
      if (this.pedido.tipoPedido.nombre == "VENTA AL CLIENTE") {
        this.movimiento.tipoMovimientoPedido = this.findTipoMovimientoPedido(1);
      }
      if (this.pedido.tipoPedido.nombre == "COMPRA O ADQUISICION") {
        this.movimiento.tipoMovimientoPedido = this.findTipoMovimientoPedido(4);
      }
    }
    if (tipo == "E") {
      this.tipoMovimientosPedidoLst = this.tipoMovPedidoEgresos
      if (this.pedido.tipoPedido.nombre == "VENTA AL CLIENTE") {
        this.movimiento.tipoMovimientoPedido = this.findTipoMovimientoPedido(2);
      }
      if (this.pedido.tipoPedido.nombre == "COMPRA O ADQUISICION") {
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

  onSubmitForm() {
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
    //console.log("onSubmitForm...", this.movimiento);
    if (this.pedido.tipoPedido.nombre == "VENTA AL CLIENTE") {
      this.movimientoService.createMovimiento(this.movimiento).pipe(
        concatMap(mov => this.pedidoService.downloadOrderToClienteInPDF(mov.pedido))
      ).subscribe(response => {
        this.alertService.success(`Venta pagada con éxito, se esta descargando su orden...!`, this.titulo)
        fileSaver.saveAs(response.body!,
          this.pedidoService.filenameFromHeader(response.headers)) //utilidad pra qeu descargue automaticamente
        this.router.navigate(['/pedidos/listado-ventas']);
      })
    }
        if (this.pedido.tipoPedido.nombre == "COMPRA O ADQUISICION") {
      this.movimientoService.createMovimiento(this.movimiento).subscribe(response => {
        this.alertService.success(`Compra pagada realizada con éxito!`, this.titulo)
        this.router.navigate(['/pedidos/listado-compras']);
      })
    }
  }
}



