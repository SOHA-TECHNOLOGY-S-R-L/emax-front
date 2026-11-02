export enum MovimientoInicialEnum {
    INGRESO="I",
    EGRESO="E",
}

export const MovimientoInicialEtiquetas: Record<MovimientoInicialEnum, string> = {
    [MovimientoInicialEnum.INGRESO]: 'INGRESO',
    [MovimientoInicialEnum.EGRESO]: 'EGRESO',
};


export function getNameMovimientoInicialEnum(codigo: any): string {
    // Validamos si el código recibido pertenece al enum válido
    if (Object.values(MovimientoInicialEnum).includes(codigo)) {
        return MovimientoInicialEtiquetas[codigo as MovimientoInicialEnum];
    }
    return 'Desconocido'; // Valor por defecto si viene null o un string inválido
}
