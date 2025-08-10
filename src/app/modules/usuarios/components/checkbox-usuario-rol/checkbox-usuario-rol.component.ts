import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { findIndex } from 'lodash-es';
import { Modulo } from '../../../../models/modulo';
import { Usuario } from '../../../../models/usuario';
import { RolService } from '../../../../services/rol.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';

@Component({
  selector: 'checkbox-usuario-rol',
  templateUrl: './checkbox-usuario-rol.component.html',
  styleUrl: './checkbox-usuario-rol.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule,AngularMaterialModule ]

})
export class CheckboxUsuarioRolComponent implements OnInit {

  @Input() modulo!: Modulo;
  @Input() usuarioSeleccionado!: Usuario;
  @Output() acumulaChecks: EventEmitter<Modulo> = new EventEmitter();

  //@Input() activatedActions: CheckboxActionItem[] = [];
  //@Input() validate: boolean;

  roles: string[] = [];
  modulos: Modulo[] = [];
  //usuario!: Usuario;
  checkboxRoles: CheckboxRoles[] = []
  checkboxModul!: CheckboxModul;

  allComplete: boolean = false;

  constructor(private rolService: RolService, private usuarioService: UsuarioService) { }

  ngOnInit() {
    this.modulo.roles.forEach((r) => {
      this.checkboxRoles.push({
        id: r.id,
        nombre: r.nombre,
        descripcion: r.descripcion,
        activated: this.permissionIsActivated(r.id)
      })
    })
    this.checkboxModul = {
      id: this.modulo.id,
      nombre: this.modulo.nombre,
      activated: false,
      checkboxRoles: this.checkboxRoles
    }
    this.updateAllComplete();
  }

  updateAllComplete() {
    this.allComplete = this.checkboxModul.checkboxRoles != null && this.checkboxModul.checkboxRoles.every(t => t.activated);
    this.acumulaChecks.emit(this.moduloExport());
  }

  someComplete(): boolean {
    if (this.checkboxModul.checkboxRoles == null) {
      return false;
    }
    return this.checkboxModul.checkboxRoles.filter(t => t.activated).length > 0 && !this.allComplete;
  }

  setAll(completed: boolean) {
    this.allComplete = completed;
    if (this.checkboxModul.checkboxRoles == null) {
      return;
    }
    this.checkboxModul.checkboxRoles.forEach(t => (t.activated = completed));
  }


  permissionIsActivated(rolId: number): boolean {

    const index = findIndex(this.usuarioSeleccionado.roles, (ap) => ap.id == rolId);
    return index != -1;
  }

  moduloExport(): Modulo {
    //const roles = this.checkboxModul.checkboxRoles.filter(c=> c.activated);
    const roles = this.checkboxModul.checkboxRoles;
    this.modulo.roles = [...roles];
    return this.modulo
  }
}


export interface CheckboxModul {
  id: number;
  nombre: string;
  activated: boolean;
  checkboxRoles: CheckboxRoles[]
}

export interface CheckboxRoles {
  id: number;
  nombre: string;
  descripcion: string;
  activated: boolean;
}
