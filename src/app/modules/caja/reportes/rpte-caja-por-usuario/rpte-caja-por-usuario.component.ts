import { CommonModule } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import * as fileSaver from 'file-saver-es';
import moment from 'moment';
import { Caja } from '../../../../models/caja';
import { Usuario } from '../../../../models/usuario';
import { AuthService } from '../../../../services/auth.service';
import { CajaService } from '../../../../services/caja.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';

@Component({
  selector: 'app-rpte-caja-por-usuario',
  templateUrl: './rpte-caja-por-usuario.component.html',
  styleUrl: './rpte-caja-por-usuario.component.css',
  standalone: true,
  imports: [CommonModule, AngularMaterialModule , RouterModule, FormsModule, ReactiveFormsModule ]

})
export class RpteCajaPorUsuarioComponent implements OnInit {
  titulo!: string;
  formCierreCajaPorUsuario!: FormGroup;
  filtrosReporte!: FiltrosReporte;
  //estadoPedidoLst: EstadoPedido[] = [];
  //usuarioLst: Usuario[] = [];
  usuario!: Usuario;
  cajaLst: Caja[] = []
  caja!: Caja;
  estadoCajaUsuarioLst: EstadoCajaUsuario[] = [];
  username!: string;

  constructor(
    private formBuilder: FormBuilder,
    private cajaService: CajaService,
    private usuarioService: UsuarioService,
    private authService: AuthService
    // private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {

    this.titulo = "Reporte cierre de caja por usuario"

    this.usuarioService.getUsuarioByUsername(this.authService.usuario.username)
      .subscribe(res => { this.usuario = res }
      );

    this.cargarEstadoCajaUsuario();
    this.cargarCajas();

    /***********alista la fecha para el campo datetime-local******************* */
    //en un futuro puede sustituirse por timepicker
    var now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

    this.filtrosReporte = {
      fecha_apertura1: [moment(now).subtract(1, 'days').toISOString().slice(0, 16)],
      fecha_apertura2: [now.toISOString().slice(0, 16)],
      /*       fecha_apertura1: [moment(new Date()).subtract(2, 'days').toISOString()],
            fecha_apertura2: [new Date().toISOString()], */
      activa: [],
      caja_id: [],
      usuario_id: []
    }

    //  console.log("onInit: " , this.filtrosReporte);
    this.createForm();

  }

  generarReporte() {
    this.filtrosReporte.fecha_apertura1 = [moment(this.formCierreCajaPorUsuario.get("fchTimeDesde")?.value).format("YYYY-MM-DD HH:mm")];
    this.filtrosReporte.fecha_apertura2 = [moment(this.formCierreCajaPorUsuario.get("fchTimeHasta")?.value).format("YYYY-MM-DD HH:mm")];
    this.filtrosReporte.activa = this.formCierreCajaPorUsuario.get("estadoCajaUsuario")?.value;
    this.filtrosReporte.caja_id = this.formCierreCajaPorUsuario.get("cajasId")?.value;
    this.filtrosReporte.usuario_id = [this.usuario.id]

    const filtros = {
      nombre: this.titulo.replaceAll(" ", ""),
      tipo: "EXCELOPENXML",
      filtros: this.filtrosReporte
    }

    this.cajaService.ceateReporteCierreCaja(filtros)
      .subscribe(response => {
        fileSaver.saveAs(response.body!,
          this.filenameFromHeader(response.headers)) //utilidad pra qeu descargue automaticamente
      })
  }

  private filenameFromHeader(headers: HttpHeaders): string {
    const disposition = headers.get('Content-Disposition');
    if (!disposition || disposition.indexOf('filename=') < 0) {
      return '';
    }
    return disposition.substring(disposition.indexOf('filename=') + 9, disposition.length);
  }

  cargarEstadoCajaUsuario() {
    this.estadoCajaUsuarioLst = [/*{ id: -1, pagado: '--Seleccione' },*/
      { id: 1, nombre: 'Activa' },
      { id: 0, nombre: 'Cerrada' }]
  }

  cargarCajas() {
    this.cajaService.getAllCaja().subscribe(res => this.cajaLst = res);
  }

  createForm() {
    this.formCierreCajaPorUsuario = this.formBuilder.group(
      {
        fchTimeDesde: [this.filtrosReporte.fecha_apertura1[0]],
        fchTimeHasta: [this.filtrosReporte.fecha_apertura2[0]],
        estadoCajaUsuario: [this.filtrosReporte.activa[0]],
        cajasId: [this.filtrosReporte.caja_id[0]],
      }
    )
  }

}

interface FiltrosReporte {
  fecha_apertura1: string[],
  fecha_apertura2: string[],
  activa: string[]
  caja_id: string[],
  usuario_id: number[],
}

interface EstadoCajaUsuario {
  id: number,
  nombre: string
}

