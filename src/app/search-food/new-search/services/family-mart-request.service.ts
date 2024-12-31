import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { RequestService } from 'src/app/services/request.service'

import { Location } from '../../model/seven-eleven.model'

@Injectable({
  providedIn: 'root'
})
export class FamilyMartRequestService {

  constructor(
      private requestService: RequestService
    ) { }

    baseUrl = environment.familyMartUrl.base;

    getStores(): Observable<any> {
      const url = 'https://alan-cheng.github.io/friendly-time/assets/family_mart_stores.json'
      return this.requestService.get(url)
    }

    getNearByStoreList(location: Location): Observable<any> {
      const url = this.baseUrl + environment.familyMartUrl.endpoint.mapProductInfo
      const body = {
        "ProjectCode": "202106302",
        "OldPKeys": [],
        "PostInfo": "",
        "Latitude": location.Latitude,
        "Longitude": location.Longitude
      }
      return this.requestService.post(url, null, body)
    }

    getFoodDetails(): Observable<any> {
      // URL用github的取代，不拿資料夾內的靜態資源
      const url = 'https://alan-cheng.github.io/friendly-time/assets/family_mart_products.json'
      return this.requestService.get(url)
    }
}
