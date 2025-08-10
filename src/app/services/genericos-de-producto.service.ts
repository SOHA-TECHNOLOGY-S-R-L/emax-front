import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs/internal/Observable";
import { environment } from "../../environments/environment";
import { GenericosDeProducto } from "../models/genericos-de-producto";


@Injectable({
  providedIn: 'root'
})
export class GenericosDeProductoService {

  constructor(private http: HttpClient, private router: Router) {}

  getGenericos(): Observable<GenericosDeProducto[]> {
    return this.http.get<GenericosDeProducto[]>(environment.apiUrl + '/genericos-de-producto'
    );
  }

}
