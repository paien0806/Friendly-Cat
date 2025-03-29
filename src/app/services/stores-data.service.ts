import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // 全局單例服務
})
export class StoreDataService {
  private storesSubject = new BehaviorSubject<any[]>([]); // 用 BehaviorSubject 儲存商店列表
  public stores$: Observable<any[]> = this.storesSubject.asObservable(); // 提供訂閱的 Observable

  // 更新商店列表
  setStores(stores: any[]) {
    this.storesSubject.next(stores);
  }

  // 獲取當前商店列表（同步方式）
  getStores(): any[] {
    return this.storesSubject.getValue();
  }
}