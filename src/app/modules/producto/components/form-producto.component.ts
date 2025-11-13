import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Categoria } from '../../../models/categoria';
import { Color } from '../../../models/color';
import { Material } from '../../../models/material';
import { Producto } from '../../../models/producto';
import { Uso } from '../../../models/uso';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { ProductoService } from '../../../services/producto.service';
import { AngularMaterialModule } from '../../compartido/angular-material.module';
import { CategoriaService } from './../../../services/categoria.service';

@Component({
  selector: 'app-form-producto',
  templateUrl: './form-producto.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule]

})
export class FormProductoComponent implements OnInit, AfterViewInit {
  private CategoriaService = inject( CategoriaService);
  producto: Producto = new Producto();
  colores: Color[] = [];
  materiales: Material[] = [];
  categorias: Categoria[] = [];
  usos: Uso[] = [];
  titulo: string = "Crear Producto";
  errores: string[] = [];
  private imagenSeleccionada!: File;

  constructor(private productoService: ProductoService,
    private router: Router,
    private alertService: AlertService,
    public authService: AuthService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.cargarDatosAuxiliares();

  }

  ngAfterViewInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('productoId')!;
      if (id) {
        this.productoService.getProducto(id).subscribe(resp => {
          this.producto = resp
          //  this.producto.categoria = Object.assign({},this.findObjectInGenericos(this.producto.categoriaId))
          //  this.producto.uso = Object.assign({}, this.findObjectInGenericos(this.producto.usoId!));

        });
        //console.log("producto=>", this.producto);
      } else {
        // console.log("producto.sinnada", this.producto);

      }
    });


    /*     let colores =  this.producto.genericos.filter(p => p.id>=10 && p.id<30);
        let materiales = this.producto.genericos.filter(p => p.id>=30 && p.id<50);
        let origenes = this.producto.genericos.filter(p => p.id>=50 && p.id<70);
        let empaques = this.producto.genericos.filter(p => p.id>=70 && p.id<90);
        let categorias = this.producto.genericos.filter(p => p.id>=90 && p.id<100);
        let usos = this.producto.genericos.filter(p => p.id>=100 && p.id<120);
        this.colores = [...colores];
        this.materiales=[...materiales]
        this.origenes=[...origenes]
        this.empaques=[...empaques]
        this.categorias=[...categorias]
        this.usos=[...usos] */

    //console.log("categorias",this.categorias);
  }

  cargarDatosAuxiliares(): void {
    this.productoService.getColoresProducto().subscribe(resp => this.colores = resp);
    this.productoService.getMaterialesProducto().subscribe(resp => this.materiales = resp);
    this.CategoriaService.getCategoriasProducto().subscribe(resp => this.categorias = resp);
    this.productoService.getUsosInternoProducto().subscribe(resp => this.usos = resp);
  }



  create(): void {
    this.productoService.createProducto(this.producto).subscribe(
      producto => {
        this.alertService.success(`${producto.nombre} ha sido creado con éxito`, 'Nueo producto');
        this.router.navigate(['/productos']);

      },
      err => {
        this.errores = err.error.errors as string[];
        console.error('Código del error desde el backend: ' + err.status);
        console.error(err.error.errors);
      }
    );
  }

  update(): void {
    this.productoService.updateProducto(this.producto).subscribe(
      json => {
        this.alertService.success(`${json?.mensaje}: ${json.producto.nombre}`, 'Producto actualizado');
        this.router.navigate(['/pr/productos']);

      },
      err => {
        this.errores = err.error.errors as string[];
        console.error('Código del error desde el backend: ' + err.status);
        console.error(err.error.errors);
      }
    )
  }

  compareValueWithOptions(value: any, option: any): boolean {
    if (value === undefined && option === undefined) {
      return true;
    }
    return value === null || option === null || value === undefined || option === undefined ? false : value.id === option.id;
  }

  seleccionarImagen(event: any) {
    this.imagenSeleccionada = event.target.files[0];

    if (this.imagenSeleccionada!.type.indexOf('image') < 0) {
      this.alertService.error('El archivo debe ser del tipo imagen', 'Imagen');
      //   this.fotoSeleccionada = null;
    }
  }




}
