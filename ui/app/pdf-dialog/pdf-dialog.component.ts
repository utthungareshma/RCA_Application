// pdf-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-pdf-dialog',
  templateUrl: './pdf-dialog.component.html',
  styleUrls: ['./pdf-dialog.component.scss']
})


export class PdfDialogComponent {
  pdfSrc: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.pdfSrc = data.filePath;
  }
}
