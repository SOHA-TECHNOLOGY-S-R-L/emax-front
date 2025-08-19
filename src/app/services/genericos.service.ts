import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs/internal/Observable";
import { environment } from "../../environments/environment";
import { Genericos } from "../models/genericos";


@Injectable({
  providedIn: 'root'
})
export class GenericosService {

  constructor(private http: HttpClient, private router: Router) {}

  getGenericos(): Observable<Genericos[]> {
    return this.http.get<Genericos[]>(environment.apiUrl + '/genericos'
    );
  }

}
