import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { find } from 'lodash-es';
import { map } from 'rxjs';
import { MargenProducto } from '../../../models/margen-producto';
import { Producto } from '../../../models/producto';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { CategoriaService } from '../../../services/categoria.service';
import { ProductoService } from '../../../services/producto.service';
import { FormUtils } from '../../../utils/form-utils';
import { AngularMaterialModule } from '../../compartido/angular-material.module';
import { VerMultimediaProductoComponent } from '../../compartido/ver-multimedia-producto/ver-multimedia-producto.component';
import { ListMultimediaComponent } from '../../multimedia/pages/list-multimedia/list-multimedia.component';
import { MultimediaProducto } from './../../../models/multimedia-producto';
import { MultimediaHttpService } from './../../../services/multimedia-http.service';
import { MultimediaProductoService } from './../../../services/multimedia-producto.service';

@Component({
  selector: 'app-mantenimiento-producto',
  templateUrl: './mantenimiento-producto.component.html',
  styleUrl: './mantenimiento-producto.component.css',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    VerMultimediaProductoComponent,
  ],
})
export class MantenimientoProductoComponent {
  public multimediaHttpService = inject(MultimediaHttpService);
  private productoService = inject(ProductoService);
  private multimediaProductoService = inject(MultimediaProductoService);
  private categoriaService = inject(CategoriaService);
  private activatedRoute = inject(ActivatedRoute);

  readonly dialog = inject(MatDialog);

  coloresResource = rxResource({
    stream: () => this.productoService.getColoresProducto(),
  });

  materialesResource = rxResource({
    stream: () => this.productoService.getMaterialesProducto(),
  });

  categoriasResource = rxResource({
    stream: () => this.categoriaService.getCategoriasProducto(),
  });

  usosResource = rxResource({
    stream: () => this.productoService.getUsosInternoProducto(),
  });

  productosResources = rxResource({
    stream: () => this.productoService.getAllProducto(),
  });

  colores = computed(() => this.coloresResource.value() ?? []);
  materiales = computed(() => this.materialesResource.value() ?? []);
  categorias = computed(() => this.categoriasResource.value() ?? []);
  usos = computed(() => this.usosResource.value() ?? []);

  //multimediasProducto = signal<MultimediaProducto[]>([]);
  producto = signal<Producto>(new Producto());
  productoId = toSignal<number>(
    this.activatedRoute.paramMap.pipe(map((r) => Number(r.get('productoId')!))),
  );

  variante = signal<'Si' | 'No'>('No');
  //productos = signal<Producto[]>([]);

  productos = computed(() => {
    const valor = this.variante();
    if (valor === 'Si') {
      const pr = this.productosResources.value();
      if (pr == null || pr == undefined) {
        return [];
      }
      return pr.filter((p) => p.padre === null);
    } else {
      return [];
    }
  });

  private productoEffect = effect(() => {
    const id = this.productoId();
    if (id) {
      this.cargarProducto(id);
    } else {
      this.producto.set(new Producto());
    }
  });

  /*   private multimediasProductoEffect = effect(() => {
      const pr = this.producto();
      if (!pr) { return }
      this.cargarMultimediaProducto(pr.id, pr.multimediasProducto);
    }); */

  private formEffect = effect(() => {
    const producto = this.producto();
    if (!producto) return;
    this.createForm();
  });

  //producto: Producto = new Producto();
  formProducto!: FormGroup;

  verImagenProducto!: string;
  formUtils = FormUtils;

  /*   categoriaId!: number;
    materialId!: number;
    colorId!: number;
    usoId!: number; */
  titulo: string = 'Crear Producto';
  //imagenSeleccionada!: File;

  constructor(
    private router: Router,
    private alertService: AlertService,
    public authService: AuthService,
    private formBuilder: FormBuilder,
  ) {}

  cargarProducto(id: number) {
    this.productoService.getProducto(id).subscribe((resp) => {
      this.producto.set(resp);
    });
  }

  cargarMultimediaProducto(id: number) {
    this.multimediaProductoService
      .multimediasProductoByProductoId(id)
      .subscribe((resp) => {
        this.multimediaProductoToProducto(resp);
        //this.multimediasProducto.set(resp);
      });
  }

  multimediaProductoToProducto(multimediaProducto: MultimediaProducto[]) {
    //this.multimediasProducto.update(() => multimediaProducto);
    this.producto().multimediasProducto = [...multimediaProducto];
  }

  setVariante(valor: 'Si' | 'No') {
    this.variante.set(valor);
/*     debugger;
    if (valor === 'Si') {
      const pr = this.productosResources.value();
      if (pr == null || pr == undefined) {
        this.productos.set([]);
        return;
      }
      this.productos.set(pr.filter((p) => p.padre === null));
    } else {
      this.productos.set([]);
    } */
  }

  createForm(): void {
    const pr = this.producto();
    this.formProducto = this.formBuilder.group({
      padreId: [pr.padre?.id, Validators.required],
      nombre: [pr.nombre, Validators.required],
      codigo: [
        pr.codigo,
        //Pateon letras, números y guion . Al menos un número o letra en la cadena.
        { validators: [Validators.required, Validators.minLength(2)] },

        /*       { validators: [Validators.required, Validators.minLength(2), Validators.pattern('^[A-Z0-9-]*[A-Z0-9][A-Z0-9-]*$')] }
         */
      ],
      descripcion: [
        pr.descripcion,
        { validators: [Validators.required, Validators.minLength(2)] },
      ],
      medidas: [
        pr.medidas,
        {
          validators: [
            Validators.minLength(2),
            Validators.pattern(
              '^[0-9]{1,3}([\\.][0-9]{2})?(x|X)?([0-9]{1,3}([\\.][0-9]{2})?)?(x|X)?([0-9]{1,3}([\\.][0-9]{2})?)?\\s(cm|CM|mt|MT)$',
            ),
          ],
        },
      ],
      peso: [
        pr.peso,
        {
          validators: [
            Validators.minLength(4),
            Validators.pattern('^[0-9]{1,3}([(\\.)][0-9]{2})?\\s(kg|KG)$'),
          ],
        },
      ],
      umbralPocaCantidad: [
        pr.umbralPocaCantidad,
        { validators: [Validators.required, Validators.min(1)] },
      ],

      umbralCantidadAgotada: [
        pr.umbralCantidadAgotada,
        { validators: [Validators.required, Validators.min(0)] },
      ],
      /*       cantidadStock: [pr.cantidadStock,
            { validators: [Validators.required, Validators.min(0)] }
            ], */
      cantidadStock: [
        { value: pr.cantidadStock, disabled: true },
        { validators: [Validators.required, Validators.min(0)] },
      ],
      cantidadVendidos: [
        { value: pr.cantidadVendidos, disabled: true },
        { validators: [Validators.required, Validators.min(0)] },
      ],
      minCantidadPedido: [
        pr.minCantidadPedido,
        { validators: [Validators.required, Validators.min(1)] },
      ],
      maxCantidadPedido: [
        pr.maxCantidadPedido,
        { validators: [Validators.required, Validators.min(1)] },
      ],
      gruposDe: [
        pr.gruposDe,
        { validators: [Validators.required, Validators.min(1)] },
      ],
      costoUnitario: [
        pr.costoUnitario,
        { validators: [Validators.required, Validators.min(0)] },
      ],

      //costoPersonalizacion: [pr.costoPersonalizacion, Validators.min(0)],
      //costoUnitarioEmpaque: [pr.costoUnitarioEmpaque, Validators.min(0)],
      //precioBruto: [pr.precioBruto, Validators.min(3)],
      impuestoIgv: [
        pr.impuestoIgv,
        { validators: [Validators.required, Validators.min(18)] },
      ],

      //margenGanancia: [pr.margenGanancia, [Validators.required, Validators.min(0)]],
      //precioNeto: [pr.precioNeto, [Validators.required, Validators.min(0)]],
      //precioBrutoRebajado: [pr.precioBrutoRebajado, Validators.min(2)],
      //precioNetoRabajado: [pr.precioNetoRabajado, Validators.min(3)],
      //fechaPrecioRebajadoDesde: [pr.fechaPrecioRebajadoDesde],
      //fechaPrecioRebajadoHasta: [pr.fechaPrecioRebajadoHasta],
      //imagen: [pr.imagen],

      margenesGanancia: this.formBuilder.array([], Validators.minLength(1)),

      /*       margenesGanancia: this.formBuilder.array([
              minCantidad: [pr.margenProducto?.minCantidad, Validators.min(1)],
              maxCantidad: [pr.margenProducto?.maxCantidad],
              margenGanancia: [pr.margenProducto?.margenGanancia, [Validators.required, Validators.min(1)]],
              precioNeto: [pr.margenProducto?.precioNeto, [Validators.required, Validators.min(1)]],
            ], Validators.minLength(1)), */

      activo: [pr.activo],
      visibleEnTienda: [pr.visibleEnTienda],

      categoriaId: [pr.categoria?.id, Validators.required],
      materialId: [pr.material?.id, Validators.required],
      colorId: [pr.color?.id, Validators.required],
      usoId: [pr.uso?.id, Validators.required],
    });

    this.defaultMargenProducto();
  }

  get margenesGanancia() {
    return this.formProducto.get('margenesGanancia') as FormArray;
  }

  defaultMargenProducto() {
    if (this.producto().margenesProducto.length > 0) {
      this.producto().margenesProducto.forEach((m) => {
        this.agregrarMargenProducto(this.existMargenProducto(m));
      });
    } /*else {
      this.newMargenProducto();
    }*/
  }

  existMargenProducto(margenProducto: MargenProducto) {
    return this.formBuilder.group({
      id: [margenProducto.id],
      minCantidad: [
        margenProducto.minCantidad,
        [Validators.required, Validators.min(1)],
      ],
      maxCantidad: [margenProducto.maxCantidad, Validators.min(1)],
      margen: [margenProducto.margen, [Validators.required, Validators.min(1)]],
      precioNetoSugerido: [
        margenProducto.precioNetoSugerido,
        [Validators.required, Validators.min(0)],
      ],
      precioNeto: [
        margenProducto.precioNeto,
        [Validators.required, Validators.min(0)],
      ],
    });
  }

  newMargenProducto() {
    const formGroup = this.formBuilder.group({
      minCantidad: [1, Validators.min(1)],
      maxCantidad: [],
      margen: [1, [Validators.required, Validators.min(1)]],
      precioNetoSugerido: [1, [Validators.required, Validators.min(0)]],
      precioNeto: [1, [Validators.required, Validators.min(0)]],
    });
    this.agregrarMargenProducto(formGroup);
  }

  agregrarMargenProducto(formGroup: FormGroup) {
    this.margenesGanancia.push(formGroup);
    const ultimoIndice = this.margenesGanancia.length - 1;
    this.calcularPrecioNetoPorMargen(ultimoIndice);
  }

  eliminarMargenProducto(index: number) {
    const id: number = +this.margenesGanancia.controls[index].get('id')?.value;
    /*     if (id) {
      this.productoService.deleteMargenProducto(id).subscribe(m => {
        this.margenesGanancia.removeAt(index);
      })
    } else { */
    this.margenesGanancia.removeAt(index);
    //}
  }

  recuperarValForm() {
    const p = { ...this.producto() };

    p.nombre = this.formProducto.get('nombre')?.value;
    p.codigo = this.formProducto.get('codigo')?.value;
    p.descripcion = this.formProducto.get('descripcion')?.value;
    p.medidas = this.formProducto.get('medidas')?.value;
    p.peso = this.formProducto.get('peso')?.value;
    p.umbralPocaCantidad = this.formProducto.get('umbralPocaCantidad')?.value;
    p.umbralCantidadAgotada = this.formProducto.get(
      'umbralCantidadAgotada',
    )?.value;
    p.cantidadStock = this.formProducto.get('cantidadStock')?.value;
    p.minCantidadPedido = this.formProducto.get('minCantidadPedido')?.value;
    p.maxCantidadPedido = this.formProducto.get('maxCantidadPedido')?.value;
    p.gruposDe = this.formProducto.get('gruposDe')?.value;
    p.costoUnitario = this.formProducto.get('costoUnitario')?.value;
    //p.costoPersonalizacion = this.formProducto.get('costoPersonalizacion')?.value;
    p.impuestoIgv = this.formProducto.get('impuestoIgv')?.value;
    p.margenesProducto = this.margenesGanancia.value;
    //p.precioBrutoRebajado = this.formProducto.get('precioBrutoRebajado')?.value;
    //p.precioNetoRabajado = this.formProducto.get('precioNetoRabajado')?.value;
    //p.fechaPrecioRebajadoDesde = this.formProducto.get('fechaPrecioRebajadoDesde')?.value;
    //p.fechaPrecioRebajadoHasta = this.formProducto.get('fechaPrecioRebajadoHasta')?.value;
    p.color = find(this.colores(), {
      id: +this.formProducto.get('colorId')?.value,
    });
    p.material = find(this.materiales(), {
      id: +this.formProducto.get('materialId')?.value,
    });
    p.uso = find(this.usos(), { id: +this.formProducto.get('usoId')?.value });
    p.categoria = find(this.categorias(), {
      id: +this.formProducto.get('categoriaId')?.value,
    });
    //p.imagen = this.formProducto.get('imagen')?.value;
    p.activo = this.formProducto.get('activo')?.value;
    p.visibleEnTienda = this.formProducto.get('visibleEnTienda')?.value;
    this.producto.set(p);
  }

  calcularPrecioNeto() {
    const margenesGanancia = this.formProducto.get(
      'margenesGanancia',
    ) as FormArray;
    if (margenesGanancia.controls.length > 0) {
      const costoUnitario: number =
        +this.formProducto.get('costoUnitario')?.value;
      const impuestoIgv: number = +this.formProducto.get('impuestoIgv')?.value;
      const costoMasImpuesto: number =
        (costoUnitario * (100 + impuestoIgv)) / 100;
      margenesGanancia.controls.forEach((abstractControl) => {
        const margen = +abstractControl.get('margen')?.value;
        const precioNetoUnitario: number =
          (costoMasImpuesto * (100 + margen)) / 100;
        abstractControl
          .get('precioNetoSugerido')
          ?.setValue(precioNetoUnitario.toString());
        //abstractControl.get('precioNeto')?.setValue(precioNetoUnitario.toString());
      });
    }
  }

  calcularPrecioNetoPorMargen(index: number) {
    const abstractControl = this.margenesGanancia.controls[index];
    if (abstractControl) {
      const costoUnitario: number =
        this.formProducto.get('costoUnitario')?.value;
      const impuestoIgv: number = +this.formProducto.get('impuestoIgv')?.value;
      const costoMasImpuesto: number =
        (costoUnitario * (100 + impuestoIgv)) / 100;

      const margen = +abstractControl.get('margen')?.value;
      const precioNetoUnitario: number =
        (costoMasImpuesto * (100 + margen)) / 100;
      abstractControl
        .get('precioNetoSugerido')
        ?.setValue(precioNetoUnitario.toString());
      //abstractControl.get('precioNeto')?.setValue(precioNetoUnitario.toString());
    }
  }

  guardarProducto() {
    //console.log("this.formProducto", this.formProducto.value);
    this.recuperarValForm();
    const pr = this.producto();

    if (pr.margenesProducto.length == 0) {
      this.alertService.warning(
        `Debe agregar margenes al producto`,
        'Margenes de ganancia',
      );
      return;
    }

    const costoUnitario: number = +pr.costoUnitario;
    const impuestoIgv: number = +pr.impuestoIgv;
    const costoMasImpuesto: number =
      (costoUnitario * (100 + impuestoIgv)) / 100;

    const tienePrecioInsuficiente = pr.margenesProducto.some(
      (margen) => margen.precioNeto < costoMasImpuesto,
    );
    if (tienePrecioInsuficiente) {
      this.alertService.error(
        `Precio Neto no cubre costo con impuesto. Corregir!`,
        'Margenes de ganancia',
      );
      return;
    }

    const newPr: any = {
      ...pr,
      categoria: pr.categoria ? { ...pr.categoria, productos: [] } : null,

      multimediasProducto:
        pr.multimediasProducto?.map((mp) => ({
          id: {
            productoId: pr.id,
            multimediaId: mp.multimedia.id,
          },
          visibleEnTienda: mp.visibleEnTienda,
          esPrincipal: mp.esPrincipal,
        })) ?? [],

      margenesProducto:
        pr.margenesProducto?.map((m) => ({
          ...m,
          precioNetoSugerido: Number(m.precioNetoSugerido),
          precioNeto: Number(m.precioNeto),
          margen: Number(m.margen),
        })) ?? [],
    };
    //debugger;
    //console.log(JSON.stringify(newPr));
    if (newPr.id) {
      this.productoService.updateProducto(newPr).subscribe((json) => {
        this.alertService.success(
          `${json?.mensaje}: ${json.producto.nombre}`,
          'Producto',
        );
        this.router.navigate(['/productos']);
      });
    } else {
      this.productoService.createProducto(newPr).subscribe((resp) => {
        this.alertService.success(
          'Producto ha sido creado exitosamente',
          'Producto',
        );
        this.router.navigate(['/productos']);
      });
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ListMultimediaComponent, {
      data: {
        multimediaPrincipal: true,
      },
      height: 'auto',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      let indice = 0;
      let multimediaProducto: MultimediaProducto = new MultimediaProducto();
      let lstMultimediaProducto: MultimediaProducto[] = [];
      for (const multimedia of result) {
        multimediaProducto.multimedia = multimedia;
        multimediaProducto.esPrincipal = false;
        multimediaProducto.visibleEnTienda = true;

        if (indice === 0) {
          multimediaProducto.esPrincipal = true;
        }
        lstMultimediaProducto = [
          ...lstMultimediaProducto,
          { ...multimediaProducto },
        ];
        indice++;
      }
      console.log(result);
      this.multimediaProductoToProducto(lstMultimediaProducto);
    });
  }

  /*   cargarDatosAuxiliares(): void {
      this.productoService.getColoresProducto()
        .subscribe(resp => this.colores.set(resp));

      this.productoService.getMaterialesProducto()
        .subscribe(resp => this.materiales.set(resp));

      this.categoriaService.getCategoriasProducto()
        .subscribe(resp => this.categorias.set(resp));

      this.productoService.getUsosInternoProducto()
        .subscribe(resp => this.usos.set(resp));

    } */
}
