import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges, computed, inject, input } from '@angular/core';
import moment from 'moment';
import { COLOR_CAJA_USUARIO, ESTADO_CAJA_USUARIO } from '../../../../constants/caja-usuario.constants';
import { CajaUsuario } from '../../../../models/caja-usuario';
import { CajaService } from '../../../../services/caja.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { UsuarioService } from '../../../../services/usuario.service';

@Component({
  selector: 'info-caja-usuario',
  standalone: true,

  templateUrl: './info-caja-usuario.component.html',
  styleUrl: './info-caja-usuario.component.css',
  imports: [CommonModule]

})
export class InfoCajaUsuarioComponent {
  private cajaService = inject(CajaService);
  private usuarioService = inject(UsuarioService);

  //cajaUsuario!: CajaUsuario;
  inCajaUsuario = input.required<CajaUsuario>();
  cajaUsuario = computed(() => {
    //if (this.inCajaUsuario() == null) {return }
    const cu = this.inCajaUsuario();
    return {
      ...cu,
      fechaApertura: moment(cu.fechaApertura).format('DD/MM/yyyy HH:mm:ss'),
      color: COLOR_CAJA_USUARIO[('' + cu.activa) as keyof typeof COLOR_CAJA_USUARIO],
      fechaCierre: (cu.fechaCierre) ? moment(cu.fechaCierre).format('DD/MM/yyyy HH:mm:ss') : ''
    };
  });


  readonly cajaResource = rxResource({
    params: () => {
      const cajaId = this.cajaUsuario().cajaId;
      if (!cajaId) return null;
      return { cajaId };
    },
    stream: ({ params }) => this.cajaService.getCajaById(params!.cajaId),
  });

  readonly usuarioResource = rxResource({
    params: () => {
      const usuarioId = this.cajaUsuario().usuarioId;
      if (!usuarioId) return null;
      return { usuarioId };
    },
    stream: ({ params }) => this.usuarioService.getUsuarioById(params!.usuarioId),
  });

  estadoCajaUsuarioMap = ESTADO_CAJA_USUARIO;
  constructor() { }

}
