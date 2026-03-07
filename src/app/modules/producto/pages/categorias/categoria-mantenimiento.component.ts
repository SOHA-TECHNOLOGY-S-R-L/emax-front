import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Categoria } from '../../../../models/categoria';
import { Multimedia } from '../../../../models/multimedia';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';
import { CategoriaService } from '../../../../services/categoria.service';
import { MultimediaHttpService } from '../../../../services/multimedia-http.service';
import { FormUtils } from '../../../../utils/form-utils';
import { ListMultimediaComponent } from '../../../multimedia/pages/list-multimedia/list-multimedia.component';

@Component({
  selector: 'app-categoria-mantenimiento',
  standalone: true,
  templateUrl: './categoria-mantenimiento.component.html',
  styleUrl: './categoria-mantenimiento.component.css',
  imports: [CommonModule, RouterModule, ReactiveFormsModule]
})
export class CategoriaMantenimientoComponent {
  private activatedRoute = inject(ActivatedRoute);
  public multimediaHttpService = inject(MultimediaHttpService);
  private categoriaService = inject(CategoriaService);
  private router = inject(Router);
  private alertService = inject(AlertService);
  public authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  readonly dialog = inject(MatDialog);

  categoria = signal<Categoria>(new Categoria());
  formCategoria!: FormGroup;
  //verImagenCategoria!: string;
  formUtils = FormUtils;
  titulo: string = "Categoria";
  API_URL_VER_IMAGEN = environment.API_URL_VER_IMAGEN;

  readonly categoriaId = toSignal(
    this.activatedRoute.paramMap.pipe(map(p => +p.get('categoriaId')!)),
    { initialValue: 0 }
  );

  readonly categoriasResource = rxResource({
    stream: () => this.categoriaService.getCategoriasProducto()
  });

  readonly categorias = computed(() => this.categoriasResource.value() ?? []);
  private categoriaEffect = effect(() => {
    const categoriaId = this.categoriaId();
    const categorias = this.categorias();
    if (categoriaId && categorias.length > 0) {
      const categoria = categorias.find(cat => cat.id === categoriaId)!;
      if (categoria.multimedia) {
        categoria.multimedia.urlMultimediaShow = this.API_URL_VER_IMAGEN.concat(categoria.multimedia.nombre)
        this.categoria.set(categoria);
      }
      this.categoria.set(categoria);
    }
  });

  private formEffect = effect(() => {
    const categoria = this.categoria();
    if (!categoria) return;
    this.createForm();
  });



  constructor() { }


  /*  cargarCategoria(categoria: Categoria) {
     const cat = this.categoria();
     if (categoria.multimedia) {
       cat.urlMultimediaImageCategoriaShow = this.API_URL_VER_IMAGEN.concat(categoria.multimedia.nombre)
     }
     return cat;
   }
  */
  createForm(): void {
    const cat = this.categoria();
    this.formCategoria = this.formBuilder.group({
      nombre: [cat.nombre, Validators.required],
      descripcion: [cat.descripcion, Validators.required],
      activa: [cat.activa],
      visibleEnTienda: [cat.visibleEnTienda],
      orden: [cat.orden, Validators.required]
    });
  }


  recuperarValForm() {
    const cat = { ...this.categoria() };
    cat.nombre = this.formCategoria.get('nombre')?.value;
    cat.descripcion = this.formCategoria.get('descripcion')?.value;
    cat.activa = this.formCategoria.get('activa')?.value;
    cat.visibleEnTienda = this.formCategoria.get('visibleEnTienda')?.value;
    cat.orden = this.formCategoria.get('orden')?.value;
    this.categoria.set(cat);
  }

  guardarCategoria() {
    this.recuperarValForm();
    if (this.categoria().id) {
      this.categoriaService.updateCategoria(this.categoria()).subscribe(
        cat => {
          this.alertService.success(`${cat.nombre} actualizada exitosamente`, 'Categoria');
          this.router.navigate(['/productos/categorias']);
        }
      )
    } else {
      this.categoriaService.createCategoria(this.categoria()).subscribe(resp => {
        this.alertService.success('Categoria ha sido creado exitosamente', 'Categoria');
        this.router.navigate(['/productos/categorias']);
      })
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ListMultimediaComponent, {
      data: {
        multimediaPrincipal: true,
      },
      height: 'auto',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(multimedia => {
      //const m = multimedia as Multimedia;
      if (!multimedia || !multimedia[0].mimeType.startsWith('image')) { return; }
      this.multimediaToCategoria(multimedia[0]);
    });
  }

  multimediaToCategoria(multimedia: Multimedia) {
    if (!multimedia) { return; }
    this.recuperarValForm();
    const cat = {
      ...this.categoria(),
      multimedia: {
        ...multimedia,
        urlMultimediaShow: this.API_URL_VER_IMAGEN.concat(multimedia.nombre)
      }
    };
    this.categoria.set(cat);
  }

  /*   subirImagen(fileInput: HTMLInputElement) {
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        const imagen: File = fileInput.files[0];
        if (imagen.type.indexOf('image') >= 0) {
          this.multimediaHttpService.subirImagen(imagen, false).subscribe(resp => {
            this.verImagenCategoria = environment.API_URL_VER_IMAGEN + resp.imagen;
            this.categoria.imagen = resp.imagen;
          })
        } else {
          this.alertService.error('El archivo debe ser del tipo imagen', 'Imagen');
          return;
        }
      }
    } */





}

