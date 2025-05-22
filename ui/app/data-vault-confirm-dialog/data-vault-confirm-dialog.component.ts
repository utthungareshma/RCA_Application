import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-data-vault-confirm-dialog',
  templateUrl: './data-vault-confirm-dialog.component.html',
  styleUrls: ['./data-vault-confirm-dialog.component.scss']
})
export class DataVaultConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DataVaultConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancelClick(): void {
    this.dialogRef.close(false);
  }
}
