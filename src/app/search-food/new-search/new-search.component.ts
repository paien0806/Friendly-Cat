import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl } from '@angular/forms';

import { GeolocationService } from 'src/app/services/geolocation.service';
import { SevenElevenRequestService } from './services/seven-eleven-request.service';
import { FoodCategory, LocationData, StoreStockItem, Store } from '../model/seven-eleven.model'

import { environment } from 'src/environments/environment';

import { switchMap, from, of, catchError } from 'rxjs';

@Component({
  selector: 'app-new-search',
  templateUrl: './new-search.component.html',
  styleUrls: ['./new-search.component.scss'],
})
export class NewSearchComponent implements OnInit {
  searchForm: FormGroup; // 表單
  isLoading: boolean = false;
  selectedStoreName='';
  dropDown711List: any[] = [
    { StoreNo: '1', StoreName: '測試商店' },
    { StoreNo: '2', StoreName: '示範商店' }
  ];

  sevenElevenIconUrl = environment.sevenElevenUrl.icon;

  zipcodes: any[] = []; // 原始 API 資料
  cities: string[] = []; // 縣市清單
  filteredDistricts: any[] = []; // 篩選後的行政區列表

  selectedCity: string | null = null; // 選擇的縣市
  selectedDistrict: string | null = null; // 選擇的行政區
  selectedZipcode: string | null = null; // 對應的郵遞區號

  latitude!: number;
  longitude!: number;
  errorMessage?: string;

  foodCategories: FoodCategory[] = [];

  nearbyStores: StoreStockItem[] = []; // 儲存從 API 獲得的商店列表

  selectedCategory?: FoodCategory;
  selectedStore?: StoreStockItem;

  constructor(
    private http: HttpClient,
    private geolocationService: GeolocationService,
    private sevenElevenService: SevenElevenRequestService,
  ) {
    this.searchForm = new FormGroup({
      selectedStoreName: new FormControl(''), // 控制選中的商店
    });
  }

  ngOnInit(): void {
    this.init();
  }

  getCityName() {
    // 從縣市名稱 API 獲取資料
    const apiUrl = 'https://demeter.5fpro.com/tw/zipcodes.json'; // API URL
    this.http.get<any[]>(apiUrl).subscribe((data) => {
      this.zipcodes = data;
      // 提取不重複的縣市
      this.cities = [...new Set(data.map((item) => item.city_name))];
    });
  }

  // 當縣市選擇改變時
  onCityChange(city: string): void {
    // 根據選擇的縣市篩選行政區
    this.filteredDistricts = this.zipcodes.filter((item) => item.city_name === city);
    this.selectedDistrict = null; // 清空選中的行政區
    this.selectedZipcode = null; // 清空郵遞區號
  }

  // 當行政區選擇改變時
  onDistrictChange(zipcode: string): void {
    // 更新選擇的郵遞區號
    this.selectedZipcode = zipcode;
  }

  handleError(error: GeolocationPositionError): string {
    switch (error.code) {
      case 1:
        return '使用者拒絕位置存取';
      case 2:
        return '無法取得位置資訊';
      case 3:
        return '位置請求逾時';
      default:
        return '未知錯誤';
    }
  }



  init() {
    // 使用 from 將 Promise 轉換為 Observable
    this.getCityName();

    from(this.geolocationService.getCurrentPosition()).pipe(
      switchMap((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log('Latitude:', lat, 'Longitude:', lng);
        this.latitude = lat;
        this.longitude = lng;

        // 繼續發送 getAccessToken 請求
        return this.sevenElevenService.getAccessToken();
      }),
      switchMap((token: any) => {
        if (token && token.element) {
          sessionStorage.setItem('711Token', token.element);
          console.log('Stored 711Token:', sessionStorage.getItem('711Token'));
          // 如果 token 儲存成功，發送 getFoodCategory 請求
          return this.sevenElevenService.getFoodCategory();
        } else {
          // 如果 token 沒有成功返回，返回空陣列
          return of([]);
        }
      }),
      catchError((error) => {
        // 錯誤處理邏輯
        console.error('Error:', error);
        return of([]); // 在出錯時返回空陣列，防止應用崩潰
      })
    ).subscribe(
      (res) => {
        if (res && res.element) {
          this.foodCategories = res.element;
          console.log('Food Categories:', this.foodCategories);
          this.get711NearByStoreList();
        } else {
          console.error('Failed to fetch food categories');
        }
      }
    );
  }


  get711NearByStoreList() {
    const locationData: LocationData = {
      CurrentLocation: {
        Latitude: this.latitude,
        Longitude: this.longitude
      },
      SearchLocation: {
        Latitude: this.latitude,
        Longitude: this.longitude
      }
    };

    this.sevenElevenService.getNearByStoreList(locationData).subscribe((data) => {
      if (data && data.element && data.element.StoreStockItemList) {
        this.nearbyStores = data.element.StoreStockItemList.sort(
          (a: StoreStockItem, b: StoreStockItem) => a.Distance - b.Distance
        );
      }
    });
  }

  getFoodSubCategoryImage(nodeID: number): string | null {
    // 查找匹配的子分類
    for (let category of this.foodCategories) {
      const subCategory = category.Children.find(child => child.ID === nodeID);
      if (subCategory) {
        // 找到對應的子分類並返回其對應的分類圖片 URL
        return category.ImageUrl;
      }
    }
    // 如果沒有找到對應的子分類，返回 null
    return null;
  }

  getSubCategoryTotalQty(store: StoreStockItem, category: FoodCategory): number {
    let totalQty = 0;

    // 遍歷商店中的所有商品，檢查是否屬於當前分類及子分類
    for (const stockItem of store.CategoryStockItems) {
      // 遍歷每個分類的子項目，檢查是否屬於這個 category
      for (const child of category.Children) {
        if (stockItem.NodeID === child.ID) {
          totalQty += stockItem.RemainingQty;
        }
      }
    }

    return totalQty;
  }

  // 當用戶點擊某個分類時，切換選中的分類與店鋪
  toggleSubCategoryDetails(store: StoreStockItem, category: FoodCategory): void {
    this.selectedCategory = category;
    this.selectedStore = store;
  }

}
