import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EventAnalysisComponent } from './event-analysis/event-analysis.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { BatchDataAnalysisComponent } from './batch-data-analysis/batch-data-analysis.component';
import { CausalDiscoveryComponent } from './causal-discovery/causal-discovery.component';
import { DataVaultComponent } from './data-vault/data-vault.component';
import { RegisterComponent } from './register/register.component';

// const routes: Routes = [
//   {
//     path: '',
//     redirectTo: 'login',
//     pathMatch: 'full'
//   },
//   { path: '', component: LoginComponent },
//   { path:'login',component:LoginComponent},
//   { path:'dashboard',component:DashboardComponent},
//   { path:'event-analysis',component:EventAnalysisComponent},
//   {path:'fileUpload',component:FileUploadComponent}
// ];


const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'event-analysis',
        component: EventAnalysisComponent
      },
      {
        path: 'batch-analysis',
        component: BatchDataAnalysisComponent
      },
      {
        path: 'causal-discovery',
        component: CausalDiscoveryComponent
      },
      {
        path: 'data-vault',
        component: DataVaultComponent
      },{
        path: 'data-vault/:folder',
        component: DataVaultComponent,
      }
    ]
  },
  { path:'login',component:LoginComponent},
  { path:'register',component:RegisterComponent},
  { path:'dashboard',component:DashboardComponent},
  {path:'fileUpload',component:FileUploadComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
