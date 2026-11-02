export enum TipoPersonaEnum {
  CLIENTE_PROVEEDOR = 1,
  TRABAJADOR_VENTA = 2,
  TRABAJADOR_CAJA = 3,
  TRABAJADOR_COMPRA = 4,
  TRABAJADOR_PRODUCTO = 5,
  TRABAJADOR_ADMIN = 6,
  TRABAJADOR_OPERACIONES = 7,
}

export const TipoPersonaEtiquetas: Record<TipoPersonaEnum, string> = {
  [TipoPersonaEnum.CLIENTE_PROVEEDOR]: 'Cliente o proveedor',
  [TipoPersonaEnum.TRABAJADOR_VENTA]: 'Empleado para Venta',
  [TipoPersonaEnum.TRABAJADOR_CAJA]: 'Empleado para Caja',
  [TipoPersonaEnum.TRABAJADOR_COMPRA]: 'Empleado para Compra',
  [TipoPersonaEnum.TRABAJADOR_PRODUCTO]: 'Empleado para Producto',
  [TipoPersonaEnum.TRABAJADOR_ADMIN]: 'Empleado para Administrador',
  [TipoPersonaEnum.TRABAJADOR_OPERACIONES]: 'Empleado Operaciones (Venta y Caja)'
};
