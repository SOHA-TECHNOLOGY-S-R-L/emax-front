import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChatUtils } from '../../../utils/chat-utils';

@Component({
  selector: 'app-pie',
  templateUrl: './pie.component.html',
  styleUrl: './pie.component.css',
  standalone: true,
  imports: [RouterModule]
  // No additional imports needed for this component
})
export class PieComponent {

  chatUtils = ChatUtils;

  chatear() {
    this.chatUtils.defaultMesage();
  }

}
