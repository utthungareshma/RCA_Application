
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/env.service';
import { API_URL } from '../utils/api-list';

@Injectable({
  providedIn: 'root'
})
export class DataVaultService {
  constructor(private http: HttpClient, public env: EnvService) { }
  createAuthorizationHeader(token: any): any {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    });
    return headers;
  }
  getFolderList(token: any, body: any, callback: (data: any) => void) {
    const headers = new HttpHeaders({
      'content-type': 'application/json',
      Authorization: `Token ${token}`,
    })
    this.http
      .post<any>(`${this.env.apiUrl}${API_URL.getFolderList}`, body, {
        headers: headers,
      })
      .subscribe((result: any) => {
        callback(result);
      });
  }
  getFileList(token: any, body: any, callback: (data: any) => void) {
    const headers = new HttpHeaders({
      'content-type': 'application/json',
      Authorization: `Token ${token}`,
    })
    this.http
      .post<any>(`${this.env.apiUrl}${API_URL.getFileList}`, body, {
        headers: headers,
      })
      .subscribe((result: any) => {
        callback(result);
      });
  }
  deleteFolder(token: any, userName: any, folderName: string[], callback: (data: any) => void) {
    let body = {
      username: userName,
      folder_names: folderName
    }
    const headers = this.createAuthorizationHeader(token)
    return this.http.post(`${this.env.apiUrl}${API_URL.deleteFolder}`, body, {
      headers: headers
    })
      .subscribe(
        (result: any) => {
          callback(result);
        },
        (error: any) => {
          console.error('Error during delete:', error);
        }
      );
  }
  deleteFile(token: any, userName: string, folderName: string, fileName: string[], callback: (data: any) => void) {
    const options = {
      headers: this.createAuthorizationHeader(token),
      body: {
        username: userName,
        select_folder: folderName,
        file_names: fileName
      }
    };
    return this.http.delete(`${this.env.apiUrl}${API_URL.deleteFile}`, options)
      .subscribe(
        (result: any) => {
          callback(result);
        },
        (error: any) => {
          console.error('Error during delete:', error);
        }
      );
  }
}
