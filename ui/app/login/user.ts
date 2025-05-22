import { FormGroup } from "@angular/forms";

export class LoginDTO {
    loginForm: FormGroup | any;
    isFormLoading = false;
    showPassword: boolean | any;
    errormsg: any;
    loading = false;
    privilege: any;
    userName: string | any;
    roleList: any;
    isFTC = false;
    wdm: any;
    redundancySyncState: any;
    enableButton = true;
    appLogo ="assets/iamges/rockwell.svg";
  }
  export class RegisterDTO{
    registerForm : FormGroup | any;
  }