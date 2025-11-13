import { Producto } from './producto';

export class ItemPedido {
  producto!: Producto;
  cantidad: number=0;
  costoUnitarioItem : number=0;
  importe: number=0;
  descripcion!: string;
  imagen:string = 'no-imagen.png';
  imagenUri:string = 'no-imagen.png';

  /*
  public calcularImporteVentaPersona(): number {
    return this.cantidad * this.importe;
  }

   public calcularCosto(): number {
    return this.cantidad * this.importe;
  } */
}
