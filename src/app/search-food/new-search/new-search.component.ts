import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { GeolocationService } from 'src/app/services/geolocation.service';
import { SevenElevenRequestService } from './services/seven-eleven-request.service';
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

  latitude?: number;
  longitude?: number;
  errorMessage?: string;

  test = ''

  constructor(
    private http: HttpClient,
    private geolocationService: GeolocationService,
    private sevenElevenService: SevenElevenRequestService
  ) {}

  ngOnInit(): void {
    this.getCityName();
    this.get711AccessToken();
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

  getLocation() {
    this.geolocationService
      .getCurrentPosition()
      .then((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.errorMessage = undefined;
      })
      .catch((error) => {
        this.errorMessage = this.handleError(error);
      });
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

  get711StoreByString() {

  }

  get711NearByStoreList() {

  }
}
