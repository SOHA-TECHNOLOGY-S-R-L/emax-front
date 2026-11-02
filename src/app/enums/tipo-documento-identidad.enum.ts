export enum TipoDocumentoIdentidadEnum {
  DNI = 1,
  CARNET_EXTRANJERIA = 4,
  RUC = 6,
  PASAPORTE = 7,
  OTRO = 8
}

export const TipoDocumentoIdentidadEtiquetas: Record<TipoDocumentoIdentidadEnum, string> = {
  [TipoDocumentoIdentidadEnum.DNI]: 'Documento de Identidad',
  [TipoDocumentoIdentidadEnum.CARNET_EXTRANJERIA]: 'Carnet de extranjería',
  [TipoDocumentoIdentidadEnum.RUC]: 'Registro Único de Contribuyentes',
  [TipoDocumentoIdentidadEnum.PASAPORTE]: 'Pasaporte',
  [TipoDocumentoIdentidadEnum.OTRO]: 'Otro documento de identificación'
};
