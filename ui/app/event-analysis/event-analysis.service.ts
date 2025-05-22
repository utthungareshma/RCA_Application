import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/env.service';
import { API_URL } from '../utils/api-list';
interface CqaDetails {
  Product: string;
  Cqa_kpi: string;
  Lower_bound?: number;
  Upper_bound?: number;
  Target_value?: number | string;
  Batch?: number | string;
  GB?: number | string;
}
@Injectable({
  providedIn: 'root',
})

export class EventAnalysisService {
  constructor(private http: HttpClient, public env: EnvService) {}
  createAuthorizationHeader(token: any): any {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    });
    return headers;
  }

  public staticCqaDetails: CqaDetails[] = [
    { Product: '40059', Cqa_kpi: 'Viscosity', Lower_bound: 4200, Upper_bound: 4800 },
    { Product: '40059', Cqa_kpi: 'Acid_number', Lower_bound: 0.9, Upper_bound: 1.2 },
    { Product: '40059', Cqa_kpi: 'Hydroxyl_determ_polyesters', Lower_bound: 193, Upper_bound: 207 },
    { Product: '40059', Cqa_kpi: 'Water_content', Lower_bound: .07, Upper_bound:  0},
    { Product: '40059', Cqa_kpi: 'Appear', Target_value: 'H' },
    { Product: '40059', Cqa_kpi: 'Penicillin concentration(P:g/L)', Lower_bound: 20, Upper_bound: 0 },
   
  ];

  public staticdf_cqa: CqaDetails[] = [
    { Product: '40059', Cqa_kpi: 'Viscosity', Lower_bound: 4200, Upper_bound: 4800, Batch: 4500, GB: 5000 },
    { Product: '40059', Cqa_kpi: 'Acid_number', Lower_bound: 0.9, Upper_bound: 1.2, Batch: .58, GB: 1.75 },
    { Product: '40059', Cqa_kpi: 'Hydroxyl_determ_polyesters', Lower_bound: 193, Upper_bound: 207, Batch: 180, GB: 190 },
    { Product: '40059', Cqa_kpi: 'Water_content', Lower_bound: .07, Upper_bound: .08, Batch: 0, GB: 0 },
    { Product: '40059', Cqa_kpi: 'Penicillin concentration(P:g/L)', Lower_bound: 20, Upper_bound: 0, Batch: 0, GB: 0 },
  ];
  getFiles(token: any, callback: (data: any) => void) {
    this.http
      .get<any>(`${this.env.apiUrl}${API_URL.getFiles}`, {
        headers: this.createAuthorizationHeader(token),
      })
      .subscribe((result: any) => {
        callback(result);
      });
  }
  getColumnHeaders(token: any, body: any, callback: (data: any) => void) {
    this.http
      .post<any>(`${this.env.apiUrl}${API_URL.getcolumnheaders}`, body, {
        headers: this.createAuthorizationHeader(token),
      })
      .subscribe((result: any) => {
        callback(result);
      });
   
  }
  getColumnValues(token: any, body: any, callback: (data: any) => void) {
    this.http
      .post<any>(`${this.env.apiUrl}${API_URL.getcolumnvalue}`, body, {
        headers: this.createAuthorizationHeader(token),
      })
      .subscribe((result: any) => {
        callback(result);
      });
  }
  getBatchProduct(token: any, body: any, callback: (data: any) => void) {
    this.http
      .post<any>(`${this.env.apiUrl}${API_URL.getuniqueproduct}`, body, {
        headers: this.createAuthorizationHeader(token),
      })
      .subscribe((result: any) => {
        callback(result);
      });
  }
  getRecipeColumnValues(token: any, body: any, callback: (data: any) => void) {
    this.http
      .post<any>(`${this.env.apiUrl}${API_URL.getrecipecolumnvalues}`, body, {
        headers: this.createAuthorizationHeader(token),
      })
      .subscribe((result: any) => {
        callback(result);
      });
  }
  
  compareBatchWithGb(token: any, body: any, callback: (data: any) => void) {
    this.http
      .post<any>(`${this.env.apiUrl}${API_URL.compareBatchWithGb}`, body, {
        headers: this.createAuthorizationHeader(token),
      })
      .subscribe((result: any) => {
        callback(result);
      });
  }
  ColumnMinMaxValue(token: any, body: any, callback: (data: any) => void) {
    this.http
      .post<any>(`${this.env.apiUrl}${API_URL.getColumnRanges}`, body, {
        headers: this.createAuthorizationHeader(token),
      })
      .subscribe((result: any) => {
        callback(result);
      });
  }
  getCqaDetailsForKpiList(cqaKpiList: string[]): CqaDetails[] {
    return this.staticCqaDetails.filter(item => cqaKpiList.includes(item.Cqa_kpi));
  }
  getdf_CqaDetailsForKpiList(cqaKpiList: string[]): CqaDetails[] {
    return this.staticdf_cqa.filter(item => cqaKpiList.includes(item.Cqa_kpi));
  }
}
