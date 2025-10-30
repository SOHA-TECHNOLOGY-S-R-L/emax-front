import { TipoPersona } from './../../../models/tipo-persona';
import { CommonModule } from '@angular/common';
import { Component, model, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { findIndex } from 'lodash-es';
import { Cliente } from '../../../models/cliente';
import { TipoDocumento } from '../../../models/tipo-documento';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { ClienteService } from '../../../services/cliente.service';
import { FormUtils } from '../../../utils/form-utils';
import { AngularMaterialModule } from '../../compartido/angular-material.module';
import { Usuario } from '../../../models/usuario';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  standalone: true,
  imports: [CommonModule, AngularMaterialModule, FormsModule, RouterModule],
})
export class FormComponent implements OnInit {

  cliente: Cliente = new Cliente();
  usuario: Usuario = new Usuario();
  tipoDocumentos: TipoDocumento[] = [];
  tipoPersonas: TipoPersona[] = [];
  tipoDocumentoSelected!: TipoDocumento;
  tipoPersonaSelected!: TipoPersona;
  titulo: string = "Crear cliente o proveedor";
  formUtils = FormUtils;
  //empleado!: Empleado;
  //listEmpleado: Empleado[]=[];

  //readonly labelPosition = model<'Si' | 'No'>('No');


  errores: string[] = [];

  constructor(private clienteService: ClienteService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertServie: AlertService,
    public authService: AuthService,
  ) { }

  ngOnInit() {
    this.clienteService.getTipoDocumento().subscribe(doc => {
      this.tipoDocumentos = doc
    });

    this.clienteService.getTipoPersona().subscribe(per => {
      this.tipoPersonas = per
    });

    this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('id')!;
      if (id) {
        this.titulo = "Editar cleinte o proveedor"

        this.clienteService.getCliente(id).subscribe((cliente) => {
          this.cliente = cliente
          const indDoc = this.findIndexDocument(this.cliente.tipoDocumento.id);
          this.tipoDocumentoSelected = this.tipoDocumentos[indDoc];


          const indPer = this.findIndexPerson(this.cliente.tipoPersona.id);
          this.tipoPersonaSelected = this.tipoPersonas[indPer];
        });
      }
    });
    //this.listEmpleado = [{ id: 0, empleado: "No" }, { id: 1, empleado: "Si" }];
    //this.empleado = this.listEmpleado[0];
  }


  findIndexDocument(tipoDocumentoId: number): number {
    return findIndex(this.tipoDocumentos, (td) => td.id == tipoDocumentoId)
  }

  findIndexPerson(tipoPersonaId: number): number {
    return findIndex(this.tipoPersonas, (td) => td.id == tipoPersonaId)
  }

  create(): void {

    this.usuario.username = this.cliente.numeroDocumento;
    this.usuario.noBloqueado = true
    this.usuario.activo = false;
    this.usuario.reintentos = 0

    this.cliente.tipoDocumento = this.tipoDocumentoSelected
    this.cliente.tipoPersona = this.tipoPersonaSelected

    /*     this.cliente.usuario.username = this.cliente.numeroDocumento;
        this.cliente.usuario.activo = false;
        this.cliente.usuario.noBloqueado = true;
        this.cliente.usuario.reintentos = 0 */
    this.cliente.usuario = { ...this.usuario }

    this.clienteService.create(this.cliente)
      .subscribe(
        cliente => {
          this.router.navigate(['/clientes']);
          this.alertServie.success(`El cliente ${cliente.nomApellRz} ha sido creado con éxito`, 'Nuevo cliente')
        },
      );
  }

  update(): void {
    this.cliente.pedidos = [];
    console.log(this.cliente);
    this.clienteService.update(this.cliente)
      .subscribe(
        json => {
          this.router.navigate(['/clientes']);
          this.alertServie.success(`${json.mensaje}`, 'Cliente Actualizado')
        },
        err => {
          this.errores = err.error.errors as string[];
          console.error('Código del error desde el backend: ' + err.status);
          console.error(err.error.errors);
        }
      )
  }

  compararDocumento(o1: TipoDocumento, o2: TipoDocumento): boolean {
    if (o1 === undefined && o2 === undefined) {
      return true;
    }

    return o1 === null || o2 === null || o1 === undefined || o2 === undefined ? false : o1.id === o2.id;
  }

  compararPersona(o1: TipoPersona, o2: TipoPersona): boolean {
    if (o1 === undefined && o2 === undefined) {
      return true;
    }

    return o1 === null || o2 === null || o1 === undefined || o2 === undefined ? false : o1.id === o2.id;
  }

}

interface Empleado {
  id: number,
  empleado: string
}
