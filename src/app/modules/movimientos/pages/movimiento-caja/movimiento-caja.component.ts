import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { find } from 'lodash-es';
import moment from 'moment';
import swal from 'sweetalert2';
import { COLOR_CAJA_USUARIO, ESTADO_CAJA_USUARIO } from '../../../../constants/caja-usuario.constants';
import { CajaUsuario } from '../../../../models/caja-usuario';
import { MovimientoCaja } from '../../../../models/movimiento-caja';
import { TipoMovimientoCaja } from '../../../../models/tipo-movimiento-caja';
import { TipoPago } from '../../../../models/tipo-pago';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';
import { CajaService } from '../../../../services/caja.service';
import { MovimientoService } from '../../../../services/movimiento.service';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';

@Component({
  selector: 'app-movimiento-caja',
  templateUrl: './movimiento-caja.component.html',
  styleUrl: './movimiento-caja.component.css',
  standalone: true,
  imports: [CommonModule, AngularMaterialModule ,RouterModule, FormsModule, ReactiveFormsModule ]

})
export class MovimientoCajaComponent implements OnInit, AfterViewInit {
  titulo: string = 'Movimiento de caja'
  movimientoCaja = new MovimientoCaja();
  cajaUsuario!: CajaUsuario;
  tipoPagos: TipoPago[] = [];

  tipoMovimientosCajaLst: TipoMovimientoCaja[] = [];
  tipoMovCajaIngresos: TipoMovimientoCaja[] = [];
  tipoMovCajaEgresos: TipoMovimientoCaja[] = [];
  isAutenticado!: boolean;
  //user!: Usuario;
  username!: string;
  iMovimiento: string = "I";
  estadoCajaUsuarioMap = ESTADO_CAJA_USUARIO;

  constructor(private cajasService: CajaService,
    private movimientoService: MovimientoService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router
  ) {

  }


  ngOnInit(): void {
    //this.isAutenticado = this.authService.isAuthenticated();
    if (this.authService.isAuthenticated()) {
      this.username = this.authService.usuario.username;
    }

    this.cajasService.getCajaUsuarioByUserName(this.username).subscribe(
      res => {
        if (res !== null && res.activa) {
          this.cajaUsuario = res
          this.cajaUsuario.fechaApertura = moment(this.cajaUsuario.fechaApertura).format('DD/MM/yyyy HH:mm:ss');
          this.cajaUsuario.fechaActualizacion = moment(this.cajaUsuario.fechaActualizacion).format('DD/MM/yyyy HH:mm:ss');
          this.cajaUsuario.color = COLOR_CAJA_USUARIO[('' + res.activa) as keyof typeof COLOR_CAJA_USUARIO];
          //this.colores[('' + res.activa) as keyof typeof this.colores ];
          //        console.log("getCajaUsuarioByUserName...", res)
        } else {
          this.alertService.info(`Debe aperturar caja`, 'Caja usuario')
          this.router.navigate(['/cajas']);
        }
      }
    )

    this.movimientoService.getAllTipoPagos().subscribe(
      response => this.tipoPagos = response
    )

    this.movimientoService.getAllTipoMovimientosCaja().subscribe(
      response => {
        this.tipoMovCajaIngresos = response.filter(f => f.tipo == "I")
        this.tipoMovCajaEgresos = response.filter(f => f.tipo == "E")

      })

  }
  ngAfterViewInit(): void {
    this.changeTipoMovimiento(this.iMovimiento);
  }

  changeTipoMovimiento(tipo: string) {
    //this.movimientoCaja.tipoMovimientoCaja
    this.tipoMovimientosCajaLst = []
    if (tipo == "I") {
      this.tipoMovimientosCajaLst = this.tipoMovCajaIngresos
      this.movimientoCaja.egresoDinero = 0;
    }
    if (tipo == "E") {
      this.tipoMovimientosCajaLst = this.tipoMovCajaEgresos
      this.movimientoCaja.ingresoDinero = 0;
    }
    this.movimientoCaja.tipoMovimientoCaja = this.tipoMovimientosCajaLst[-1]
    this.movimientoCaja.tipoPago = this.tipoPagos[-1];

  }

  findTipoMovimientoCaja(id: number): TipoMovimientoCaja {
    return find(this.tipoMovimientosCajaLst, { 'id': id })!
  }

  onSubmitForm() {
    this.cajaUsuario.movimientos = []
    this.cajaUsuario.movimientosCaja = []
    this.cajaUsuario.fechaApertura = "";
    this.cajaUsuario.fechaActualizacion = "";
    this.movimientoCaja.cajaUsuario = { ...this.cajaUsuario }
    console.log("onSubmitForm...", this.movimientoCaja);
    this.movimientoService.createMovimientoCaja(this.movimientoCaja).subscribe(
      resp => {
        swal.fire(this.titulo, `Movimiento ${resp.cajaUsuario.id}, creado con éxito!`, 'success');
        this.router.navigate(['/']);
      })
  }

}
