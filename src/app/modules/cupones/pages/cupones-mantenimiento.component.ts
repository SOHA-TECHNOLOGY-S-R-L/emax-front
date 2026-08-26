import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { Categoria } from '../../../models/categoria';
import { Cupon } from '../../../models/cupon';
import { CuponAsignado } from '../../../models/cupon-asignado';
import { Persona } from '../../../models/persona';
import { Producto } from '../../../models/producto';
import { AlertService } from '../../../services/alert.service';
import { CategoriaService } from '../../../services/categoria.service';
import { CuponService } from '../../../services/cupon.service';
import { PersonaService } from '../../../services/persona.service';
import { ProductoService } from '../../../services/producto.service';
import { FormUtils } from '../../../utils/form-utils';
import { AngularMaterialModule } from '../../compartido/angular-material.module';
import { ChipsAutocompleteResource } from '../../compartido/chips-autocomplete-resource/chips-autocomplete-resource';
import { AuthService } from './../../../services/auth.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-cupones-mantenimiento',
  standalone: true,
  templateUrl: './cupones-mantenimiento.component.html',
  styleUrl: './cupones-mantenimiento.component.css',
  imports: [CommonModule, RouterModule, FormsModule, NgbTooltipModule, ReactiveFormsModule, AngularMaterialModule, ChipsAutocompleteResource,]
})
export class CuponesMantenimientoComponent {

  private fb = inject(FormBuilder);
  private cuponService = inject(CuponService);
  private personaService = inject(PersonaService);
  private categoriaService = inject(CategoriaService);
  private productoService = inject(ProductoService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  private alertService = inject(AlertService);
  public authService = inject(AuthService);


  /*   usosCuponResource = rxResource({
      stream: () => this.cuponService.getUsosCupon(),
    }); */

  cupon = signal<Cupon>(new Cupon());

  personasExcluidas = signal<Persona[]>([]);
  categoriasIncluidas = signal<Categoria[]>([]);
  categoriasExcluidas = signal<Categoria[]>([]);
  productosIncluidos = signal<Producto[]>([]);
  productosExcluidos = signal<Producto[]>([]);


  buscarPersonas = (term: string) => this.personaService.filtrarPersonas(term);
  displayPersona = (persona: Persona | null): string => {
    return persona?.nomApellRz ?? '';
  };
  personaKey = (persona: Persona) => persona.id;
  //personaLabel = (persona: Persona) => persona.nomApellRz;

  buscarCategorias = (term: string) => this.categoriaService.filtrarCategorias(term);
  displayCategoria = (categoria: Categoria) => categoria.nombre;
  categoriaKey = (categoria: Categoria) => categoria.id;
  //categoriaLabel = (categoria: Categoria) => categoria.nombre;

  buscarProductos = (term: string) => this.productoService.filtrarProductos(term);
  displayProducto = (producto: Producto) => producto.nombre;
  productoKey = (producto: Producto) => producto.id;
  //productoLabel = (producto: Producto) => producto.nombre;

  codigoCupon = toSignal<string>(
    this.activatedRoute.paramMap.pipe(map((r) => r.get('codigoCupon')!)),
  );

  //isCombinado = signal<boolean>(false);
  isCaducidad = signal<boolean>(true);
  //usoCupon = signal<'INDIVIDUAL' | 'COMBINADO'>('INDIVIDUAL');


  formCupon = this.fb.group({
    codigo: ['',
      { validators: [Validators.required, Validators.minLength(2), Validators.pattern(/^(?=.*)(?=.*[a-zA-Z]).+$/)] }
    ],
    descripcion: ['',
      { validators: [Validators.required, Validators.minLength(2)] },
    ],
    fchHoraCaducidad: this.fb.control<Date | null>(null),
    //horaCaducidad: [null, { updateOn: 'blur' }],
    //horaCaducidad: this.formBuilder.control(new Date, {updateOn: 'blur'}),
    caducidad: [true],
    importe: [0.1,
      { validators: [Validators.required, Validators.min(0.1)] },
    ],
    gastoMinimoProductos: this.fb.control<number | null>(null, Validators.min(0.1)),
    gastoMaximoProductos: this.fb.control<number | null>(null, Validators.min(0.1)),
    aplicaPersonasConPedidos: [false],

    limiteUsoDelCupon: this.fb.control<number | null>(null, [Validators.min(1), Validators.pattern(/^\d+$/)]),
    limiteUsoNProductosPedido: this.fb.control<number | null>(null, [Validators.min(1), Validators.pattern(/^\d+$/)]),
    limiteUsoPorPersona: this.fb.control<number | null>(null, [Validators.min(1), Validators.pattern(/^\d+$/)]),
    usoCombinado: [false],

    tipoDescuentoCupon: ['', Validators.required],
    //usoCupon: ['INDIVIDUAL', Validators.required],
    excluirProductosOferta: [true],
    activo: [false],
    visibleEnTienda: [false]
  });

  constructor() {
    effect(() => {
      const codigo = this.codigoCupon();
      if (codigo) {
        this.cargarCupon(codigo);
      }
      /*       else {
              this.cupon.set(new Cupon());
            } */
    });
  }


  formUtils = FormUtils;
  titulo: string = 'Crear Cupon';

  tiposDescuentoCuponResource = rxResource({
    stream: () => this.cuponService.getTiposDescuentoCupon(),
  });

  /*   usosCuponResource = rxResource({
      stream: () => this.cuponService.getUsosCupon(),
    }); */



  personSelecToInForm(persona: Persona) {
    //this.inPersona.set(persona);
  }

  cargarCupon(codigo: string) {
    this.cuponService.getCuponByCodigo(codigo).subscribe((resp) => {
      this.cupon.set(resp);
      //resp.usoCupon === "INDIVIDUAL" : this.isIndividual.set(true) ? this.isIndividual.set(false);
      this.formCupon.patchValue({
        codigo: resp.codigo,
        descripcion: resp.descripcion,
        caducidad: resp.caducidad,
        fchHoraCaducidad: resp.fchHoraCaducidad,
        limiteUsoDelCupon: resp.limiteUsoDelCupon,
        limiteUsoNProductosPedido: resp.limiteUsoNProductosPedido,
        limiteUsoPorPersona: resp.limiteUsoPorPersona,
        usoCombinado: resp.usoCombinado,
        excluirProductosOferta: resp.excluirProductosOferta,
        tipoDescuentoCupon: resp.tipoDescuentoCupon,
        importe: resp.importe,
        gastoMinimoProductos: resp.gastoMinimoProductos,
        gastoMaximoProductos: resp.gastoMaximoProductos,
        visibleEnTienda: resp.visibleEnTienda,
        //activo: resp.activo,
      });

      /*       if (resp.usoCupon === "INDIVIDUAL") {
              this.isIndividual.set(true);
            } else {
              this.isIndividual.set(false);
            } */

      this.personaService.personasByIds(resp.personasExcluidas).subscribe(personas => {
        this.personasExcluidas.set(personas);
      });

      const categoriaIds = (resp.categoriasIncluidas.trim().length === 0) ? resp.categoriasExcluidas :
        resp.categoriasIncluidas + ',' + resp.categoriasExcluidas

      this.productoService.categoriaPorIds(categoriaIds).subscribe(categs => {

        const idsSetIncluidas = new Set(resp.categoriasIncluidas?.split(',').map(Number));
        this.categoriasIncluidas.set(
          categs.filter(c => idsSetIncluidas.has(c.id))
        );

        const idsSetExcluidas = new Set(resp.categoriasExcluidas?.split(',').map(Number));
        this.categoriasExcluidas.set(
          categs.filter(c => idsSetExcluidas.has(c.id)));
      });

      const productoIds = (resp.productosIncluidos.trim().length === 0) ? resp.productosExcluidos :
        resp.productosIncluidos + ',' + resp.productosExcluidos

      this.productoService.productosByIds(productoIds).subscribe(prods => {

        const idsSetIncluidos = new Set(resp.productosIncluidos?.split(',').map(Number));
        this.productosIncluidos.set(
          prods.filter(p => idsSetIncluidos.has(p.id))
        );

        const idsSetExcluidas = new Set(resp.productosExcluidos?.split(',').map(Number));
        this.productosExcluidos.set(
          prods.filter(p => idsSetExcluidas.has(p.id)));
      });



    });
  }



  recuperarValForm() {
    const cp = {
      ...this.cupon(),
      ...this.formCupon.getRawValue(),
    } as Cupon;

    cp.categoriasIncluidas = this.categoriasIncluidas().map(cat => cat.id).join(',');
    cp.categoriasExcluidas = this.categoriasExcluidas().map(cat => cat.id).join(',');
    cp.productosIncluidos = this.productosIncluidos().map(prod => prod.id).join(',');
    cp.productosExcluidos = this.productosExcluidos().map(prod => prod.id).join(',');
    cp.personasExcluidas = this.personasExcluidas().map(persona => persona.id).join(',');

    this.cupon.set(cp);
  }

  /*   changeUsoCupon(event: Event) {
      const checkbox = event.target as HTMLInputElement;
      this.isCombinado.set(checkbox.checked);
      if (checkbox.checked) {
        this.formCupon.controls['usoCupon'].setValue('INDIVIDUAL');
      } else {
        this.formCupon.controls['usoCupon'].setValue('COMBINADO');
      }
    } */

  changeCaducidad(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.isCaducidad.set(checkbox.checked);
    if (checkbox.checked) {
      this.formCupon.controls['caducidad'].setValue(true);
    } else {
      this.formCupon.controls['caducidad'].setValue(false);
      this.formCupon.controls['fchHoraCaducidad'].setValue(null);
    }
  }


  guardarCupon() {
    this.recuperarValForm();
    const cp = this.cupon();


    /*     console.log(this.formCupon.errors);

        Object.entries(this.formCupon.controls)
          .forEach(([nombre, control]) => {

            console.log({
              campo: nombre,
              valor: control.value,
              valido: control.valid,
              errores: control.errors
            });

          }); */

    console.log("cp", cp);

    if (this.codigoCupon()) {
      this.cuponService.updateCupon(cp).subscribe((resp) => {
        this.alertService.success(`Cupon ha sido actualizado exitosamente`, 'Cupon de descuento',);
        this.router.navigate(['/cupones']);
      });
    } else {
      this.cuponService.createCupon(cp).subscribe((resp) => {
        this.alertService.success('Cupon ha sido creado exitosamente', 'Cupón de descuento',);
        this.router.navigate(['/cupones']);
      });
    }
  }

  /*   openDialog(): void {
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
    } */



}
