import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileuploadService } from './file-upload.service';
import { EnvService } from 'src/app/env.service';
import { HttpHeaders } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-file-upload',

  templateUrl: './file-upload.component.html',

  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent implements OnInit {
  @Output() fileUploaded: EventEmitter<void> = new EventEmitter<void>();
  uploadedMedia: Array<any> = [];
  token: any;
  projectAddDialogFileUpload: boolean | any;
  uploadedFiles: any[] = [];
  httpHeader: { Authorization: string };
  ProjectID: any;
  successMessage: string = '';
  selectedFile!: File;
  selectedFiles: File[] = [];
  uploadProgress: number = 0;
  dialog: any;
  matdialog: any;
  selectedFolder: any;
  userName: any;
  constructor(
    private fileUploadService: FileuploadService,
    public env: EnvService,
    private dialogRef: MatDialogRef<FileUploadComponent>,
    private _snackBar: MatSnackBar, @Inject(MAT_DIALOG_DATA) public data: any, private router: Router
  ) {
    this.token = JSON.parse(localStorage.getItem('token') || '{}');
    this.userName = JSON.parse(localStorage.getItem('username') || '{}');
    this.matdialog = dialogRef;
    this.httpHeader = { Authorization: `Token ${this.token}` };
    this.selectedFolder = data;
  }
  createAuthorizationHeader(token: any): any {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    });
    return headers;
  }
  ngOnInit(): void { }

  createAuthorizationHeaderDownload(token: any): any {
    const headers = new HttpHeaders({
      'Content-Type': 'application/zip',
      Authorization: `Token ${token}`,
    });
    return headers;
  }
  cancel() {
    location.reload();
  }
  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files) as File[];
  }
  onFileBrowse(event: Event) {
    const target = event.target as HTMLInputElement;
  }
  async startProgress(file: any, index: any) {
    let filteredFile = this.uploadedMedia
      .filter((u, index) => index === index)
      .pop();
    if (filteredFile != null) {
      let fileSize = this.fileUploadService.getFileSize(file.size);
      let fileSizeInWords = this.fileUploadService.getFileSizeUnit(file.size);
      if (this.fileUploadService.isApiSetup) {
        let formData = new FormData();
        formData.append('File', file);
        this.fileUploadService
          .uploadMedia(formData)
          .pipe(takeUntil(file.ngUnsubscribe))
          .subscribe(
            (res: any) => {
              if (res.status === 'progress') {
                let completedPercentage = parseFloat(res.message);
                filteredFile.FileProgessSize = `${(
                  (fileSize * completedPercentage) /
                  100
                ).toFixed(2)} ${fileSizeInWords}`;
                filteredFile.FileProgress = completedPercentage;
              } else if (res.status === 'completed') {
                filteredFile.Id = res.Id;
                filteredFile.FileProgessSize = fileSize + ' ' + fileSizeInWords;
                filteredFile.FileProgress = 100;
              }
            },
            (error: any) => {
              console.log(error);
            }
          );
      } else {
        for (
          var f = 0;
          f < fileSize + fileSize * 0.0001;
          f += fileSize * 0.01
        ) {
          filteredFile.FileProgessSize = f.toFixed(2) + ' ' + fileSizeInWords;
          var percentUploaded = Math.round((f / fileSize) * 100);
          filteredFile.FileProgress = percentUploaded;
        }
      }
    }
  }
  closeDialog(): void {
    this.dialogRef.close();
  }
  onUpload1() {
    if (this.selectedFiles.length > 0) {
      this.dialogRef.close();
      const formData = new FormData();
      
      this.selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      this.fileUploadService
        .uploadFile(formData,this.userName, this.selectedFolder, this.token)
        .subscribe(
          (data) => {
            this._snackBar.open('File uploaded successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.fileUploadService.triggerFileUploaded();
          },
          (error) => {
            this._snackBar.open('Error uploading file', 'Close', {
              duration: 3000,
            });
          }
        );
    }
  }
  onUpload(event: any) {
    const test = this.fileUploadService.upload2(
      this.selectedFile,
      this.token,
      (result: any) => { }
    );
  }
}
