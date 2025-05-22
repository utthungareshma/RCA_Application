import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataVaultService } from './data-vault.service';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { NewFolderDialogComponent } from '../new-folder-dialog/new-folder-dialog.component';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { DataVaultConfirmDialogComponent } from '../data-vault-confirm-dialog/data-vault-confirm-dialog.component';
import { FileuploadService } from '../file-upload/file-upload.service';

interface DataItem {
  type: 'folder' | 'file';
  name: string;
  modifiedOn: string;
  modifiedBy: string;
  size: string;
  folderName?: any;
}

@Component({
  selector: 'app-data-vault',
  templateUrl: './data-vault.component.html',
  styleUrls: ['./data-vault.component.scss']
})
export class DataVaultComponent implements OnInit {
  @ViewChild(FileUploadComponent) fileUploadComponent!: FileUploadComponent;
  displayedColumns: string[] = ['select', 'name', 'modifiedOn', 'modifiedBy', 'size'];
  selection = new SelectionModel<DataItem>(true, []);
  dataSource = new MatTableDataSource<DataItem>();
  fileDataSource = new MatTableDataSource<DataItem>();
  showFolder = true;
  showFiles = false;
  token: any;
  selectedFolder: any;
  isChecked: boolean = false;
  userName: any;
  loader: boolean = false;
  constructor(private dataVaultService: DataVaultService, private dialog: MatDialog, private router: Router, private route: ActivatedRoute
    , private uploadService: FileuploadService) {
    this.token = JSON.parse(localStorage.getItem('token') || '{}');
    this.userName = JSON.parse(localStorage.getItem('username') || '{}');
  }
  ngOnInit(): void {
    this.uploadService.fileUploaded$.subscribe(() => {
      this.refreshData();
    });
    this.route.paramMap.subscribe(params => {
      const folderName = params.get('folder');
      if (folderName) {
        this.getFileList(folderName);
      } else {
        this.getFolderData();
      }
    });
  }
  refreshData() {
    if (this.selectedFolder) {
      this.getFileList(this.selectedFolder);
    } else {
      this.getFolderData();
    }
  }
  getFolderData() {
    this.loader = true;
    let folderData: DataItem[] = [];
    let body = {
      "username": this.userName
    }
    const test = this.dataVaultService.getFolderList(
      this.token, body,
      (result: any) => {
        for (const folderName of result.folders) {
          const foderNames = folderName.replace(/\/$/, '')
          const dataItem: DataItem = {
            type: 'folder',
            name: foderNames,
            modifiedOn: '20 Feb 2024',
            modifiedBy: this.userName,
            size: '0 items'
          };
          folderData.push(dataItem);
        }
        this.loader = false;
        this.dataSource = new MatTableDataSource<DataItem>(folderData);
      }
    );
    this.showFolder = true;
    this.showFiles = false;
  }
  getFileList(folderName: string): void {
    this.loader = true;
    this.selectedFolder = folderName;
    let body = {
      username: this.userName,
      select_folder: folderName
    };
    let folderData: DataItem[] = [];
    const test = this.dataVaultService.getFileList(
      this.token, body,
      (result: any) => {
        for (const filename of result.files) {
          const dataItem: DataItem = {
            type: 'file',
            name: filename,
            modifiedOn: '20 Feb 2024',
            modifiedBy: this.userName,
            size: '10mb',
            folderName: folderName,
          };
          folderData.push(dataItem);
        }
        this.loader = false;
        this.fileDataSource = new MatTableDataSource<DataItem>(folderData);
      }
    );
    this.showFolder = false;
    this.showFiles = true;
  }
  openNewFolderDialog(): void {
    const dialogRef = this.dialog.open(NewFolderDialogComponent, {
      width: '300px',
      height: '230px'
    });
    dialogRef.afterClosed().subscribe((result) => {
    });
  }
  uploadFile(): void {
    const dialogData = {
      folder_name: this.selectedFolder,
    };
    const dialogRef = this.dialog.open(FileUploadComponent, {
      width: '490px',
      data: this.selectedFolder,
    });
  }
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  get deleteButtonDisabled(): boolean {
    return this.selection.isEmpty();
  }
  deleteSelectedRows() {
    const selectedRows = this.selection.selected;
    const dialogRef = this.dialog.open(DataVaultConfirmDialogComponent, {
      data: {
        count: selectedRows.length, folderName: this.getFolderName(selectedRows),
        itemType: 'folder'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        selectedRows.forEach(row => {
          this.dataVaultService.deleteFolder(this.token, this.userName, [row.name], (deleteResult) => {
          });
        });
        this.dataSource.data = this.dataSource.data.filter(row => !selectedRows.includes(row));
        this.selection.clear();
      }
    });
  }
  goToDataVault(): void {
    this.router.navigate(['/data-vault']);
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/data-vault']);
    });
  }

  getFolderName(selectedRows: DataItem[]): string {
    if (selectedRows.length === 1) {
      return selectedRows[0].name;
    } else {
      return `Multiple Folders (${selectedRows.length})`;
    }
  }

  masterToggleFiles() {
    this.isAllSelectedFiles() ?
      this.selection.clear() :
      this.fileDataSource.data.forEach(row => this.selection.select(row));
  }
  isAllSelectedFiles() {
    const numSelected = this.selection.selected.length;
    const numRows = this.fileDataSource.data.length;
    return numSelected === numRows;
  }
  deleteSelectedFiles() {
    const selectedRows = this.selection.selected;
    const dialogRef = this.dialog.open(DataVaultConfirmDialogComponent, {
      data: {
        count: selectedRows.length,
        folderName: selectedRows.length === 1 ? selectedRows[0].folderName : null,
        itemType: 'file'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        selectedRows.forEach(row => {
          this.dataVaultService.deleteFile(this.token, this.userName, row.folderName, [row.name], (deleteResult) => {
          });
        });
        this.fileDataSource.data = this.fileDataSource.data.filter(row => !selectedRows.includes(row));
        this.selection.clear();
      }
    });
  }
}
