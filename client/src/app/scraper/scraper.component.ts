import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-scraper',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './scraper.component.html',
  styleUrl: './scraper.component.scss',
})
export class ScraperComponent {
  selectedPlatform = 'twitter';
  username = '';
  loading = false;
  result: any = null;
  error = '';

  constructor(private http: HttpClient) {}

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.result = null;

    let url = 'http://localhost:3000/scraping/';
    switch (this.selectedPlatform) {
      case 'youtube':
        url += `youtube?channelName=${this.username}`;
        break;
      case 'instagram':
        url += `instagram?username=${this.username}`;
        break;
      case 'twitter':
        url += `twitter?username=${this.username}`;
        break;
      case 'tiktok':
        url += `tiktok?username=${this.username}`;
        break;
      case 'facebook':
        url += `facebook?pageSlug=${this.username}`;
        break;
      case 'facebook-group':
        url += `facebook-group?pageSlug=${this.username}`;
        break;
      case 'linkedin':
        url += `linkedin?companySlug=${this.username}`;
        break;
      case 'threads':
        url += `threads?username=${this.username}`;
        break;
      default:
        this.error = 'Invalid platform selected';
        this.loading = false;
        return;
    }

    this.http.get(url).subscribe({
      next: (data) => {
        this.result = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error scraping data';
        this.loading = false;
      },
    });
  }
}
