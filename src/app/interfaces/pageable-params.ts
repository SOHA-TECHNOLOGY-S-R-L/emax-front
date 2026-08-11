import { SortDirection } from "@angular/material/sort";

export interface PageableParams {
  active: string;
  direction: SortDirection;
  pageNumber: number;
  pageSize: number;
  query: string;
}
