import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class PaginatorIntlEs extends MatPaginatorIntl {

  override itemsPerPageLabel = 'Items por página';
  override nextPageLabel = 'Siguiente página';
  override previousPageLabel = 'Página anterior';
  override firstPageLabel = 'Primera página';
  override lastPageLabel = 'Última página';

  override getRangeLabel = (
    page: number,
    pageSize: number,
    length: number
  ): string => {

    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }

    const start = page * pageSize + 1;
    const end = Math.min(start + pageSize, length);

    return `${start} - ${end} de ${length}`;
  };
}
