import { AfterViewInit, Component, OnInit } from '@angular/core';
import { find } from 'lodash-es';
import { Categoria } from '../../../models/categoria';
import { Color } from '../../../models/color';
import { GenericosDeProducto } from '../../../models/genericos-de-producto';
import { Material } from '../../../models/material';
import { Producto } from '../../../models/producto';
import { Uso } from '../../../models/uso';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { ProductoService } from '../../../services/producto.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AngularMaterialModule } from '../../compartido/angular-material.module';

@Component({
  selector: 'app-form-producto',
  templateUrl: './form-producto.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AngularMaterialModule]

})
export class FormProductoComponent implements OnInit, AfterViewInit {

  producto: Producto = new Producto();
  colores: Color[] = [];
  materiales: Material[] = [];
  //patronRegexpMedidas = "[0-9]{3}([X])[0-9]{3}*";
  //origenes: Origen[]=[];
  //empaques: Empaque[]=[];
  categorias: Categoria[] = [];
  usos: Uso[] = [];
  //tipoDocumentos: TipoDocumento[]=[];
  titulo: string = "Crear Producto";
  //genericosDeProducto = new GenericosDeProducto();
  genericosDeProducto: GenericosDeProducto[] = [];
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
    console.log("ngAfterViewInit", this.genericosDeProducto);
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
    this.productoService.getCategoriasProducto().subscribe(resp => this.categorias = resp);
    this.productoService.getUsosInternoProducto().subscribe(resp => this.usos = resp);
    //this.genericosDeProductoService.getGenericos().subscribe(result =>{
    //  this.genericosDeProducto = result
    //  this.colores =  result.filter(p => p.id>=10 && p.id<30);
    //  this.materiales = result.filter(p => p.id>=30 && p.id<50);
    //  this.origenes = result.filter(p => p.id>=50 && p.id<70);
    //  this.empaques = result.filter(p => p.id>=70 && p.id<90);
    //  this.categorias = result.filter(p => p.id>=90 && p.id<100);
    //  this.usos = result.filter(p => p.id>=100 && p.id<120);
    //});
  }


  findObjectInGenericos(id: number) {
    console.log("findObjectInGenericos", this.genericosDeProducto);
    return find(this.genericosDeProducto, { "id": id })
  }

  create(): void {
    console.log(this.producto);
    /*     this.producto.peso = this.producto.peso?.toUpperCase();
        this.producto.medidas = this.producto.medidas?.toUpperCase(); */
    this.productoService.createProducto(this.producto).subscribe(
      producto => {
        // swal.fire('Nuevo cliente', `El cliente ${cliente.nombres} ha sido creado con éxito`, 'success');
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
    //this.cliente.pedidos = [];
    console.log(this.producto);
    /*     this.producto.peso = this.producto.peso?.toUpperCase();
        this.producto.medidas = this.producto.medidas?.toUpperCase(); */
    this.productoService.updateProducto(this.producto).subscribe(
      json => {
        this.alertService.success(`${json.mensaje}: ${json.producto.nombre}`, 'Producto actualizado');
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
    //this.progreso = 0;
    //console.log(this.fotoSeleccionada);
    if (this.imagenSeleccionada!.type.indexOf('image') < 0) {
      this.alertService.error('El archivo debe ser del tipo imagen', 'Imagen');
      //   this.fotoSeleccionada = null;
    }
  }


  /*     subirFoto() {
        if (!this.imagenSeleccionada) {
            this.alertService.error('Debe seleccionar una imagen', 'Imagen');

        } else {
          this.productoService.subirImagen(this.imagenSeleccionada, this.producto.id)
            .subscribe(producto => {
              this.producto = producto;
              this.alertService.info('La foto se ha subido completamente!', 'Imagen');

            });
        }
      } */

}
