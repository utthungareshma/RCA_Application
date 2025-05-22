import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders,HttpEventType } from '@angular/common/http';
import { EnvService } from '../env.service';
import { API_URL } from '../utils/api-list';

@Injectable({
  providedIn: 'root'
})
export class BatchDataAnalysisService {
  // apiUrl = `${this.env.apiUrl}${API_URL.getCtreatePrompt}`;
  apiUrl = "http://localhost:8000/api/run-script/"
  plotUrl = "http://localhost:8000/api/png_files/"
  
  apiUrl_fiverecord = `${this.env.apiUrl}${API_URL.getHmiHistory}`
  token: any;

  constructor(private http: HttpClient,private env:EnvService) {
    this.token = JSON.parse(localStorage.getItem("token") || '{}');
   }
   sendMessage(body:any): Observable<any>{
        return this.http.post<any>(this.apiUrl,body).pipe(
          map(res=>{
            return res
          }),
          catchError(err=>{
            let errorMessage = 'An error occurred while processing your request.';
        return throwError(err.error.error);
          })
        );
  }
  plotImage(): Observable<any>{
    return this.http.get<any>(this.plotUrl).pipe(
      map(res=>{
        return res
      }),
      catchError(err=>{
        let errorMessage = 'An error occurred while processing your request.';
    return throwError(err.error.error);
      })
    );
}
  sendLastFiveRecords(username:string):Observable<any>
  {
    const headers = `${this.apiUrl_fiverecord}?username=${username}`;
    return this.http.get<any>(headers)
  }
  getFolderList(token: any, callback: (data: any) => void) {
    const headers = new HttpHeaders({
      'content-type':'application/json',
       Authorization: `Token ${token}`,
    })
    this.http
      .get<any>(`${this.env.apiUrl}${API_URL.getFolderList}`, {
        headers: headers,
      })
      .subscribe((result: any) => {
        callback(result);
      });
  }
  getFileList(token: any,body: any, callback: (data: any) => void) {
    const headers = new HttpHeaders({
      'content-type':'application/json',
       Authorization: `Token ${token}`,
    })
    this.http
      .post<any>(`${this.env.apiUrl}${API_URL.getFileList}`,body,  {
        headers: headers,
      })
      .subscribe((result: any) => {
       
        callback(result);
      });
  }

  movefiles():Observable<any>{
    console.log("143");
  return this.http.post<any>('http://localhost:8000/api/move-png-files/',{})
  }

  deletePNGFiles(): Observable<any> {
    return this.http.delete<any>('http://localhost:8000/api/delete_png/');
  }
}
