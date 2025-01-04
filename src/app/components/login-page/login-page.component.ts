import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
  isRegister = false; // 判斷是否顯示註冊頁面
  authForm: FormGroup; // Reactive Form
  errorMessage = ''; // 錯誤訊息

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dialogRef: MatDialogRef<LoginPageComponent>
  ) {
    // 初始化表單
    this.authForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        rePassword: [''], // 只有註冊頁面需要
        displayName: [''], // 只有註冊頁面需要
      },
      {
        validators: [this.passwordMatchValidator, this.displayNameRequiredValidator.bind(this)], // 自訂驗證器
      }
    );
  }

  // 自訂驗證器：檢查密碼是否一致
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const rePassword = group.get('rePassword')?.value;
    if (password && rePassword && password !== rePassword) {
      return { passwordsMismatch: true };
    }
    return null;
  }

  displayNameRequiredValidator(group: AbstractControl): ValidationErrors | null {
    const isRegister = this.isRegister; // 使用目前的 isRegister 狀態
    const displayName = group.get('displayName')?.value;
  
    if (isRegister && (!displayName || displayName.trim() === '')) {
      return { displayNameRequired: true };
    }
    return null;
  }
  

  // 提交表單
  submitForm() {
    if (this.authForm.invalid) {
      this.markFormGroupTouched(this.authForm);
      this.errorMessage = '請確認以下欄位：\n' + this.collectErrors(this.authForm);
      return;
    }

    if (this.isRegister) {
      this.register();
    } else {
      this.login();
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  private collectErrors(formGroup: FormGroup): string {
    const errors: string[] = [];
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control && control.errors) {
        if (control.errors['required']) {
          errors.push(`${this.getFieldDisplayName(key)} 為必填`);
        }
        if (control.errors['email']) {
          errors.push(`${this.getFieldDisplayName(key)} 格式不正確`);
        }
        if (control.errors['minlength']) {
          errors.push(
            `${this.getFieldDisplayName(key)} 至少需要 ${control.errors['minlength'].requiredLength} 個字元`
          );
        }
      }
    });

    if (formGroup.errors?.['passwordsMismatch']) {
      errors.push('密碼與確認密碼不一致');
    }

    return errors.join('\n');
  }

  private getFieldDisplayName(field: string): string {
    const fieldNames: { [key: string]: string } = {
      email: 'Email',
      password: '密碼',
      rePassword: '確認密碼',
      displayName: '暱稱',
    };
    return fieldNames[field] || field;
  }

  // 登入邏輯
  login() {
    const { email, password } = this.authForm.value;
    this.authService
      .login(email, password)
      .then(() => {
        console.log('一般登入成功');
        this.close(true);
      })
      .catch(error => {
        console.error(error.message);
        this.errorMessage = error.message;
      });
  }

  // 註冊邏輯
  register() {
    const { email, password, displayName } = this.authForm.value;
    this.authService
      .register(email, password, displayName)
      .then(() => {
        this.errorMessage = '註冊成功，請重新輸入帳號密碼登入';
        this.authForm.reset();
        this.isRegister = false; // 切回登入頁面
        this.close(true);
      })
      .catch(error => {
        console.error(error.message);
        this.errorMessage = error.message;
      });
  }

  // Google 登入邏輯
  loginWithGoogle() {
    this.authService
      .loginWithGoogle()
      .then(() => {
        console.log('Google登入成功');
        this.close(true);
      })
      .catch(error => {
        console.error(error.message);
        this.errorMessage = error.message;
      });
  }

  // 關閉對話框
  close(data: boolean) {
    this.dialogRef.close(data);
  }

  // 快速存取表單控制項
  get f() {
    return this.authForm.controls;
  }
}
