import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { RequestService } from 'src/app/services/request.service'

@Injectable({
  providedIn: 'root'
})
export class SevenElevenRequestService {

  constructor(
    private requestService: RequestService
  ) { }

  getAccessToken(): Observable<any> {
    const url = environment.sevenElevenUrl.base + environment.sevenElevenUrl.endpoint.accessToken;
    const params = environment.sevenElevenUrl.params;

    return this.requestService.post(url, params);
  }
}
