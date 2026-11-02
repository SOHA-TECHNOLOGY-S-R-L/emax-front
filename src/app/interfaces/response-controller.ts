
export interface ResponseController<T> {
  success: boolean;
  message: string;
  data: T;
}
