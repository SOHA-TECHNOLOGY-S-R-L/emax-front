import { RenderMode, ServerRoute } from '@angular/ssr';
import { ProductoService } from './services/producto.service';
import { inject } from '@angular/core';
import { Producto } from './models/producto';
import { SeoService } from './services/seo.service';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Server,
  },
  {
    path: 'login',
    renderMode: RenderMode.Client,
  },
  {
    path: 'crear-cuenta',
    renderMode: RenderMode.Client,
  },

  {
    path: 'nosotros',
    renderMode: RenderMode.Server,
  },
  {
    path: 'productos-servicios',
    renderMode: RenderMode.Server,
  },
  {
    path: 'contactanos-cliente',
    renderMode: RenderMode.Server,
  },
  /*
  {
    path: 'clientes',
    renderMode: RenderMode.Client,
  },
  {
    path: 'clientes/form/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'clientes/form',
    renderMode: RenderMode.Client,
  },
  {
    path: 'cajas',
    renderMode: RenderMode.Client,
  },
  {
    path: 'cajas/rpte-caja',
    renderMode: RenderMode.Client,
  },
  {
    path: 'cajas/rpte-caja-por-usuario',
    renderMode: RenderMode.Client,
  },
  {
    path: 'pedidos/listado-ventas',
    renderMode: RenderMode.Client,
  },
  {
    path: 'pedidos/listado-compras',
    renderMode: RenderMode.Client,
  },
  {
    path: 'pedidos/item-producto-cliente-tienda/:clienteId',
    renderMode: RenderMode.Server,
  },
  {
    path: 'pedidos/rpte-pedidos/:tipoPedidoId',
    renderMode: RenderMode.Client,
  },
  {
    path: 'pedidos/pedido-cliente-finalizado/:clienteId',
    renderMode: RenderMode.Client,
  },
  {
    path: 'pedidos/detalle-venta/:pedidoId',
    renderMode: RenderMode.Client,
  },
  {
    path: 'pedidos/detalle-compra/:pedidoId',
    renderMode: RenderMode.Client,
  }, */
  {
    path: 'tienda',
    renderMode: RenderMode.Server,
  },
  {
    path: 'tienda/productos-categoria/:categoriaId',
    renderMode: RenderMode.Server,
  },
  {
    path: 'tienda/item-producto-cliente-online/:productoId',
    renderMode: RenderMode.Server,
    /*getPrerenderParams: async () => {
      const productoService = inject(ProductoService);
      const seoService = inject(SeoService);

      const ids = await productoService.getIdsProductosActivosHowPromise();
      console.log("IDSSSS", ids);
      return ids.map(id => ({ productoId: id.toString() }));
      return [{ productoId: '1' }, { productoId: '2' }, { productoId: '3' }];

    },*/
  },
  /*{
    path: 'pedidos/item-producto-cliente-online/:productoId',
    renderMode: RenderMode.Server,
    getPrerenderParams: async () => {
      const productoService = inject(ProductoService);
      const seoService = inject(SeoService);

      const ids = await productoService.getIdsProductosActivosHowPromise();
      console.log("IDSSSS", ids);
      return ids.map(id => ({ productoId: id.toString() }));
      return [{ productoId: '1' }, { productoId: '2' }, { productoId: '3' }];

    },
  },*/
  /*   {
      path: 'productos/mantenimiento-producto/:productoId',
      renderMode: RenderMode.Server,
    },
    {
      path: 'productos/categorias/:categoriaId',
      renderMode: RenderMode.Server,
    },
    {
      path: 'productos/productos-categoria/:categoriaId',
      renderMode: RenderMode.Server,
    }, */
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
