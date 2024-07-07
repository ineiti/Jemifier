import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DataService } from './data.service';
import { ChosenService } from './chosen.service';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [DataService, ChosenService],
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Jemifier';
  loaded = false;

  constructor(private router: Router, private data_component: DataService) { }

  async ngOnInit() {
    await this.data_component.load_all();
    this.loaded = true;
    // const currentRoute = this.route.snapshot.active;
    this.router.events.subscribe((url) => {
      // console.log("---");
      // console.dir(url);
    });
    const menuItems = document.querySelectorAll('.inactive-menu-item');
    menuItems.forEach((menuItem) => {
      // console.log(menuItem.attributes.getNamedItem('routerLink')!.value);
      //   if (this.route.url) {
      //     menuItem.classList.add('active-menu-item');
      //     menuItem.classList.remove('inactive-menu-item');
      //   } else {
      //     menuItem.classList.remove('active-menu-item');
      //     menuItem.classList.add('inactive-menu-item');
      //   }
    });
  }
}
