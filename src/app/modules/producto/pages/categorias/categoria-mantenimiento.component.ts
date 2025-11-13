import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { Categoria } from '../../../../models/categoria';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';
import { MediosUtilsService } from '../../../../services/medios-utils.service';
import { ProductoService } from '../../../../services/producto.service';
import { FormUtils } from '../../../../utils/form-utils';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { CategoriaService } from '../../../../services/categoria.service';

@Component({
  selector: 'app-categoria-mantenimiento',
  standalone: true,
  templateUrl: './categoria-mantenimiento.component.html',
  styleUrl: './categoria-mantenimiento.component.css',
  imports: [CommonModule, RouterModule, ReactiveFormsModule]
})
export class CategoriaMantenimientoComponent implements OnInit {

  public mediosUtilsService = inject(MediosUtilsService);
  private categoriaService = inject(CategoriaService);

  categoria: Categoria = new Categoria();
  formCategoria!: FormGroup;
  verImagenCategoria!: string;
  formUtils = FormUtils;
  titulo: string = "Categoria";
  constructor(
    private router: Router,
    private alertService: AlertService,
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {

    this.createForm();

    this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('categoriaId')!;
      if (id) {
        this.categoriaService.getCategoriasProducto().subscribe(categorias => {
          this.categoria = categorias.find(cat => cat.id === id) || new Categoria();
          this.createForm();
          this.verImagenCategoria = environment.API_URL_VER_IMAGEN + this.categoria.imagen;
        });
      } else {
        this.verImagenCategoria = environment.API_URL_VER_IMAGEN + this.categoria.imagen;
        this.createForm();
      }
    });
  }

  createForm(): void {
    this.formCategoria = this.formBuilder.group({
      nombre: [this.categoria?.nombre, Validators.required],
      descripcion: [this.categoria?.descripcion, Validators.required],
      activa: [this.categoria?.activa],
      visibleEnTienda: [this.categoria?.visibleEnTienda],

    });
  }


  recuperarValForm() {
    this.categoria.nombre = this.formCategoria.get('nombre')?.value;
    this.categoria.descripcion = this.formCategoria.get('descripcion')?.value;
    this.categoria.activa = this.formCategoria.get('activa')?.value;
    this.categoria.activa = this.formCategoria.get('visibleEnTienda')?.value;
  }

  guardarCategoria() {
    this.recuperarValForm();
    //console.log("this.categoria", this.categoria);
    //this.categoria.productos = []; // Evitar circular reference
    if (this.categoria.id) {
      this.categoriaService.updateCategoria(this.categoria).subscribe(
        cat => {
          this.alertService.success(`${cat.nombre} actualizada exitosamente`, 'Categoria');
          this.router.navigate(['/productos/categorias']);
        }
      )
    } else {
      this.categoriaService.createCategoria(this.categoria).subscribe(resp => {
        this.alertService.success('Categoria ha sido creado exitosamente', 'Categoria');
        this.router.navigate(['/productos/categorias']);
      })
    }
  }




  isImage(fileInput: HTMLInputElement): boolean {
    return this.mediosUtilsService.isImage(fileInput);
  }


  subirImagen(fileInput: HTMLInputElement) {
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      const imagen: File = fileInput.files[0];
      this.mediosUtilsService.subirImagen(imagen, false).subscribe(resp => {
        this.verImagenCategoria = environment.API_URL_VER_IMAGEN + resp.imagen;
        this.categoria.imagen = resp.imagen;
      })
    }
  }





}

