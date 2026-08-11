/*   export class PageableResponse {
  totalPages: number = 0;
  totalElements: number = 0;
  pageNumber: number = 0;
  pageSize: number = 0;
  content: any[] = [];
} */



 export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface PageableResponse<T> {
  content: T[];
  page: PageInfo;
}
