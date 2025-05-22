import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/env.service';
import { API_URL } from '../utils/api-list';

@Injectable({
  providedIn: 'root'
})
export class NewFolderService {

  constructor(private http: HttpClient, public env: EnvService) { }
  createAuthorizationHeader(token: any): any {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    });
    return headers;
  }
  createFolder(token: any,body: any, callback: (data: any) => void) {
    const headers = new HttpHeaders({
      'content-type':'application/json',
       Authorization: `Token ${token}`,
    })
    this.http
    .post<any>(`${this.env.apiUrl}${API_URL.createFolder}`, body, {
      headers: this.createAuthorizationHeader(token),
    })
      .subscribe((result: any) => {
        callback(result);
      });
  }
}
