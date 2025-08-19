import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChatUtils } from '../../../utils/chat-utils';
import { GenericosService } from '../../../services/genericos.service';

@Component({
  selector: 'app-pie',
  templateUrl: './pie.component.html',
  styleUrl: './pie.component.css',
  standalone: true,
  imports: [RouterModule]
  // No additional imports needed for this component
})
export class PieComponent implements OnInit {
private genericosService = inject(GenericosService);
public whatsapp!:string;

  ngOnInit(): void {
    this.genericosService.getGenericos().subscribe(resp => {
      this.whatsapp = resp.filter( g => g.codigo === "WHATSAPP")[0].valor1;
    })  }

  chatUtils = ChatUtils;

  chatear() {
    this.chatUtils.defaultMesage();
  }

}
