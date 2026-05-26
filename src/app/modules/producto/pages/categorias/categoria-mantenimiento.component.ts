import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Categoria } from '../../../../models/categoria';
import { Multimedia } from '../../../../models/multimedia';
import { MultimediaAsignada } from '../../../../models/multimedia-asignada';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';
import { CategoriaService } from '../../../../services/categoria.service';
import { MultimediaHttpService } from '../../../../services/multimedia-http.service';
import { FormUtils } from '../../../../utils/form-utils';
import { ListMultimediaComponent } from '../../../multimedia/pages/list-multimedia/list-multimedia.component';
import { VerMultimediaAsignadaComponent } from '../../../compartido/ver-multimedia-asignada/ver-multimedia-asignada.component';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';

@Component({
  selector: 'app-categoria-mantenimiento',
  standalone: true,
  templateUrl: './categoria-mantenimiento.component.html',
  styleUrl: './categoria-mantenimiento.component.css',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule, VerMultimediaAsignadaComponent]

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

      if (categoria.multimediasAsignada.length > 0 ) {
        const primerElemento = categoria.multimediasAsignada.find((m) => m.esPrincipal) || categoria.multimediasAsignada[0];
        categoria.multimediasAsignada = [primerElemento];
        categoria.multimediasAsignada.map((mp) => {
          mp.multimedia.urlMultimediaShow = this.API_URL_VER_IMAGEN.concat(mp.multimedia.nombre);
          return mp;
        });
        this.categoria.set(categoria);
      }
      this.categoria.set(categoria);

      this.formCategoria.patchValue({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        activa: categoria.activa,
        visibleEnTienda: categoria.visibleEnTienda,
        orden: categoria.orden
      });
    }
  });

  /*   private formEffect = effect(() => {
      const categoria = this.categoria();
      if (!categoria) return;
      this.createForm();
    }); */



  constructor() { this.createForm(); }

  createForm(): void {
    this.formCategoria = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      activa: [true],
      visibleEnTienda: [true],
      orden: [0, Validators.required]
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
    const categoria = this.categoria();
    const newCat: any = {
      ...categoria,
      multimediasAsignada:
        categoria.multimediasAsignada?.map((mp) => ({
          /*id: {
            productoId: pr.id,
            multimediaId: mp.multimediaId,
          },*/
          categoriaId: categoria.id,
          multimedia: mp.multimedia,
          visibleEnTienda: mp.visibleEnTienda,
          esPrincipal: mp.esPrincipal,
        })) ?? [],
    }

    if (newCat.id) {
      this.categoriaService.updateCategoria(newCat).subscribe(
        cat => {
          this.alertService.success(`${cat.nombre} actualizada exitosamente`, 'Categoria');
          this.router.navigate(['/productos/categorias']);
        }
      )
    } else {
      this.categoriaService.createCategoria(newCat).subscribe(resp => {
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

    dialogRef.afterClosed().subscribe(result => {

      if (!result || result.length === 0) {
        return;
      }

      const lstMultimediaAsignada: MultimediaAsignada[] = [];

      result.forEach((multimedia: Multimedia, indice: number) => {

        const multimediaAsignada: MultimediaAsignada = {
          multimedia,
          esPrincipal: indice === 0,
          visibleEnTienda: true
        } as MultimediaAsignada;

        lstMultimediaAsignada.push(multimediaAsignada);
      });

      this.loadedMultimedia(lstMultimediaAsignada);

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

  loadedMultimedia(multimediaAsignada: MultimediaAsignada[]) {
    this.categoria.update(cat => ({
      ...cat,
      multimediasAsignada: [...multimediaAsignada]
    }));
    console.log("this.producto()", this.categoria())
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

