import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import * as fileSaver from 'file-saver-es';
import moment from 'moment';
import { Caja } from '../../../../models/caja';
import { Usuario } from '../../../../models/usuario';
import { CajaService } from '../../../../services/caja.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';

@Component({
  selector: 'app-rpte-caja',
  templateUrl: './rpte-caja.component.html',
  styleUrl: './rpte-caja.component.css',
  standalone: true,
  imports: [CommonModule,AngularMaterialModule , RouterModule, FormsModule, ReactiveFormsModule ]

})
export class RpteCajaComponent implements OnInit {
  titulo!: string;
  formCierreCaja!: FormGroup;
  filtrosReporte!: FiltrosReporte;
  //estadoPedidoLst: EstadoPedido[] = [];
  usuarioLst: Usuario[] = [];
  usuario!: Usuario;
  cajaLst: Caja[] = []
  caja!: Caja;
  estadoCajaUsuarioLst: EstadoCajaUsuario[] = [];
  username!: string;

  constructor(
    private formBuilder: FormBuilder,
    private cajaService: CajaService,
    private usuarioService: UsuarioService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.titulo = "Reporte cierre de caja";
    this.cargarEstadoCajaUsuario();
    this.cargarCajas();
    this.cargarUsuarios();
    /***********alista la fecha para el campo datetime-local******************* */
    //en un futuro puede sustituirse por timepicker
    var now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

    this.filtrosReporte = {
      fecha_apertura1: [moment(now).subtract(1, 'days').toISOString().slice(0, 16)],
      fecha_apertura2: [now.toISOString().slice(0, 16)],
      activa: [],
      caja_id: [],
      usuario_id: []
    }

    this.createForm();

  }

  generarReporte() {
    this.filtrosReporte.fecha_apertura1 = [moment(this.formCierreCaja.get("fchTimeDesde")?.value).format("YYYY-MM-DD HH:mm")];
    this.filtrosReporte.fecha_apertura2 = [moment(this.formCierreCaja.get("fchTimeHasta")?.value).format("YYYY-MM-DD HH:mm")];
    this.filtrosReporte.activa = this.formCierreCaja.get("estadoCajaUsuario")?.value;
    this.filtrosReporte.caja_id = this.formCierreCaja.get("cajasId")?.value;
    this.filtrosReporte.usuario_id = this.formCierreCaja.get("usuariosId")?.value;


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

  cargarUsuarios() {
    this.usuarioService.getAllUsers().subscribe(res => this.usuarioLst = res);
  }

  createForm() {
    this.formCierreCaja = this.formBuilder.group(
      {
        fchTimeDesde: [this.filtrosReporte.fecha_apertura1[0]],
        fchTimeHasta: [this.filtrosReporte.fecha_apertura2[0]],
        estadoCajaUsuario: [this.filtrosReporte.activa[0]],
        cajasId: [this.filtrosReporte.caja_id[0]],
        usuariosId: [this.filtrosReporte.usuario_id[0]]
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

