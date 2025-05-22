import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './login/login.component';
import { MatInputModule }  from "@angular/material/input"
import { MatCardModule }  from "@angular/material/card";
import { MatButtonModule }  from "@angular/material/button";
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSnackBarModule} from '@angular/material/snack-bar';

import { MatTabsModule } from "@angular/material/tabs";
import { MatFormFieldModule } from "@angular/material/form-field";
import {MatFormFieldControl} from '@angular/material/form-field';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EventAnalysisComponent } from './event-analysis/event-analysis.component';
import { MatSelectModule } from '@angular/material/select';
import {MatSliderModule} from '@angular/material/slider';
import {MatDividerModule} from '@angular/material/divider';
import { HeaderComponent } from './header/header.component';

import {MatSidenavModule} from '@angular/material/sidenav';
import { CausalDiscoveryComponent } from './causal-discovery/causal-discovery.component';
import { FileUploadComponent } from './file-upload/file-upload.component';


import { FormsModule } from '@angular/forms';



import { MatDialogModule } from '@angular/material/dialog';
import { BatchDataAnalysisComponent } from './batch-data-analysis/batch-data-analysis.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import{MatTableModule} from '@angular/material/table';
import { PdfDialogComponent } from './pdf-dialog/pdf-dialog.component';
import { CqalistComponent } from './cqalist/cqalist.component'
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { DataVaultComponent } from './data-vault/data-vault.component';
import {MatMenuModule} from '@angular/material/menu';
import { NewFolderDialogComponent } from './new-folder-dialog/new-folder-dialog.component'
import { RegisterComponent } from './register/register.component';
import { DataVaultConfirmDialogComponent } from './data-vault-confirm-dialog/data-vault-confirm-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    EventAnalysisComponent,
    HeaderComponent,
    CausalDiscoveryComponent,
    FileUploadComponent,
    BatchDataAnalysisComponent,
    PdfDialogComponent,
    CqalistComponent,
    DataVaultComponent,
    NewFolderDialogComponent,
    RegisterComponent,
    DataVaultConfirmDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatToolbarModule, MatButtonModule, MatIconModule,
    MatSnackBarModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatDividerModule ,
    MatSidenavModule,FormsModule,MatDialogModule,HttpClientModule,
    MatProgressSpinnerModule,
    MatTableModule,MatAutocompleteModule,MatButtonModule,MatCheckboxModule,
    MatMenuModule
  ],
  exports:[MatSidenavModule],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class AppModule { }
