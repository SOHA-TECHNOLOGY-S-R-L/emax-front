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
    path: 'tienda/productos-categoria/:nombre',
    renderMode: RenderMode.Server,
    //getPrerenderParams: async () => {
      /*const productoService = inject(ProductoService);
      const seoService = inject(SeoService);

      const ids = await productoService.getIdsProductosActivosHowPromise();
      console.log("IDSSSS", ids);
      return ids.map(id => ({ productoId: id.toString() }));*/

      /*return [{ nombre: 'Tienda' },
      { nombre: 'Tazas publicitarias' },
      { nombre: 'Tomatodos publicitarios' },
      { nombre: 'Vasos publicitarios' },
      { nombre: 'Libretas publicitarias' },
      { nombre: 'Lapiceros publicitarios' },
      { nombre: 'Máquinas e insumos' },
      { nombre: 'Antiestres' },
      ];*/

    //},
  },
  {
    path: 'tienda/productos-categoria/:nombre/item-producto-cliente-online/:productoCodigo',
    renderMode: RenderMode.Server,
    //getPrerenderParams: async () => {
      /*const productoService = inject(ProductoService);
      const seoService = inject(SeoService);

      const ids = await productoService.getIdsProductosActivosHowPromise();
      console.log("IDSSSS", ids);
      return ids.map(id => ({ productoId: id.toString() }));*/
      /*
      return [
        {
          nombre: 'Antiestres',
          productoCodigo: 'ANT-COR'
        },
        {
          nombre: 'Antiestres',
          productoCodigo: 'ANT-MED'
        },
        {
          nombre: 'Antiestres',
          productoCodigo: 'ANT-MIN'
        },
        {
          nombre: 'Antiestres',
          productoCodigo: 'ANT-MU'
        },
        {
          nombre: 'Antiestres',
          productoCodigo: 'ANT-PE'
        },
        {
          nombre: 'Máquinas e insumos',
          productoCodigo: 'C-1'
        },
        {
          nombre: 'Vasos publicitarios',
          productoCodigo: 'CH-1'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LA-1'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LA-3'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LA-4'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LA-ECO1'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LA-ECO2'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LA-ECO3'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LA-ECO4'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LA-ME1'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LA-ME2'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LA-ME3'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LA-ME4'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LAP-AZ1'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LAP-BA'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LAP-GM'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LAP-GM2'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LAP-GM3'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LAP-GM4'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LAP-GM5'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LAP-GR4'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LAP-PR1'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LAP-TR1'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LAP-TR2'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LAP-TR3'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LAP-TR4'
        },
        {
          nombre: 'Lapiceros publicitarios',
          productoCodigo: 'LAP-VDA'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LB-1'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LB-2'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LB-3'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LB-4'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LBC-1'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LBC-2'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LBC-3'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LBC-4'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LI-PU2'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LI-PU3'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LI-PU4'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LI-PUS01'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LI-PUS02'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LI-PUS3'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LI-PUS4'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LIB-CP1'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LIB-CP2'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LIB-CP3'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LIB-ECO1'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LIB-ECO2'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LIB-ECO3'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LIB-ECO4'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LIB-IM-02'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LIB-IM1'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LIB-IM3'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LIB-IM4'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LIB-PS'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LIB-PU1'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LIB-RU1'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LIB-RU2'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LIB-RU3'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LIB-RU4'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LIB-TR-1'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LIB-TR-2'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LIB-TR-3'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LIB-TR-4'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LN-1'
        },
        {
          nombre: 'Libretas publicitarias',
          productoCodigo: 'LR-2'
        },
        {
          nombre: 'Máquinas e insumos',
          productoCodigo: 'MAQ-1'
        },
        {
          nombre: 'Tomatodos publicitarios',
          productoCodigo: 'MG-1'
        },
        {
          nombre: 'Máquinas e insumos',
          productoCodigo: 'MQ-1'
        },
        {
          nombre: 'Máquinas e insumos',
          productoCodigo: 'PL-1'
        },
        {
          nombre: 'Tomatodos publicitarios',
          productoCodigo: 'SR1'
        },
        {
          nombre: 'Antiestres',
          productoCodigo: 'SR2'
        },
        {
          nombre: 'Tomatodos publicitarios',
          productoCodigo: 'SR3'
        },
        {
          nombre: 'Antiestres',
          productoCodigo: 'SR4'
        },
        {
          nombre: 'Vasos publicitarios',
          productoCodigo: 'TA-1'
        },
        {
          nombre: 'Vasos publicitarios',
          productoCodigo: 'TM-2'
        },
        {
          nombre: 'Tomatodos publicitarios',
          productoCodigo: 'TM-I'
        },
        {
          nombre: 'Tomatodos publicitarios',
          productoCodigo: 'TRM-1'
        },
        {
          nombre: 'Tomatodos publicitarios',
          productoCodigo: 'TRM-2'
        },
        {
          nombre: 'Tazas publicitarias',
          productoCodigo: 'TZ-A'
        },
        {
          nombre: 'Tazas publicitarias',
          productoCodigo: 'TZ-C'
        },
        {
          nombre: 'Tazas publicitarias',
          productoCodigo: 'TZ-N'
        },
        {
          nombre: 'Tazas publicitarias',
          productoCodigo: 'TZ-R'
        },
        {
          nombre: 'Tazas publicitarias',
          productoCodigo: 'TZ1'
        },
        {
          nombre: 'Tazas publicitarias',
          productoCodigo: 'TZ2'
        },
        {
          nombre: 'Tazas publicitarias',
          productoCodigo: 'TZ3'
        },
        {
          nombre: 'Tazas publicitarias',
          productoCodigo: 'TZ4'
        }
      ]*/


    //},


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
