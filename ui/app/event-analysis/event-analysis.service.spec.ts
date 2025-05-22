import { TestBed } from '@angular/core/testing';

import { EventAnalysisService } from './event-analysis.service';

describe('EventAnalysisService', () => {
  let service: EventAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
