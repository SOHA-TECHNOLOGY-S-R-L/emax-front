import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { Router } from '@angular/router';
import moment from 'moment';
import { COLOR_CAJA_USUARIO, ESTADO_CAJA_USUARIO } from '../../../../constants/caja-usuario.constants';
import { CajaUsuario } from '../../../../models/caja-usuario';
import { CajaService } from '../../../../services/caja.service';

@Component({
  selector: 'info-caja-usuario',
  standalone: true,

  templateUrl: './info-caja-usuario.component.html',
  styleUrl: './info-caja-usuario.component.css',
  imports: [CommonModule]

})
export class InfoCajaUsuarioComponent implements OnInit, OnChanges {
  private cajaService = inject(CajaService);
  cajaUsuario!: CajaUsuario;
  @Input() inCajaUsuario!: CajaUsuario;

  estadoCajaUsuarioMap = ESTADO_CAJA_USUARIO;
  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.inCajaUsuario!= null) {
      //console.log("currentValue", changes['username'].currentValue);
      //console.log("currentValue.inCajaUsuario", changes['inCajaUsuario'].currentValue);
      //console.log("previousValue", changes['username'].previousValue);
      //console.log("previousValue.inCajaUsuario", changes['inCajaUsuario'].previousValue);
      if (changes['inCajaUsuario'].currentValue != changes['inCajaUsuario'].previousValue) {
        this.cajaService.getCajaUsuarioByCajaIdAndUsername(this.inCajaUsuario.caja.id, this.inCajaUsuario.usuario.username).subscribe(
          result => {
            console.log("result", result);
            this.setValuesControls(result);
          }
        )
      }
    }
  }

  setValuesControls(cajaUsuario: CajaUsuario | null) {
    if (cajaUsuario != null) {
      this.cajaUsuario = cajaUsuario
      this.cajaUsuario.fechaApertura = moment(this.cajaUsuario.fechaApertura).format('DD/MM/yyyy HH:mm:ss');
      this.cajaUsuario.color = COLOR_CAJA_USUARIO[('' + this.cajaUsuario.activa) as keyof typeof COLOR_CAJA_USUARIO];
      if (this.cajaUsuario.fechaCierre != null) {
        this.cajaUsuario.fechaCierre = moment(this.cajaUsuario.fechaCierre).format('DD/MM/yyyy HH:mm:ss')
      };
    }
  }
}
