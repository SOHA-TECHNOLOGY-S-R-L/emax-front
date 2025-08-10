import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Role } from "../models/role";
import { Modulo } from "../models/modulo";
import { environment } from "../../environments/environment";


@Injectable({
  providedIn: 'root'
})
export class RolService {
  constructor(private httpClient: HttpClient) {}


  roles(): Observable<Role[]> {
    return this.httpClient.get<Role[]>(`${environment.apiUrl}/roles`);
  }

  modulos(): Observable<Modulo[]> {
    return this.httpClient.get<Modulo[]>(`${environment.apiUrl}/roles/modulos`);
  }

}
