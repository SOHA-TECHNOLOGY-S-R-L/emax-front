import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MenuTiendaComponent } from '../compartido/menus-nav/menu-tienda.component';
import { ProductosPorCategoriaComponent } from '../producto/pages/productos-por-categoria.component';
import { Categoria } from '../../models/categoria';

@Component({
  selector: 'app-tienda',
  standalone: true,
  templateUrl: './tienda.component.html',
  styleUrl: './tienda.component.css',
  imports: [MenuTiendaComponent, RouterOutlet]
})
export class TiendaComponent {

  categoria!: Categoria;
  constructor() { }

  categoriaSelect(categoria: Categoria) {
    this.categoria = categoria
  }

  /*   categoriaSelect(categoria: Categoria):Categoria {
      return categoria;
    } */
}
