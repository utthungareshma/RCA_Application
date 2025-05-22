import { HttpClient, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { EnvService } from 'src/app/env.service';
import { API_URL } from 'src/app/utils/api-list';
import { AuthenticationService } from 'src/app/authentication/authentication.service';
import { Observable, of, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileuploadService {
  private fileUploadedSource = new Subject<void>();
  fileSizeUnit: number = 1024;
  public isApiSetup = false;
  token: any;
  constructor(private http: HttpClient, public env: EnvService, public authenticationService: AuthenticationService) {
    this.token = JSON.parse(localStorage.getItem("token") || '{}');
  }
  fileUploaded$ = this.fileUploadedSource.asObservable();
  triggerFileUploaded() {
    this.fileUploadedSource.next();
  }
  getFileSize(fileSize: number): number {
    if (fileSize > 0) {
      if (fileSize < this.fileSizeUnit * this.fileSizeUnit) {
        fileSize = parseFloat((fileSize / this.fileSizeUnit).toFixed(2));
      } else if (
        fileSize <
        this.fileSizeUnit * this.fileSizeUnit * this.fileSizeUnit
      ) {
        fileSize = parseFloat(
          (fileSize / this.fileSizeUnit / this.fileSizeUnit).toFixed(2)
        );
      }
    }
    return fileSize;
  }
  getFileSizeUnit(fileSize: number) {
    let fileSizeInWords = 'bytes';
    if (fileSize > 0) {
      if (fileSize < this.fileSizeUnit) {
        fileSizeInWords = 'bytes';
      } else if (fileSize < this.fileSizeUnit * this.fileSizeUnit) {
        fileSizeInWords = 'KB';
      } else if (
        fileSize <
        this.fileSizeUnit * this.fileSizeUnit * this.fileSizeUnit
      ) {
        fileSizeInWords = 'MB';
      }
    }
    return fileSizeInWords;
  }
  uploadMedia(formData: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${this.env.apiUrl}${API_URL.uploadfile}`, formData, {
      headers,
      reportProgress: true,
      observe: 'events',
    })
      .pipe(
        map((event: any) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              const progress = Math.round((100 * event.loaded) / event.total);
              return { status: 'progress', message: progress };
            case HttpEventType.Response:
              return event.body;
            default:
              return `Unhandled event: ${event.type}`;
          }
        })
      );
  }
  createAuthorizationHeader(token: any): any {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    });
    return headers;
  }
  createAuthorizationHeaderDownload(token: any): any {
    const headers = new HttpHeaders({
      'Content-Type': 'application/zip',
      Authorization: `Token ${token}`,
    });
    return headers;
  }
  upload(formData: any, auth_token: any, callback: (data: any) => void) {
    this.http.post(`${this.env.apiUrl}` + `/api/upload_file`, formData, {
      headers: this.createAuthorizationHeader(auth_token)
    }).subscribe(result => {
      callback(result);
    }, error => {
      callback(error)
    });
  }
  upload1(event: any, auth_token: any) {
    return this.http.post(`${this.env.apiUrl}` + `/api/projects/upload/`, event, {
      headers: this.createAuthorizationHeader(auth_token),
    }).pipe(result => {
      return result;
    });
  }
  upload2(file1: any, auth_token: any, callback: (data: any) => void) {
    const file = new FormData();
    file.append('file', file1);
    this.http.post(`${this.env.apiUrl}` + `/api/upload_file/`, file, {
    }).subscribe(result => {
      callback(result);
    }, error => {
      callback(error)
    });
  }
  uploadFile(formData: FormData, userName: string, folder_name: string, authToken: string): Observable<HttpResponse<any>> {
    formData.append('username', userName);
    formData.append('select_folder', folder_name);
    const headers = new HttpHeaders().set('Authorization', 'Token ' + authToken);
    return this.http.post<any>(`${this.env.apiUrl}${API_URL.upload_file}`, formData, { observe: 'response', headers })
      .pipe(
        catchError((error) => {
          if (error.status === 200) {
            return of(new HttpResponse({ status: 200, body: error.error }));
          } else {
            return throwError(error);
          }
        })
      );
  }
  uploadMultipleFiles(formData: FormData, folder_name: string, authToken: string) {
    formData.append('folder_name', folder_name);
    const headers = new HttpHeaders().set('Authorization', 'Token ' + authToken);
    return this.http.post<any>(`${this.env.apiUrl}${API_URL.upload_file}`, formData, { headers });
  }
}