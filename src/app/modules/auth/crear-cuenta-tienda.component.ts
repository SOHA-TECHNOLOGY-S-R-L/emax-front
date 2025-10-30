import { Component, inject } from '@angular/core';

import { find } from 'lodash-es';
import { ClienteService } from '../../services/cliente.service';
import { AlertService } from '../../services/alert.service';
import { FormUtils } from '../../utils/form-utils';
import { Cliente } from '../../models/cliente';
import { TipoDocumento } from '../../models/tipo-documento';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterModule, Router } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-crear-cuenta-tienda',
  templateUrl: './crear-cuenta-tienda.component.html',
  styleUrl: './crear-cuenta-tienda.component.css',
  standalone: true,
  imports: [CommonModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule, MatListModule, MatTableModule, MatPaginatorModule, RouterModule, FormsModule, ReactiveFormsModule, MatCardModule, MatAutocompleteModule, MatSelectModule, MatRadioModule, MatIconModule, MatDialogModule]

})
export class CrearCuentaTiendaComponent {
  private clienteService = inject(ClienteService);
  private usuarioService = inject(UsuarioService);
  private alertService = inject(AlertService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  formUtils = FormUtils;

  tipoDocumentos: TipoDocumento[] = [];
  //usuario: Usuario = new Usuario();
  cliente: Cliente = new Cliente();
  usuario: Usuario = new Usuario();
  formNewCuenta!: FormGroup;
  isCliente: boolean = false;
  isUsuario: boolean = false;
  frmDefault!: FrmCrearCuentaDefault;

  ngOnInit() {
    this.clienteService.getTipoDocumento().subscribe(doc => {
      this.tipoDocumentos = doc
      console.log("aa:", this.tipoDocumentos);
    });

    this.frmDefault = {
      tipoDocumentoId: -1,
      numDocumento: '',
      nomApellRz: '',
      correo: '',
      clave: '',
      confirmaClave: '',
    }

    this.createForm();

  }

  createForm(): void {
    this.formNewCuenta = this.formBuilder.group({
      //usuario: [this.cajaUsuario?.usuario?.username],
      //usuario:   [this.cajaUsuario?.usuario?.apellido +'-'+ this.cajaUsuario?.usuario?.nombre],
      tipoDocumentoId: [this.frmDefault.tipoDocumentoId, Validators.required],

      numeroDocumento: [this.frmDefault.numDocumento,
      { validators: [Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern('^\\d+$')] }
      ],
      nomApellRz: [this.frmDefault.nomApellRz,
      { validators: [Validators.required, Validators.minLength(2), Validators.pattern('^[a-zA-Z\\s]+$')] }
      ],

      correo: [this.frmDefault.correo, [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]
      ],

      /*       direccion: [this.cliente?.direccion,
            { validators: [Validators.required, Validators.minLength(5)] }
            ],

            celular: [this.cliente?.celular, [Validators.required, Validators.minLength(6), Validators.maxLength(14), Validators.pattern('^\\d+$')]], */


      /*       clave: [this.cliente?.usuario?.password,
            { validators: [Validators.required, Validators.minLength(4), Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')] }

            ],
            confirmaClave: [this.cliente?.usuario?.confirmaPassword,
            { validators: [Validators.required, Validators.minLength(4), Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')] }
            ] */

      /**  ^(?=.[A-Za-z])(?=.\d).{4,}$ exige al menos una letra, al menos un dígito y un mínimo de 4 caracteres.
 */
      clave: [this.frmDefault.clave,
      { validators: [Validators.required, Validators.minLength(4), Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d).{4,}$')] }

      ],
      confirmaClave: [this.frmDefault.confirmaClave,
      { validators: [Validators.required, Validators.minLength(4), Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d).{4,}$')] }
      ]

    })
  }

  crearCuenta() {
    if (this.formNewCuenta.invalid) {
      this.formNewCuenta.markAllAsTouched();
      return;
    }


    if (this.formNewCuenta.valid) {
      const clave = this.formNewCuenta.get('clave')?.value
      const confirmaClave = this.formNewCuenta.get('confirmaClave')?.value
      if (this.usuarioService.confirmarDobleInputClave(clave, confirmaClave)) {
        this.usuario.username = this.formNewCuenta.get('numeroDocumento')?.value
        this.usuario.password = this.formNewCuenta.get('clave')?.value
        this.usuario.noBloqueado = true;
       // this.usuario.empleado = false;
        this.usuario.activo = true;
        this.usuario.reintentos = 0
        this.cliente.tipoDocumento = find(this.tipoDocumentos, (td) => td.id === +this.formNewCuenta.get('tipoDocumentoId')?.value)!
        this.cliente.numeroDocumento = this.formNewCuenta.get('numeroDocumento')?.value
        this.cliente.nomApellRz = this.formNewCuenta.get('nomApellRz')?.value
        this.cliente.email = this.formNewCuenta.get('correo')?.value
        this.cliente.direccion = this.formNewCuenta.get('direccion')?.value
        this.cliente.usuario = { ...this.usuario }
        this.clienteService.create(this.cliente).subscribe(resp => {
          this.alertService.success(`Hola ${resp.nomApellRz} se ha creado tu cuenta, puedes iniciar sesión`, "Exito");
          this.router.navigate(['/login']);
        })

      } else {
        this.alertService.error("No coinciden las claves de registro", "Error");
      }
    }
  }

  findByNumDocumento(event: any) {
    const numero = event.target.value;
    const tipoDocumentoId = this.formNewCuenta.get('tipoDocumentoId')?.value;
    this.clienteService.getNumeroDocumento(numero).subscribe(resp => {
      if (resp) {
        this.cliente = resp;
        this.frmDefault.tipoDocumentoId = resp.tipoDocumento?.id;
        this.frmDefault.numDocumento = resp.numeroDocumento;
        this.frmDefault.nomApellRz = resp.nomApellRz;
        this.frmDefault.correo = resp.email;
        this.isCliente = true
        this.isUsuario = (resp.usuario) ? true : false;
      }
      this.createForm();

    }, err => {
      console.log("Entro")
    }, () => {
      this.formNewCuenta.get('tipoDocumentoId')?.setValue(tipoDocumentoId);
      //this.formNewCuenta.get('numeroDocumento')?.setValue(numero);
    })

  }

  /*   findByCelular(event: any) {
      const celular = event.target.value;
      const tipoDocumentoId = this.formNewCuenta.get('tipoDocumentoId')?.value;
      const numeroDocumento = this.formNewCuenta.get('numeroDocumento')?.value;
      const nomApellRz = this.formNewCuenta.get('nomApellRz')?.value;
      const direccion = this.formNewCuenta.get('direccion')?.value;

      this.clienteService.getCelular(celular).subscribe(resp => {
        this.cliente = resp;
        this.frmDefault.tipoDocumentoId = resp.tipoDocumento?.id;
        this.frmDefault.numDocumento = resp.numeroDocumento;
        this.frmDefault.nomApellRz = resp.nomApellRz;
        this.frmDefault.correo = resp.email;
        this.createForm();

      }, () => {
        this.formNewCuenta.get('tipoDocumentoId')?.setValue(tipoDocumentoId);
        this.formNewCuenta.get('numeroDocumento')?.setValue(numeroDocumento);
        this.formNewCuenta.get('nomApellRz')?.setValue(nomApellRz);
        this.formNewCuenta.get('direccion')?.setValue(direccion);
        this.formNewCuenta.get('celular')?.setValue(celular);
      })

    } */

  resetForm() {
    this.formNewCuenta.reset();
  }

}


interface FrmCrearCuentaDefault {
  tipoDocumentoId?: number,
  numDocumento?: string,
  nomApellRz?: string,
  correo?: string,
  clave?: string,
  confirmaClave?: string,
}
