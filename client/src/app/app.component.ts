import { Component } from '@angular/core';
import { ScraperComponent } from './scraper/scraper.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ScraperComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'client';
}
