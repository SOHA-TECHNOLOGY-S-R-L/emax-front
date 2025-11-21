import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { AlertService } from "../services/alert.service";
import { Router } from "@angular/router";
import { catchError, Observable, throwError } from "rxjs";


 @Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService,
    private alertsService: AlertService,
    private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {


    return next.handle(req).pipe(
      catchError(e => {
       // let errorMessage = '';
        if (e.error instanceof Error || e.error?.message) {
          console.log(`AuthInterceptor.client-side error:`, e);
        }

        if (e instanceof HttpErrorResponse){
          console.log(`AuthInterceptor.httpResponse:`, e);
        } else {
          console.log(`AuthInterceptor.otherErrors:`, e);
        }

        if (e.status == 401) {
          if (this.authService.isAuthenticated()) {
            this.authService.logout();
          }
          this.router.navigate(['/tienda/productos-categoria', 'tienda']);
        }

        if (e.status == 403) {
          this.alertsService.warning(`Hola ${this.authService.usuario.username} no tienes acceso a este recurso!`,'Acceso denegado')
          //swal.fire('Acceso denegado', `Hola ${this.authService.usuario.username} no tienes acceso a este recurso!`, 'warning');
          //this.router.navigate(['/personas']);
        }
        return throwError(e);
      })
    );
  }
}
