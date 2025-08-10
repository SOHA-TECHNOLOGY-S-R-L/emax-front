import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'trabajadores',
  standalone: true,
  templateUrl: './trabajadores.component.html',
  styleUrl: './trabajadores.component.css'
})
export class TrabajadoresComponent implements OnInit {


  iniciaExperiencia: number = 0;
  terminaExperiencia: number = 15;

  ngOnInit(): void {
    let c1 = 0, c2 = 0, c3 = 0, c4 = 0;
    let tiempoExperiencia = setInterval(() => {
      c1 += 1;
      this.iniciaExperiencia = c1;
      if (c1 == this.terminaExperiencia) {
        clearInterval(tiempoExperiencia)
      }
    }, 100);
  }
}
