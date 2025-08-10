import { CommonModule } from '@angular/common';
import { Component, inject, Renderer2 } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Categoria } from '../../../models/categoria';
import { CategoriaService } from '../../../services/categoria.service';

@Component({
  selector: 'menu-tienda',
  templateUrl: './menu-tienda.component.html',
  styleUrl: './menu-tienda.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class MenuTiendaComponent {
  private categoriaService = inject(CategoriaService)
  private router = inject(Router)

  lstCategoria: Categoria[] = []
  constructor(
    private renderer2: Renderer2
  ) {

  }

  ngOnInit(): void {
    //this.productoService.getAllProducto().subscribe(resp => this.lstProductos = resp);
    this.categoriaService.getCategoriasActivas().subscribe(
      resp => {
        this.lstCategoria = resp.sort((a, b) => a.orden - b.orden)
        //const nombresCategorias = this.lstCategoria.map(cat => cat.nombre)
        //this.seoCategoria(nombresCategorias.toString());
        /*       console.log("lstCategoria1", resp)
                    console.log("lstCategoria2", this.lstCategoria) */
        //const inicialCategoria = this.lstCategoria.filter(cat => cat.id == 0)[0];
        //this.outCategoria(inicialCategoria);
      }, err => { },
      () => {
        //la primera ves cargara el init de productos por categoria
        //const inicialCategoria = this.lstCategoria.filter(cat => cat.id == 1)[0];
        //this.emitCategoriaSubject(inicialCategoria);
        this.router.navigate(["/tienda/productos-categoria", 1]);
      }
      );
  }

  emitCategoriaSubject(categoria: Categoria) {
    this.categoriaService.setCategoriaSubject(categoria);
  }
}
