export interface EstadoMetadata {
  id: number;
  estado: string;
  hexadecimal: string | null;
}

export enum EstadoPedidoEnum {
  PENDIENTE = 'PENDIENTE',
  VENCIDO = 'VENCIDO',
  DEVUELTO = 'DEVUELTO',
  ANULADO = 'ANULADO',
  ENTREGADO = 'ENTREGADO',
  ADQUIRIDO = 'ADQUIRIDO'
}

export const EstadoPedidoEtiquetas: Record<EstadoPedidoEnum, EstadoMetadata> = {
  [EstadoPedidoEnum.PENDIENTE]: { id: 1, estado:'Pendiente', hexadecimal: "#1086b1" },
  [EstadoPedidoEnum.VENCIDO]: { id: 2, estado:'Vencido', hexadecimal: "#EC624B" },
  [EstadoPedidoEnum.DEVUELTO]: { id: 3, estado:'Devuelto', hexadecimal: "#E9426D" },
  [EstadoPedidoEnum.ANULADO]: { id: 4, estado:'Anulado', hexadecimal: "#555555" },
  [EstadoPedidoEnum.ENTREGADO]: { id: 5, estado:'Entregado', hexadecimal: "#5BC500" },
  [EstadoPedidoEnum.ADQUIRIDO]: { id: 6, estado:'Adquirido', hexadecimal: "#5BC500" },
};

export function getEstadoPedidoEnumById(id: number | null): EstadoPedidoEnum | null {
  if (id === null || id === undefined) return null;

  const foundKey = Object.keys(EstadoPedidoEtiquetas).find(
    (key) => EstadoPedidoEtiquetas[key as EstadoPedidoEnum].id === id
  );

  if (!foundKey) {
    throw new Error(`No existe un color con id: ${id}`);
  }

  return foundKey as EstadoPedidoEnum;
}

//para acceder a las propiedades de la etiqueta, como id y hexadecimal
export function getEtiquetaEstadoPedidoEnum(key: any): EstadoMetadata {
  return EstadoPedidoEtiquetas[key as EstadoPedidoEnum];
}
