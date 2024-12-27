import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { RequestService } from 'src/app/services/request.service'
import { LocationData } from '../../model/seven-eleven.model';
@Injectable({
  providedIn: 'root'
})
export class FamilyMartRequestService {

  constructor(
      private requestService: RequestService
    ) { }

    baseUrl = environment.familyMartUrl.base;

    getStores(): Observable<any> {
      const url = 'assets/family_mart_stores.json'
      return this.requestService.get(url)
    }
}
