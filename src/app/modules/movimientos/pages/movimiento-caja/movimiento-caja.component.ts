import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CajaUsuario } from '../../../../models/caja-usuario';
import { MovimientoCaja } from '../../../../models/movimiento-caja';
import { TipoMovimientoCaja } from '../../../../models/tipo-movimiento-caja';
import { TipoPago } from '../../../../models/tipo-pago';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';
import { CajaService } from '../../../../services/caja.service';
import { MovimientoService } from '../../../../services/movimiento.service';
import { InfoCajaUsuarioComponent } from '../../../caja/components/info-caja-usuario/info-caja-usuario.component';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';

@Component({
  selector: 'app-movimiento-caja',
  templateUrl: './movimiento-caja.component.html',
  styleUrl: './movimiento-caja.component.css',
  standalone: true,
  imports: [CommonModule, AngularMaterialModule, RouterModule, FormsModule, ReactiveFormsModule, InfoCajaUsuarioComponent]

})
export class MovimientoCajaComponent implements OnInit {
  movimientoCaja = new MovimientoCaja();
  cajaUsuario = new CajaUsuario();
  tipoPagos: TipoPago[] = [];

  tipoMovimientosCajaLst: TipoMovimientoCaja[] = [];
  tipoMovCajaIngresos: TipoMovimientoCaja[] = [];
  tipoMovCajaEgresos: TipoMovimientoCaja[] = [];
  iMovimiento!: string;

  constructor(private cajasService: CajaService,
    private movimientoService: MovimientoService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router
  ) {

  }


  ngOnInit(): void {
    /*   if (this.authService.isAuthenticated()) {
        const username = this.authService.usuario.username;
        this.cajasService.getCajaUsuarioByUserName(username).subscribe(
          res => {
            if (res !== null && res.activa) {
              this.cajaId = res.caja.id;
              this.username = username;
            } else {
              this.alertService.info(`Debe aperturar caja`, 'Caja usuario')
              this.router.navigate(['/cajas']);
            }
          }
        )
      } */

    this.movimientoService.getAllTipoPagos().subscribe(
      response => this.tipoPagos = response
    )

    this.movimientoService.getAllTipoMovimientosCaja().subscribe(
      response => {
        //console.log("response", response)
        this.tipoMovCajaIngresos = response.filter(f => f.tipo === "I")
        //console.log("tipoMovCajaIngresos", this.tipoMovCajaIngresos)

        this.tipoMovCajaEgresos = response.filter(f => f.tipo === "E")
        //console.log("tipoMovCajaEgresos", this.tipoMovCajaEgresos)
        this.iMovimiento = "I";
        this.changeTipoMovimiento(this.iMovimiento);

      });
    this.getCajaUsuario();

  }

  getCajaUsuario(): void {
    if (this.authService.isAuthenticated()) {
      const username = this.authService.usuario.username;
      this.cajasService.getCajaUsuarioByUserName(username).subscribe(
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

  changeTipoMovimiento(tipo: string) {
    this.tipoMovimientosCajaLst = []
    if (tipo === "I") {
      this.tipoMovimientosCajaLst = [...this.tipoMovCajaIngresos]
      this.movimientoCaja.egresoDinero = 0;
    }
    if (tipo === "E") {
      this.tipoMovimientosCajaLst = [...this.tipoMovCajaEgresos]
      this.movimientoCaja.ingresoDinero = 0;
    }
    this.movimientoCaja.tipoMovimientoCaja = this.tipoMovimientosCajaLst[-1]
    this.movimientoCaja.tipoPago = this.tipoPagos[-1];

  }

  /*   setValuesControls(cajaUsuario: CajaUsuario) {
      this.cajaUsuario = cajaUsuario;
    } */

  onSubmitForm(form: NgForm) {
    this.cajaUsuario.movimientos = []
    this.cajaUsuario.movimientosCaja = []
    this.cajaUsuario.fechaApertura = "";
    this.cajaUsuario.fechaActualizacion = "";
    this.movimientoCaja.cajaUsuario = { ...this.cajaUsuario }
    this.movimientoService.createMovimientoCaja(this.movimientoCaja).subscribe(
      resp => {
        //console.log(`Movimiento ${resp.cajaUsuario.id}, creado con éxito!`);
        //this.router.navigate(['/']);
      })
    this.getCajaUsuario();
    this.limpiarForm(form);


  }

  limpiarForm(form: NgForm) {
      this.iMovimiento = "I";
      this.changeTipoMovimiento(this.iMovimiento);
      this.movimientoCaja.ingresoDinero=0;
      this.movimientoCaja.egresoDinero=0;
      this.movimientoCaja.descripcion="";
  }

}
