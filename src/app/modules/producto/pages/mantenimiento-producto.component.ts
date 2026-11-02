import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { find } from 'lodash-es';
import { map } from 'rxjs';
import { MargenProducto } from '../../../models/margen-producto';
import { MultimediaAsignada } from '../../../models/multimedia-asignada';
import { Producto } from '../../../models/producto';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { CategoriaService } from '../../../services/categoria.service';
import { ProductoService } from '../../../services/producto.service';
import { FormUtils } from '../../../utils/form-utils';
import { AngularMaterialModule } from '../../compartido/angular-material.module';
import { VerMultimediaAsignadaComponent } from '../../compartido/ver-multimedia-asignada/ver-multimedia-asignada.component';
import { ListMultimediaComponent } from '../../multimedia/pages/list-multimedia/list-multimedia.component';
import { MultimediaHttpService } from './../../../services/multimedia-http.service';
import { ColorDetails, ColorEnum, getColorEnumById } from '../../../enums/color.enum';

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
    NgbTooltipModule,
    AngularMaterialModule,
    VerMultimediaAsignadaComponent
  ],
})
export class MantenimientoProductoComponent {
  public multimediaHttpService = inject(MultimediaHttpService);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private activatedRoute = inject(ActivatedRoute);

  readonly dialog = inject(MatDialog);


  materialesResource = rxResource({
    stream: () => this.productoService.getMaterialesProducto(),
  });

  categoriasResource = rxResource({
    stream: () => this.categoriaService.getCategoriasProducto(),
  });


  productosResources = rxResource({
    stream: () => this.productoService.getAllProducto(),
  });

  colores = Object.values(ColorEnum);
  materiales = computed(() => this.materialesResource.value() ?? []);
  categorias = computed(() => this.categoriasResource.value() ?? []);

  colorDetails = ColorDetails;


  producto = signal<Producto>(new Producto());
  productoId = toSignal<number>(
    this.activatedRoute.paramMap.pipe(map((r) => Number(r.get('productoId')!))),
  );

  variante = signal<'Si' | 'No'>('No');
  //productos = signal<Producto[]>([]);

  productosPadre = computed(() => {
    const valor = this.variante();
    if (valor === 'Si') {
      const pr = this.productosResources.value();
      if (pr == null || pr == undefined) {
        return [];
      }
      return pr.filter((p) => p.padreId === null);
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
      //this.formProducto.reset();
    }
  });
  formProducto!: FormGroup;

  verImagenProducto!: string;
  formUtils = FormUtils;
  titulo: string = 'Crear Producto';

  readonly panelOpenState = signal(false);


  constructor(
    private router: Router,
    private alertService: AlertService,
    public authService: AuthService,
    private formBuilder: FormBuilder,
  ) { this.createForm(); }

  cargarProducto(id: number) {
    this.productoService.getProducto(id).subscribe((resp) => {
      resp.padreId ? this.variante.set('Si') : this.variante.set('No');
      this.producto.set(resp);

      this.formProducto.patchValue({
        padreId: resp.padreId,
        nombre: resp.nombre,
        codigo: resp.codigo,
        descripcion: resp.descripcion,
        medidas: resp.medidas,
        peso: resp.peso,
        umbralPocaCantidad: resp.umbralPocaCantidad,
        umbralCantidadAgotada: resp.umbralCantidadAgotada,
        cantidadStock: resp.cantidadStock,
        cantidadVendidos: resp.cantidadVendidos,
        minCantidadPedido: resp.minCantidadPedido,
        maxCantidadPedido: resp.maxCantidadPedido,
        gruposDe: resp.gruposDe,
        costoUnitario: resp.costoUnitario,
        porcentajeIgv: resp.porcentajeIgv,
        activo: resp.activo,
        visibleEnTienda: resp.visibleEnTienda,
        categoriaId: resp.categoria?.id,
        materialId: resp.materialId,
        colorId: (resp.color == null) ? null: ColorDetails[resp.color].id,
        //usoId: resp.usoId,
      });

      this.margenesGanancia.clear();
      resp.margenesProducto.forEach((m) => {
        this.agregrarMargenProducto(
          this.existMargenProducto(m)
        );
      });


    });
  }

  loadedMultimedia(multimediaAsignada: MultimediaAsignada[]) {
    this.producto.update(pr => ({
      ...pr,
      multimediasAsignada: [...multimediaAsignada]
    }))
    console.log("this.producto()", this.producto())
  }

  setVariante(valor: 'Si' | 'No') {
    this.variante.set(valor);
    if (valor === 'No') {
      this.formProducto.get('padreId')?.setValue(null);
    }
  }

  createForm(): void {
    const pr = this.producto();
    this.formProducto = this.formBuilder.group({
      padreId: [pr.padreId],
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

      porcentajeIgv: [
        pr.porcentajeIgv,
        { validators: [Validators.required, Validators.min(0)] },
      ],
      margenesGanancia: this.formBuilder.array([], Validators.minLength(1)),
      activo: [pr.activo],
      visibleEnTienda: [pr.visibleEnTienda],
      categoriaId: [pr.categoria?.id, Validators.required],
      materialId: [pr.materialId, Validators.required],
      colorId: [pr.color, Validators.required],
      //usoId: [pr.usoId, Validators.required],
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
    }
  }

  existMargenProducto(mrgn: MargenProducto) {
    return this.formBuilder.group({
      id: [mrgn.id],
      minCantidad: [
        mrgn.minCantidad,
        [Validators.required, Validators.min(1)],
      ],
      maxCantidad: [mrgn.maxCantidad],
      margen: [mrgn.margen, [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      valorBrutoUnitario: [
        { value: mrgn.valorBrutoUnitario, disabled: true },
        { validators: [Validators.required, Validators.min(0.01)] },
      ],
      fechaInicioOferta: [this.toDateTimeLocal(mrgn.fechaInicioOferta as any)],
      fechaFinOferta: [this.toDateTimeLocal(mrgn.fechaFinOferta as any)],
      valorUnitarioOferta: [mrgn.valorUnitarioOferta, [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      descripcionOferta: [mrgn.descripcionOferta],
      /*       valorNetoUnitario: [
              { value: mrgn.valorNetoUnitario, disabled: true },
              [Validators.required, Validators.min(0.01)],
              // otra manera
              //{ validators: [Validators.required, Validators.min(0.01)] },
            ], */
      igvUnitario: [
        { value: mrgn.igvUnitario, disabled: true },
        [Validators.required, Validators.min(0.01)],
        // otra manera
        //{ validators: [Validators.required, Validators.min(0.01)] },
      ],
      precioUnitario: [{ value: mrgn.precioUnitario, disabled: true }, [Validators.required, Validators.min(0.01)],
      ],
      /*       igvUnitarioOferta: [
              { value: mrgn.igvUnitarioOferta, disabled: true },
              [Validators.required, Validators.min(0.01)],
              // otra manera
              //{ validators: [Validators.required, Validators.min(0.01)] },
            ],
            precioUnitarioOferta: [{ value: mrgn.precioUnitarioOferta, disabled: true }, [Validators.required, Validators.min(0.01)],
            ], */
    });
  }

  newMargenProducto() {
    const formGroup = this.formBuilder.group({
      minCantidad: [1, Validators.min(1)],
      maxCantidad: [1, Validators.min(1)],
      margen: [100, [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      valorBrutoUnitario: [{ value: 0.01, disabled: true }, [Validators.required, Validators.min(0.01)]],
      fechaInicioOferta: [null],
      fechaFinOferta: [null],
      valorUnitarioOferta: [0, [Validators.required, Validators.min(0.00), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      descripcionOferta: [null],
      //valorNetoUnitario: [{ value: 0.01, disabled: true }, [Validators.required, Validators.min(0.01)]],
      igvUnitario: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      precioUnitario: [0.01, [Validators.required, Validators.min(0.01)]],
      //igvUnitarioOferta: [{ value: 0.01, disabled: true }, [Validators.required, Validators.min(0.01)]],
      //precioUnitarioOferta: [0.01, [Validators.required, Validators.min(0.01)]],
    });
    this.agregrarMargenProducto(formGroup);
  }

  agregrarMargenProducto(formGroup: FormGroup) {
    const margenId = formGroup.get('id')?.value;
    this.margenesGanancia.push(formGroup);
    if (!margenId) {
      const ultimoIndice = this.margenesGanancia.length - 1;
      this.calcularPrecioPorMargen(ultimoIndice);
    }
  }

  eliminarMargenProducto(index: number) {
    const id: number = +this.margenesGanancia.controls[index].get('id')?.value;
    this.margenesGanancia.removeAt(index);
  }

  recuperarValForm() {
    const p = { ...this.producto() };

    p.padreId = this.variante() === 'Si'
      ? this.formProducto.get('padreId')?.value
      : null;
    p.nombre = this.formProducto.get('nombre')?.value;
    p.codigo = this.formProducto.get('codigo')?.value;
    p.descripcion = this.formProducto.get('descripcion')?.value;
    p.medidas = this.formProducto.get('medidas')?.value;
    p.peso = this.formProducto.get('peso')?.value;
    p.umbralPocaCantidad = this.formProducto.get('umbralPocaCantidad')?.value;
    p.umbralCantidadAgotada = this.formProducto.get('umbralCantidadAgotada')?.value;
    p.cantidadStock = this.formProducto.get('cantidadStock')?.value;
    p.minCantidadPedido = this.formProducto.get('minCantidadPedido')?.value;
    p.maxCantidadPedido = this.formProducto.get('maxCantidadPedido')?.value;
    p.gruposDe = this.formProducto.get('gruposDe')?.value;
    p.costoUnitario = this.formProducto.get('costoUnitario')?.value;
    p.porcentajeIgv = this.formProducto.get('porcentajeIgv')?.value;

    p.color = getColorEnumById(+this.formProducto.get('colorId')?.value);

    p.materialId = +this.formProducto.get('materialId')?.value;
    //p.usoId = +this.formProducto.get('usoId')?.value;
    p.categoria = find(this.categorias(), {
      id: +this.formProducto.get('categoriaId')?.value,
    });
    p.activo = this.formProducto.get('activo')?.value;
    p.visibleEnTienda = this.formProducto.get('visibleEnTienda')?.value;
    p.margenesProducto = this.margenesGanancia.getRawValue();

    this.producto.set(p);
  }

  calcularPrecio() {
    const margenesGanancia = this.formProducto.get('margenesGanancia',) as FormArray;

    if (margenesGanancia.controls.length < 1) {
      return;
    }

    const costoUnitario: number = +this.formProducto.get('costoUnitario')?.value;
    const porcentajeIgv: number = +this.formProducto.get('porcentajeIgv')?.value;
    /*const costoMasImpuesto: number =
      (costoUnitario * (100 + porcentajeIgv)) / 100; */
    margenesGanancia.controls.forEach((abstractControl) => {
      this.colocarValorParaControl(costoUnitario, porcentajeIgv, abstractControl)
    });

  }

  private colocarValorParaControl(costoUnitario: number, porcentajeIgv: number, abstractControl: AbstractControl) {
    const margen = +abstractControl.get('margen')?.value;

    const valorBrutoUnitario: number = Number((costoUnitario * ((100 + margen) / 100)).toFixed(2));
    abstractControl.get('valorBrutoUnitario')?.setValue(valorBrutoUnitario);

    const igvUnitario = Number((valorBrutoUnitario * (porcentajeIgv / 100)).toFixed(2));
    abstractControl.get('igvUnitario')?.setValue(igvUnitario);

    const precioUnitario: number = Number((valorBrutoUnitario + igvUnitario).toFixed(2));
    abstractControl.get('precioUnitario')?.setValue(precioUnitario);

    //const valorUnitarioOferta = +abstractControl.get('valorUnitarioOferta')?.value || 0.00;
    //abstractControl.get('valorUnitarioOferta')?.setValue(valorUnitarioOferta);

    //const valorNetoUnitario = (valorBrutoUnitario - valorUnitarioOferta);
    //abstractControl.get('valorNetoUnitario')?.setValue(valorNetoUnitario.toFixed(2));

    //const igvUnitarioOferta = (valorNetoUnitario * (porcentajeIgv / 100));
    //abstractControl.get('igvUnitarioOferta')?.setValue(igvUnitarioOferta.toFixed(2));

    //const precioUnitarioOferta: number = (valorNetoUnitario + igvUnitarioOferta);
    //abstractControl.get('precioUnitarioOferta')?.setValue(precioUnitarioOferta.toFixed(2));

  }

  calcularPrecioPorMargen(index: number) {
    const abstractControl = this.margenesGanancia.controls[index];
    if (!abstractControl) {
      return;
    }

    const costoUnitario: number = +this.formProducto.get('costoUnitario')?.value;
    const porcentajeIgv: number = +this.formProducto.get('porcentajeIgv')?.value;
    this.colocarValorParaControl(costoUnitario, porcentajeIgv, abstractControl)
  }

  guardarProducto() {
    this.recuperarValForm();
    const pr = this.producto();

    if (pr.margenesProducto.length == 0) {
      this.alertService.warning(`Debe agregar margenes al producto`, 'Margenes de ganancia',
      );
      return;
    }

    const costoUnitario: number = +pr.costoUnitario;
    const tieneValorBrutoUnitarioInsuficiente = pr.margenesProducto.some(
      (margn) => margn.valorBrutoUnitario < costoUnitario,
    );

    if (tieneValorBrutoUnitarioInsuficiente) {
      this.alertService.error(`Valor Bruto Unitario sin ganancia sobre costo unitario. Corregir!`, 'Margenes de ganancia');
      return;
    }


    const tieneValorOfertaUnitarioInsuficiente = pr.margenesProducto.some(
      (margn) => margn.valorUnitarioOferta <= costoUnitario && margn.fechaInicioOferta != null && margn.fechaFinOferta != null,
    );

    if (tieneValorOfertaUnitarioInsuficiente) {
      this.alertService.error(`Valor Oferta Unitario sin ganancia sobre costo unitario. Corregir!`, 'Margenes de ganancia');
      return;
    }


    const tienePrecioInsuficiente = pr.margenesProducto.some(
      (margn) => margn.precioUnitario < margn.valorBrutoUnitario,
    );
    if (tienePrecioInsuficiente) {
      this.alertService.error(`Precio Unitario no permite ganancia. Corregir!`, 'Margenes de ganancia');
      return;
    }

    const colorId = this.formProducto.get('colorId')?.value;

    const newPr: any = {
      ...pr,
      padreId: pr.padreId,
      color: colorId == null || colorId === '' ? null : Number(colorId),
      materialId: pr.materialId,
      //usoId: pr.usoId,
      categoriaId: pr.categoria?.id,
      estadoProductoId: pr.estadoProducto?.id,
      //categoriaId: pr.categoria ? { ...pr.categoria, productos: [] } : null,
      multimediasAsignada:
        pr.multimediasAsignada?.map((mp) => ({
          /*id: {
            productoId: pr.id,
            multimediaId: mp.multimediaId,
          },*/
          productoId: pr.id,
          multimedia: mp.multimedia,
          visibleEnTienda: mp.visibleEnTienda,
          esPrincipal: mp.esPrincipal,
        })) ?? [],

      margenesProducto:
        pr.margenesProducto?.map((m) => ({
          ...m,
          valorBrutoUnitario: m.valorBrutoUnitario,
          fechaInicioOferta: m.fechaInicioOferta,
          fechaFinOferta: m.fechaFinOferta,
          valorUnitarioOferta: m.valorUnitarioOferta,
          descripcionOferta: m.descripcionOferta,
          //valorNetoUnitario: Number(m.valorNetoUnitario),
          igvUnitario: m.igvUnitario,
          precioUnitario: m.precioUnitario,
          //igvUnitarioOferta: Number(m.igvUnitarioOferta),
          //precioUnitarioOferta: Number(m.precioUnitarioOferta),
          margen: m.margen,
        })) ?? [],
    };
    if (newPr.id) {
      this.productoService.updateProducto(newPr).subscribe((json) => {
        this.alertService.success(`${json?.mensaje}: ${json.producto.nombre}`, 'Producto',);
        this.router.navigate(['/productos']);
      });
    } else {
      this.productoService.createProducto(newPr).subscribe((resp) => {
        this.alertService.success('Producto ha sido creado exitosamente', 'Producto',);
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
      let multimediaAsignada: MultimediaAsignada = new MultimediaAsignada();
      let lstMultimediaAsignada: MultimediaAsignada[] = [];
      for (const multimedia of result) {
        multimediaAsignada.multimedia = multimedia;
        multimediaAsignada.esPrincipal = false;
        multimediaAsignada.visibleEnTienda = true;

        if (indice === 0) {
          multimediaAsignada.esPrincipal = true;
        }
        lstMultimediaAsignada = [
          ...lstMultimediaAsignada,
          { ...multimediaAsignada },
        ];
        indice++;
      }
      this.loadedMultimedia(lstMultimediaAsignada);
    });
  }

  private toDateTimeLocal(value: string | null): string | null {
    if (!value) {
      return null;
    }

    return value.substring(0, 16);
  }

  /*   validarDecimales(event: KeyboardEvent): boolean {
      const input = event.target as HTMLInputElement;
      const valorActual = input.value;

      // Obtener la posición del cursor y la selección actual
      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? 0;

      // Reconstruir cómo quedará el texto si se acepta la nueva tecla
      const nuevoValor = valorActual.slice(0, start) + event.key + valorActual.slice(end);

      // Expresión regular: Permite números enteros opcionales y hasta 2 decimales
      // También permite un punto solo temporalmente mientras el usuario escribe (ej: "3.")
      const regex = /^\d*\.?\d{0,2}$/;

      // Si el nuevo texto no cumple con el formato, se cancela la pulsación
      if (!regex.test(nuevoValor)) {
        event.preventDefault();
        return false;
      }

      return true;
    } */



}
