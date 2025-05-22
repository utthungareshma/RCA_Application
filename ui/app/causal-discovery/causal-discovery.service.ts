import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from '../env.service';
import { API_URL } from '../utils/api-list';

@Injectable({
  providedIn: 'root',
})
export class CausalDiscoveryService {
  token: any;
  httpHeader: { Authorization: string };
  constructor(private http: HttpClient, public env: EnvService) {
    this.token = JSON.parse(localStorage.getItem('token') || '{}');
    this.token = JSON.parse(localStorage.getItem('token') || '{}');
    this.httpHeader = { Authorization: `Token ${this.token}` };
  }
  createAuthorizationHeader(token: any): any {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    });
    return headers;
  }

  getFiles(token: any, callback: (data: any) => void) {
    this.http
      .get<any>(`${this.env.apiUrl}${API_URL.getFiles}`, {
        headers: this.createAuthorizationHeader(token),
      })
      .subscribe((result: any) => {
        callback(result);
      });
  }

  getBatches(token: any, callback: (data: any) => void) {
    this.http
      .get<any>(`${this.env.apiUrl}${API_URL.getBatches}`, {
        headers: this.createAuthorizationHeader(token),
      })
      .subscribe((result: any) => {
        callback(result);
      });
  }

  getRecords(token: any, body: any, callback: (data: any) => void) {
    this.http
      .post<any>(`${this.env.apiUrl}${API_URL.getRecords}`, body, {
        headers: this.createAuthorizationHeader(token),
      })
      .subscribe((result: any) => {
        callback(result);
      });
  }

  getTarget(token: any, body: any, callback: (data: any) => void) {
    this.http
      .post<any>(`${this.env.apiUrl}${API_URL.getcolumnheaders}`, body, {
        headers: this.createAuthorizationHeader(token),
      })
      .subscribe((result: any) => {
        callback(result);
      });
  }

  getXAI(token: any, body: any, callback: (data: any) => void) {
    this.http
      .post<any>(`${this.env.apiUrl}${API_URL.getXAI}`, body, {
        headers: this.createAuthorizationHeader(token),
      })
      .subscribe((result: any) => {
        callback(result);
      });
  }

  getCausalgraph(token: any, body: any, callback: (data: any) => void) {
    this.http
      .post<any>(`${this.env.apiUrl}${API_URL.getCausalGraph}`, body, {
        headers: this.createAuthorizationHeader(token),
      })
      .subscribe((result: any) => {
        callback(result);
      });
  }
  getColumnValues(token: any, body: any, callback: (data: any) => void) {
    this.http
      .post<any>(`${this.env.apiUrl}${API_URL.getcolumnvalues}`, body, {
        headers: this.createAuthorizationHeader(token),
      })
      .subscribe((result: any) => {
        callback(result);
      });
  }
  getWhatIfPrediction(token: any, body: any, callback: (data: any) => void) {
    const headers = new HttpHeaders().set('Authorization', 'Token ' + token);
    this.http
      .post<any>(`${this.env.apiUrl}${API_URL.getWhatIFPredication}`, body, {
        headers,
      })
      .subscribe((result: any) => {
        callback(result);
      });
  }
  getColumnRanges(token: any, body: any, callback: (data: any) => void) {
    this.http
      .post<any>(`${this.env.apiUrl}${API_URL.getColumnRanges}`, body, {
        headers: this.createAuthorizationHeader(token),
      })
      .subscribe((result: any) => {
        callback(result);
      });
  }
}
