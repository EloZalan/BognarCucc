import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ZipSearch } from './zip-search.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ZipSearch],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('Zips');
}
