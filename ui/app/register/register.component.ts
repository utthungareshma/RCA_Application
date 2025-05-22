import { Component, OnInit } from '@angular/core';
import { RegisterDTO } from '../login/user';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit{
  registerDTO: RegisterDTO = new RegisterDTO();

ngOnInit(): void {
  this.registerDTO.registerForm = new FormGroup({
    username : new FormControl('', [Validators.required]),
    password:new FormControl('',Validators.required),
    email:new FormControl(''),
    phone_number:new FormControl('')
  })
}
constructor(private route: Router, 
  private authenticationService:AuthenticationService,
  private _snackBar: MatSnackBar,
  private router : Router)
{}
registerUser(value: any) {
  const body = {
    username: value.username,
    password: value.password,
    email: value.email,
  };
  this.authenticationService.registerUser(body, (result: any, error: any) => {
    if (result) {
      console.log("37",result);
      this._snackBar.open('User registration successful', 'Close', {
        // duration: 3000,
      }).onAction().subscribe(()=>{
        this.router.navigate(['/login'])
      });
    }
    else {
      console.error("Registration failed:", error);
      this._snackBar.open(' User registration failed', 'Close', {
        duration: 3000,
      })
    }
  });
}
}
