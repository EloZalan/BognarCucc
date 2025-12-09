import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ZipEntry {
  zip: string;
  city: string;
  county: string;
  lat?: string;
  lon?: string;
  population?: string;
  notes?: string;
}

@Component({
  selector: 'zip-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './zip-search.component.html',
  styleUrls: ['./zip-search.component.css']
})
export class ZipSearch {
  protected readonly searchZip = signal('');
  // undefined = not searched yet, null = searched but not found, ZipEntry = found
  protected readonly found = signal<ZipEntry | null | undefined>(undefined);
  protected readonly loading = signal(true);
  protected entries: ZipEntry[] = [];

  constructor() {
    this.loadCsv();
  }

  protected async loadCsv() {
    try {
      const res = await fetch('/zipcodes.csv');
      const text = await res.text();
      this.entries = this.parseCsv(text);
    } catch (e) {
      console.error('Could not load csv', e);
    }
    finally {
      this.loading.set(false);
    }
  }

  protected parseCsv(text: string): ZipEntry[] {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    // Detect whether the CSV contains a header row. If the first value looks like a
    // zip (digits) we assume there's no header and use a default header order.
    const firstCols = lines[0].split(',').map(c => c.trim());
    let header: string[];
    let rows: string[];

    if (/^\d{3,4}$/.test(firstCols[0])) {
      header = ['zip', 'city', 'county', 'lat', 'lon', 'population', 'notes'];
      rows = lines;
    } else {
      header = firstCols.map(h => h.toLowerCase());
      rows = lines.slice(1);
    }

    return rows.map(r => {
      const cols = r.split(',').map(c => c.trim());
      const obj: any = {};
      header.forEach((h, i) => obj[h] = cols[i] ?? '');
      return obj as ZipEntry;
    });
  }

  protected findZip() {
    const code = (this.searchZip() ?? '').toString().trim();
    if (!code) {
      this.found.set(undefined);
      return;
    }

    const found = this.entries.find(e => (e.zip ?? '').toString().trim() === code);
    this.found.set(found ?? null);
  }

  protected clear() {
    this.searchZip.set('');
    this.found.set(null);
  }
}
