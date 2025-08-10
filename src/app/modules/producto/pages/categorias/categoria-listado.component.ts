import { ProductoService } from './../../../../services/producto.service';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Categoria } from '../../../../models/categoria';
import { environment } from '../../../../../environments/environment';
import { COLOR_ACTIVO_CATEGORIA, ESTADO_ACTIVO_CATEGORIA } from '../../../../constants/color-estado-producto';
import { AuthService } from '../../../../services/auth.service';
import { RouterModule } from '@angular/router';
import { PrimeNgModule } from '../../../compartido/prime-ng.module';
import { AngularMaterialModule } from '../../../compartido/angular-material.module';
import { CategoriaService } from '../../../../services/categoria.service';

@Component({
  selector: 'categoria-listado',
  standalone: true,
  templateUrl: './categoria-listado.component.html',
  styleUrl: './categoria-listado.component.css',
  imports: [CommonModule, RouterModule, AngularMaterialModule]
})
export class CategoriaListadoComponent implements OnInit {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  public authService = inject(AuthService);

  categorias: Categoria[] = [];
  verImagenCategoria!: string;
  estadoActivoCategoria = ESTADO_ACTIVO_CATEGORIA
  constructor() { }

  ngOnInit(): void {
    // Aquí podrías cargar las categorías desde un servicio
    this.categoriaService.getCategoriasProducto().subscribe(categorias => {
      this.categorias = categorias.map(cat => {
        cat.imagen = environment.API_URL_VER_IMAGEN + cat.imagen;
        cat.colorActiva = COLOR_ACTIVO_CATEGORIA[('' + cat.activa) as keyof typeof COLOR_ACTIVO_CATEGORIA];
        cat.cantidadProductos = cat.productos.length;
        return cat;
      })
    })
  }

  eliminarCategoria(id: number): void {

  }

}
