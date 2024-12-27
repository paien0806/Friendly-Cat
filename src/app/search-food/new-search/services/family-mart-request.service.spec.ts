import { TestBed } from '@angular/core/testing';

import { FamilyMartRequestService } from './family-mart-request.service';

describe('FamilyMartRequestService', () => {
  let service: FamilyMartRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FamilyMartRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
