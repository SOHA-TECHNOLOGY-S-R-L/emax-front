// 1. Definición de la interfaz para los metadatos
export interface VendedorEnCajaMetadata {
  numeroDocumentoFacturador: string;
  razonSocial: string;
  direccionCompleta: string;
}

// 2. El Enum para el manejo de claves en tu código
export enum VendedorEnCajaEnum {
  SOHA = 'SOHA',
  GRAFIYA = 'GRAFIYA',
  CREATIVO = 'CREATIVO',

}

// 3. Diccionario con los datos equivalentes al constructor de Java
export const VendedorEnCajaEtiquetas: Record<VendedorEnCajaEnum, VendedorEnCajaMetadata> = {
  [VendedorEnCajaEnum.SOHA]: { numeroDocumentoFacturador: "20605836098", razonSocial: "SOHA TECHNOLOGY S.R.L.", direccionCompleta: "URB. SANTA CATALINA MZ.Q - LT.17 - JOSE LUIS BUSTAMANTE Y RIVERO AREQUIPA AREQUIPA" },
  [VendedorEnCajaEnum.GRAFIYA]: { numeroDocumentoFacturador: "10466628269", razonSocial: "GRAFIYA", direccionCompleta: "CALLE PIZARRO 214 B" },
  [VendedorEnCajaEnum.CREATIVO]: { numeroDocumentoFacturador: "10419534833", razonSocial: "CREATIVO", direccionCompleta: "ALGUNA DIRECCION" },

};

// 4. Equivalente al método Java `fromId(Integer id)`
export function getVendedorEnCajaEnumByNumeroDocumento(numeroDocumentoFacturador: string | null): VendedorEnCajaEnum | null {
  if (numeroDocumentoFacturador === null || numeroDocumentoFacturador === undefined) return null;

  const foundKey = Object.keys(VendedorEnCajaEtiquetas).find(
    (key) => VendedorEnCajaEtiquetas[key as VendedorEnCajaEnum].numeroDocumentoFacturador === numeroDocumentoFacturador
  );

  if (!foundKey) {
    throw new Error(`No existe vendedor con numeroDocumento: ${numeroDocumentoFacturador}`);
  }

  return foundKey as VendedorEnCajaEnum;
}
