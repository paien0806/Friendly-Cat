import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { GeolocationService } from 'src/app/services/geolocation.service';
import { SevenElevenRequestService } from './services/seven-eleven-request.service';
import { FoodCategory, LocationData, StoreStockItem } from '../model/seven-eleven.model'

@Component({
  selector: 'app-new-search',
  templateUrl: './new-search.component.html',
  styleUrls: ['./new-search.component.scss']
})
export class NewSearchComponent implements OnInit {
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

  constructor(
    private http: HttpClient,
    private geolocationService: GeolocationService,
    private sevenElevenService: SevenElevenRequestService
  ) {}

  ngOnInit(): void {
    this.getCityName();
    this.get711AccessToken();
    this.get711FoodCategory();
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

  get711AccessToken() {
    this.sevenElevenService.getAccessToken().subscribe((data) => {
      if(data && data.element) {
        console.log(data.element)
        sessionStorage.setItem('711Token', data.element);
      }
    })
  }

  get711FoodCategory() {
    this.sevenElevenService.getFoodCategory().subscribe((data) => {
      if(data) {
        this.foodCategories = data.element
      }
    });
  }

  get711NearByStoreList() {
    this.geolocationService.getCurrentPosition()
      .then((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.errorMessage = undefined;
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
      })
      .catch((error) => {
        this.errorMessage = this.handleError(error);
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
}
