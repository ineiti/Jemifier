import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DataComponent } from './data.component';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [DataComponent],
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Jemifier';

  constructor(private data_component: DataComponent) { }

  async ngOnInit() {
    // // const b = new Buffer(12);
    // const b = parse("123,456");
    // console.dir(b);
    console.log(`Got data:`, await this.data_component.list_books());
  }
}
