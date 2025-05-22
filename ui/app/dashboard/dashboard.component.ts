import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  constructor( public router: Router){}
  ngOnInit() {
   

    const token = JSON.parse(localStorage.getItem("token") || '{}');
    if (!token || Object.keys(token).length === 0) {
      this.router.navigate(['login'])
    }

    
  }
}
