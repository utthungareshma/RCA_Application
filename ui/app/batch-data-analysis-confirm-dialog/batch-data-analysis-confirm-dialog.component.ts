import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-batch-data-analysis-confirm-dialog',
  templateUrl: './batch-data-analysis-confirm-dialog.component.html',
  styleUrls: ['./batch-data-analysis-confirm-dialog.component.scss']
})
export class BatchDataAnalysisConfirmDialogComponent {
  constructor( private _snackBar: MatSnackBar, 
    public dialogRef: MatDialogRef<BatchDataAnalysisConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  confirm(): void {
    this._snackBar.open('Data source verified successfully', 'Close', {
      duration: 3000,
    });
    this.dialogRef.close(true);
  }
  cancel(): void {
    this.dialogRef.close(false);
  }
}
