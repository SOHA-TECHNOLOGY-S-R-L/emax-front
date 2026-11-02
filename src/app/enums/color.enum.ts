// 1. Definición de la interfaz para los metadatos
export interface ColorMetadata {
  id: number;
  color: string;
  hexadecimal: string | null;
}

// 2. El Enum para el manejo de claves en tu código
export enum ColorEnum {
  AMARILLO = 'AMARILLO',
  AZUL = 'AZUL',
  BEIGE = 'BEIGE',
  BLANCO = 'BLANCO',
  BLANCO_CON_AMARILLO = 'BLANCO_CON_AMARILLO',
  BLANCO_CON_AZUL = 'BLANCO_CON_AZUL',
  BLANCO_CON_CAFE = 'BLANCO_CON_CAFE',
  BLANCO_CON_CELESTE = 'BLANCO_CON_CELESTE',
  BLANCO_CON_MORADO = 'BLANCO_CON_MORADO',
  BLANCO_CON_NARANJA = 'BLANCO_CON_NARANJA',
  BLANCO_CON_NEGRO = 'BLANCO_CON_NEGRO',
  BLANCO_CON_ROJO = 'BLANCO_CON_ROJO',
  BLANCO_CON_ROSADO = 'BLANCO_CON_ROSADO',
  BLANCO_CON_VERDE = 'BLANCO_CON_VERDE',
  CAFE = 'CAFE',
  CELESTE = 'CELESTE',
  GRIS_CLARO = 'GRIS_CLARO',
  GRIS_OSCURO = 'GRIS_OSCURO',
  MORADO = 'MORADO',
  NARANJA = 'NARANJA',
  NEGRO = 'NEGRO',
  PURPURA = 'PURPURA',
  ROJO = 'ROJO',
  ROSADO = 'ROSADO',
  VERDE_CLARO = 'VERDE_CLARO',
  VERDE_OSCURO = 'VERDE_OSCURO',
  MULTICOLOR = 'MULTICOLOR',
  TRANSPARENTE = 'TRANSPARENTE',
  OTRO_COLOR = 'OTRO_COLOR'
}

// 3. Diccionario con los datos equivalentes al constructor de Java
export const ColorDetails: Record<ColorEnum, ColorMetadata> = {
  [ColorEnum.AMARILLO]: { id: 1, color: "Amarillo", hexadecimal: "#FFFF00" },
  [ColorEnum.AZUL]: { id: 2, color: "Azul", hexadecimal: "#0000FF" },
  [ColorEnum.BEIGE]: { id: 3, color: "Beige", hexadecimal: "#F5F5DC" },
  [ColorEnum.BLANCO]: { id: 4, color: "Blanco", hexadecimal: "#FFFFFF" },
  [ColorEnum.BLANCO_CON_AMARILLO]: { id: 5, color: "Blanco con amarillo", hexadecimal: "#FFFF00" },
  [ColorEnum.BLANCO_CON_AZUL]: { id: 6, color: "Blanco con azul", hexadecimal: "#0000FF" },
  [ColorEnum.BLANCO_CON_CAFE]: { id: 7, color: "Blanco con café", hexadecimal: "#8B4513" },
  [ColorEnum.BLANCO_CON_CELESTE]: { id: 8, color: "Blanco con celeste", hexadecimal: "#87CEEB" },
  [ColorEnum.BLANCO_CON_MORADO]: { id: 9, color: "Blanco con morado", hexadecimal: "#800080" },
  [ColorEnum.BLANCO_CON_NARANJA]: { id: 10, color: "Blanco con naranja", hexadecimal: "#FFA500" },
  [ColorEnum.BLANCO_CON_NEGRO]: { id: 11, color: "Blanco con negro", hexadecimal: "#000000" },
  [ColorEnum.BLANCO_CON_ROJO]: { id: 12, color: "Blanco con rojo", hexadecimal: "#FF0000" },
  [ColorEnum.BLANCO_CON_ROSADO]: { id: 13, color: "Blanco con rosado", hexadecimal: "#FFC0CB" },
  [ColorEnum.BLANCO_CON_VERDE]: { id: 14, color: "Blanco con verde", hexadecimal: "#008000" },
  [ColorEnum.CAFE]: { id: 15, color: "Café", hexadecimal: "#8B4513" },
  [ColorEnum.CELESTE]: { id: 16, color: "Celeste", hexadecimal: "#87CEEB" },
  [ColorEnum.GRIS_CLARO]: { id: 17, color: "Gris claro", hexadecimal: "#D3D3D3" },
  [ColorEnum.GRIS_OSCURO]: { id: 18, color: "Gris oscuro", hexadecimal: "#555555" },
  [ColorEnum.MORADO]: { id: 19, color: "Morado", hexadecimal: "#800080" },
  [ColorEnum.NARANJA]: { id: 20, color: "Naranja", hexadecimal: "#FFA500" },
  [ColorEnum.NEGRO]: { id: 21, color: "Negro", hexadecimal: "#000000" },
  [ColorEnum.PURPURA]: { id: 22, color: "Purpura", hexadecimal: "#800080" },
  [ColorEnum.ROJO]: { id: 23, color: "Rojo", hexadecimal: "#FF0000" },
  [ColorEnum.ROSADO]: { id: 24, color: "Rosado", hexadecimal: "#FFC0CB" },
  [ColorEnum.VERDE_CLARO]: { id: 25, color: "Verde claro", hexadecimal: "#90EE90" },
  [ColorEnum.VERDE_OSCURO]: { id: 26, color: "Verde oscuro", hexadecimal: "#006400" },
  [ColorEnum.MULTICOLOR]: { id: 27, color: "Verde oscuro", hexadecimal: "#006400" }, // Nota: Dejé los valores que pusiste en Java
  [ColorEnum.TRANSPARENTE]: { id: 28, color: "Transparente", hexadecimal: null },
  [ColorEnum.OTRO_COLOR]: { id: 99, color: "Otro color", hexadecimal: null }
};

// 4. Equivalente al método Java `fromId(Integer id)`
export function getColorEnumById(id: number | null): ColorEnum | null {
  if (id === null || id === undefined) return null;

  const foundKey = Object.keys(ColorDetails).find(
    (key) => ColorDetails[key as ColorEnum].id === id
  );

  if (!foundKey) {
    throw new Error(`No existe un color con id: ${id}`);
  }

  return foundKey as ColorEnum;
}
