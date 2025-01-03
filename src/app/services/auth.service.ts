import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { getDatabase, ref, get } from 'firebase/database';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';  // Firebase
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private auth: Auth,
    private afAuth: AngularFireAuth
  ) { }

  // 這裡返回的是 Observable，訂閱後能夠獲得用戶的狀態
  get user(): Observable<firebase.User | null> {
    return this.afAuth.authState;  // 這裡返回的是 Observable
  }

  // 使用電子郵件與密碼登入
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // 註冊新帳號
  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  // Google OAuth2 Login
  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  // 檢查是否已經登入
  isLoggedIn(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      map(user => user !== null)  // 用戶存在表示已登入
    );
  }

  // 獲取用戶資料
  getUser(): Observable<any> {
    return new Observable(observer => {
      onAuthStateChanged(this.auth, user => {
        observer.next(user);
      });
    });
  }

  logout(): void {
    this.afAuth.signOut();
  }

  getAuthState(): Observable<any>{
    return this.afAuth.authState;
  }

  getUserData(uid: string): Promise<any> {
    const db = getDatabase();
    const userRef = ref(db, `users/${uid}`);
    return get(userRef).then((snapshot) => snapshot.val());
  }
}
