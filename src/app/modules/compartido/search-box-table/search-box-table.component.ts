import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'search-box-table',
  templateUrl: './search-box-table.component.html',
  styleUrl: './search-box-table.component.css',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, FormsModule ]
})
export class SearchBoxTableComponent {
  query!: string;
  @Output() searchEvent = new EventEmitter();

  //theForm: FormGroup;

  constructor(
  ) { }

  search(): void {
    this.searchEvent.emit(this.query);
  }
}
