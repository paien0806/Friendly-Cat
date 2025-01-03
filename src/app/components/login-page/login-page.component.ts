import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
  email: string = '';
  password: string = '';

  errorMessage: string = '';

  constructor(
    // @Inject(MAT_DIALOG_DATA) public data: any, // 接收傳遞的數據
    private router: Router,
    private dialogRef: MatDialogRef<LoginPageComponent>,
    private authService: AuthService
  ) {
  }

  // 使用電子郵件與密碼登入
  login() {
    this.authService.login(this.email, this.password)
      .then(() => {
        console.log('一般登入成功')
        this.close(true);
      })
      .catch((error) => {
        console.error(error.message)
        this.errorMessage = error.message
      });
  }

  // 註冊新帳號
  register() {
    this.authService.register(this.email, this.password)
      .then(() => {
        this.errorMessage = '註冊成功，請重新輸入帳號密碼登入'
        this.email = ''
        this.password = ''
        return
      })
      .catch((error) => {
        console.error(error.message)
        this.errorMessage = error.message
      });
  }

  // Google OAuth2 Login
  loginWithGoogle() {
    return this.authService.loginWithGoogle()
      .then(() => {
        console.log('Google登入成功')
        this.close(true)
      })
      .catch((error) => {
        console.log(error.errorMessage)
        this.errorMessage = error.message
      });
  }

  close(data: boolean) {
    this.dialogRef.close(data);
  }
}
