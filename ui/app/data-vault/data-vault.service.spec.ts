import { TestBed } from '@angular/core/testing';

import { DataVaultService } from './data-vault.service';

describe('DataVaultService', () => {
  let service: DataVaultService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataVaultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
