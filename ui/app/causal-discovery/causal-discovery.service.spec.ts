import { TestBed } from '@angular/core/testing';

import { CausalDiscoveryService } from './causal-discovery.service';

describe('CausalDiscoveryService', () => {
  let service: CausalDiscoveryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CausalDiscoveryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
