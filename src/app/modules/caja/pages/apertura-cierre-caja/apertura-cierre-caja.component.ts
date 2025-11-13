import { Component, inject, OnInit } from '@angular/core';


import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Caja } from '../../../../models/caja';
import { CajaUsuario } from '../../../../models/caja-usuario';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';
import { CajaService } from '../../../../services/caja.service';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { InfoCajaUsuarioComponent } from "../../components/info-caja-usuario/info-caja-usuario.component";
import { UsuarioService } from '../../../../services/usuario.service';


@Component({
  selector: 'app-apertura-cierre-caja',
  templateUrl: './apertura-cierre-caja.component.html',
  styleUrls: ['./apertura-cierre-caja.component.css'],
  standalone: true,
  imports: [CommonModule, AngularMaterialModule, RouterModule, FormsModule, ReactiveFormsModule, InfoCajaUsuarioComponent]


})
export class AperturaCierreCajaComponent implements OnInit {

  private fb = inject(FormBuilder);
  cajaUsuario = new CajaUsuario();
  //cajaUsuario!: CajaUsuario;
  //username!: string;
  //cajaId!: number;

  cajas: Caja[] = [];
  //caja!: Caja;
  //isAutenticado!: boolean;
  cajaActiva: boolean = false;
  //fechaActual!: string;
  //estadoCajaUsuarioMap = ESTADO_CAJA_USUARIO;

  formCaja = this.fb.group({
    ubicacionCaja: ['', {
      validators: [Validators.required]
    }],
    saldoPorConteo: [0, {
      validators: [Validators.required]
    }],
    cajaPorAsignar: ['', {
      validators: [Validators.required]
    }],
  })

  constructor(
    public authService: AuthService,
    private cajaService: CajaService,
    private usuarioService: UsuarioService,
    private alertService: AlertService,
    private router: Router) {

  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      const username = this.authService.usuario.username;
      this.usuarioService.getUsuarioByUsername(username).subscribe(resp => this.cajaUsuario.usuario = resp)
      this.cajaService.getCajaUsuarioByUserName(username).subscribe(
        result => {
          if (result != null) {
            this.cajaUsuario = result;
            this.cajaActiva = this.cajaUsuario.activa;
          }
        }
      )
      this.obtenerTodoCajas();

    } else {
      this.router.navigate(['/']);
    }
  }

  asignarCajaUsuario(caja: Caja) {
    this.cajaUsuario.caja = caja
    //this.cajaId = caja.id;
    this.formCaja.get("ubicacionCaja")?.setValue(caja.ubicacion);
  }

  obtenerTodoCajas() {
    this.cajaService.getCajasPorAsignar().subscribe(result => this.cajas = result)
  }


  abrirCaja() {
    //console.log("AperturaCajaComponent.abrirCaja...", this.cajaUsuario);
    this.cajaUsuario.fechaApertura = '';
    this.cajaUsuario.fechaCierre = '';
    //this.cajaUsuario.usuario.password = "";
    this.cajaUsuario.usuario.roles = [];
    this.cajaService.create(this.cajaUsuario).subscribe(
      response => {
        this.alertService.success(`Se habrió ${this.cajaUsuario.caja.nombre}, para ${this.cajaUsuario.usuario.username} con éxito!`, "Caja",)
        this.router.navigate(['/']);
      })
  }

  cerrarCaja() {
    const saldoPorConteo = this.formCaja.get('saldoPorConteo')!.value;
    const saldoCaja = this.cajaUsuario.saldoCaja;
    this.cajaUsuario.fechaApertura = '';
    this.cajaUsuario.fechaCierre = '';
    //this.cajaUsuario.usuario.password = "";

    if (saldoPorConteo == saldoCaja) {
      this.cajaUsuario.saldoPorConteo = saldoPorConteo!;
      this.cajaUsuario.activa = false;
      this.cajaService.update(this.cajaUsuario).subscribe(
        response => {
          this.alertService.success(`Se cerró ${this.cajaUsuario.caja.nombre}, para ${this.cajaUsuario.usuario.username} con éxito!`, "Caja")
          this.router.navigate(['/']);
        }
      )
    } else {
      this.alertService.warning(`No puede cerrar ${this.cajaUsuario.caja.nombre}, existe diferencias`, "Caja")
    }
  }


}
