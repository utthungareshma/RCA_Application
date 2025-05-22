import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {

  public apiUrl = 'http://127.0.0.1:8000';
  // Whether or not to enable debug mode
  public enableDebug = true;

  constructor() { }
}
