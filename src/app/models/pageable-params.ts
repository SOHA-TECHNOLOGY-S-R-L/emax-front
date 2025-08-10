export class PageableParams {
  pageNumber: number = 0;
  pageSize: number = 0;
  active!:string;
  direction!:string;
  query?:string
}
