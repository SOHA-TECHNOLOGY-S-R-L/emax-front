import { Component, OnInit, Input } from '@angular/core';
import { Persona } from '../../../models/persona';
import { PersonaService } from '../../../services/persona.service';
import { ModalService } from '../../../services/modal.service';

import swal from 'sweetalert2';
import { HttpEventType } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

import { PedidoService } from '../../../services/pedido.service';
import { Pedido } from '../../../models/pedido';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'detalle-persona',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.css'],
  standalone: true,
  imports: [CommonModule,RouterModule]
})
export class DetalleComponent implements OnInit {

  @Input() persona!: Persona;

  titulo: string = "Detalle del persona";
  fotoSeleccionada?: File;
  progreso: number = 0;

  constructor(private personaService: PersonaService,
    private pedidoService: PedidoService,
    public authService: AuthService,
    public modalService: ModalService) { }

  ngOnInit() { }

  seleccionarFoto(event: any) {
    this.fotoSeleccionada = event.target.files[0];
    this.progreso = 0;
    if (this.fotoSeleccionada!.type.indexOf('image') < 0) {
      swal.fire('Error seleccionar imagen: ', 'El archivo debe ser del tipo imagen', 'error');
   //   this.fotoSeleccionada = null;
    }
  }


  subirFoto() {

    if (!this.fotoSeleccionada) {
      swal.fire('Error Upload: ', 'Debe seleccionar una foto', 'error');
    } else {
      this.personaService.subirFoto(this.fotoSeleccionada, this.persona.id)
        .subscribe(event => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progreso = Math.round((event.loaded / event.total!) * 100);
          } else if (event.type === HttpEventType.Response) {
            let response: any = event.body;
            this.persona = response.persona as Persona;

            this.modalService.notificarUpload.emit(this.persona);
            swal.fire('La foto se ha subido completamente!', response?.mensaje, 'success');
          }
        });
    }
  }

  cerrarModal() {
    this.modalService.cerrarModal();
    //this.fotoSeleccionada = null;
    this.progreso = 0;
  }

  delete(pedido: Pedido): void {
    swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el pedido de ${pedido.persona?.nomApellRz} ?`,
      //type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!',
      cancelButtonText: 'No, cancelar!',
      //confirmButtonClass: 'btn btn-success',
      //cancelButtonClass: 'btn btn-danger',
      buttonsStyling: false,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {

        this.pedidoService.delete(pedido.id).subscribe(
          () => {
            this.persona.pedidos = this.persona.pedidos.filter(f => f !== pedido)
            swal.fire(
              'Pedido Eliminada!',
              `Pedido de ${pedido.persona?.nomApellRz} eliminada con éxito.`,
              'success'
            )
          }
        )

      }
    });
  }

}
