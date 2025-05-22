import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';
import { LoginDTO } from './user';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginDTO: LoginDTO = new LoginDTO();

  public loginFormGroup!: FormGroup;
  public showPassword: boolean = false;
  loader : boolean = false;
  constructor(
    private router: Router,
    public authenticationService: AuthenticationService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loginDTO.loginForm = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.maxLength(200),
      ]),
    });
  }
  login() {
    this.router.navigate(['/dashboard']);
  }

  public checkError = (controlName: string, errorName: string) => {
    return this.loginFormGroup.controls[controlName].hasError(errorName);
  };

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(value: any) {
    this.loader = true
    if (!value.username && !value.password) {
      this._snackBar.open('Username and password Required', 'Error');
    } else {
      const userData = {
        username: value.username,
        password: value.password,
      };
      this.authenticationService.login(userData).subscribe(
        (result: any) => {
          this.loader = false;
          localStorage.setItem('token', JSON.stringify(result.token));
          localStorage.setItem(
            'username',
            JSON.stringify(result.username)
          );
          const user = {
            username: result.username,
            token: result.token,
          };

          this.authenticationService.runTimeData.userInfo = user;
          this.authenticationService.runTimeData.user.user = user;
          this.router.navigate(['/batch-analysis']);
        },
        (error) => {
          this.loader = false;
          let errorMessage = 'Please provide valid Username and password';
        if (error && error.error && error.error.non_field_errors) {
          errorMessage = error.error.non_field_errors[0];
        }
        this._snackBar.open(errorMessage, 'Error',{
          duration:2000
        });
        }
      );
    }
  }
  registerUser()
  {
    this.router.navigate(['/register'])
  }
}
