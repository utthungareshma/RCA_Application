import { TestBed } from '@angular/core/testing';

import { BatchDataAnalysisService } from './batch-data-analysis.service';

describe('BatchDataAnalysisService', () => {
  let service: BatchDataAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BatchDataAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
