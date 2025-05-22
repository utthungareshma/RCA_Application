import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NewFolderService } from './new-folder.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-new-folder-dialog',
  templateUrl: './new-folder-dialog.component.html',
  styleUrls: ['./new-folder-dialog.component.scss']
})
export class NewFolderDialogComponent {
  folderName: string = '';
  token: any;
  userName: any;
  debounceTimer: any;
  constructor(public dialogRef: MatDialogRef<NewFolderDialogComponent>, private newFolderService: NewFolderService, private router: Router) {
    this.token = JSON.parse(localStorage.getItem('token') || '{}');
    this.userName = JSON.parse(localStorage.getItem('username') || '{}');
  }
  onClose(): void {
    this.dialogRef.close();
  }
  onSubmit(): void {
    let body = {
      "username": this.userName,
      "folder_name": this.folderName
    }
    console.log('Folder Name:', this.folderName);
    const test = this.newFolderService.createFolder(
      this.token, body,
      (result: any) => {
      });
    this.dialogRef.close();
    this.debounceTimer = setTimeout(() => {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/data-vault']);
      });;
    }, 3000);
  }
}
