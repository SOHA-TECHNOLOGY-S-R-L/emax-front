import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'experiencia',
  standalone: true,
  templateUrl: './experiencia.component.html',
  styleUrl: './experiencia.component.css'
})
export class ExperienciaComponent implements OnInit {

    iniciaExperiencia: number = 0;
    terminaExperiencia: number = 15;

    iniciaTrabajadores: number = 0;
    terminaTrabajadores: number = 30;

    iniciaClientesFelices: number = 0;
    terminaClientesFelices: number = 235;

    iniciaProductosVendidos: number = 0;
    terminaProductosVendidos: number = 400;

  ngOnInit(): void {
    /************************************ */
    let c1 = 0, c2 = 0, c3 = 0, c4 = 0;
    let tiempoExperiencia = setInterval(() => {
      c1 += 1;
      this.iniciaExperiencia = c1;
      if (c1 == this.terminaExperiencia) {
        clearInterval(tiempoExperiencia)
      }
    }, 100);

    let tiempoTrabajadores = setInterval(() => {
      c2 += 1;
      this.iniciaTrabajadores = c2;
      if (c2 == this.terminaTrabajadores) {
        clearInterval(tiempoTrabajadores)
      }
    }, 100);

    let tiempoClientesFelices = setInterval(() => {
      c3 += 1;
      this.iniciaClientesFelices = c3;
      if (c3 == this.terminaClientesFelices) {
        clearInterval(tiempoClientesFelices)
      }
    }, 30);

    let tiempoProductosVendidos = setInterval(() => {
      c4 += 1;
      this.iniciaProductosVendidos = c4;
      if (c4 == this.terminaProductosVendidos) {
        clearInterval(tiempoProductosVendidos)
      }
    }, 20);
  }

}
