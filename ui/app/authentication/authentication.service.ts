import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnvService } from 'src/app/env.service';
import { API_URL } from 'src/app/utils/api-list';

export class RunTimeData {
  user: any;
  userInfo: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  runTimeData: RunTimeData = new RunTimeData();
  private currentUserSubject: BehaviorSubject<any>;

  constructor(private http: HttpClient, public env: EnvService) {
    this.currentUserSubject = new BehaviorSubject<any>(this.runTimeData.user);
  }

  login(loginObj: any) {
    return this.http
      .post<any>(`${this.env.apiUrl}${API_URL.loginURL}`, loginObj)
      .pipe(
        map((user: any) => {
          if (user.token) {
            this.runTimeData.user = user;
            this.currentUserSubject.next(user);
          }

          return user;
        })
      );
  }
  registerUser(body: any, callback: (data: any, error: any) => void) {
    this.http
      .post<any>(`${this.env.apiUrl}${API_URL.registerUser}`, body)
      .subscribe(
        (result: any) => {
          callback(result, null);
        },
        (error: any) => {
          callback(null, error);
        }
      );}
}
