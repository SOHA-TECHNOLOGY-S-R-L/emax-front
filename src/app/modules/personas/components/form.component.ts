import { TipoPersona } from './../../../models/tipo-persona';
import { CommonModule } from '@angular/common';
import { Component, model, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { findIndex } from 'lodash-es';
import { Persona } from '../../../models/persona';
import { TipoDocumento } from '../../../models/tipo-documento';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { PersonaService } from '../../../services/persona.service';
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

  persona: Persona = new Persona();
  usuario: Usuario = new Usuario();
  tipoDocumentos: TipoDocumento[] = [];
  tipoPersonas: TipoPersona[] = [];
  tipoDocumentoSelected!: TipoDocumento;
  tipoPersonaSelected!: TipoPersona;
  titulo: string = "Crear persona o proveedor";
  formUtils = FormUtils;
  //empleado!: Empleado;
  //listEmpleado: Empleado[]=[];

  //readonly labelPosition = model<'Si' | 'No'>('No');


  errores: string[] = [];

  constructor(private personaService: PersonaService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertServie: AlertService,
    public authService: AuthService,
  ) { }

  ngOnInit() {
    this.personaService.getTipoDocumento().subscribe(doc => {
      this.tipoDocumentos = doc
    });

    this.personaService.getTipoPersona().subscribe(per => {
      this.tipoPersonas = per.filter(per => per.persona.includes("Cliente") || per.persona.includes("Proveedor"))
    });

    this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('id')!;
      if (id) {
        this.titulo = "Editar cleinte o proveedor"

        this.personaService.getPersona(id).subscribe((persona) => {
          this.persona = persona
          const indDoc = this.findIndexDocument(this.persona.tipoDocumento.id);
          this.tipoDocumentoSelected = this.tipoDocumentos[indDoc];


          const indPer = this.findIndexPerson(this.persona.tipoPersona.id);
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

    this.usuario.username = this.persona.numeroDocumento;
    this.usuario.noBloqueado = true
    this.usuario.activo = true;
    this.usuario.reintentos = 0

    this.persona.tipoDocumento = this.tipoDocumentoSelected
    this.persona.tipoPersona = this.tipoPersonaSelected

    /*     this.persona.usuario.username = this.persona.numeroDocumento;
        this.persona.usuario.activo = false;
        this.persona.usuario.noBloqueado = true;
        this.persona.usuario.reintentos = 0 */
    this.persona.usuario = { ...this.usuario }

    this.personaService.create(this.persona)
      .subscribe(
        persona => {
          this.router.navigate(['/personas']);
          this.alertServie.success(`El persona ${persona.nomApellRz} ha sido creado con éxito`, 'Nuevo persona')
        },
      );
  }

  update(): void {
    this.persona.tipoDocumento = this.tipoDocumentoSelected
    this.persona.tipoPersona = this.tipoPersonaSelected
    this.persona.pedidos = [];
    //console.log(this.persona);
    this.personaService.update(this.persona)
      .subscribe(
        json => {
          this.router.navigate(['/personas']);
          this.alertServie.success(`${json.mensaje}`, 'Persona Actualizado')
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
