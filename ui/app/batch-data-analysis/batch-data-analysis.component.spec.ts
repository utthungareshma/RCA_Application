import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchDataAnalysisComponent } from './batch-data-analysis.component';

describe('BatchDataAnalysisComponent', () => {
  let component: BatchDataAnalysisComponent;
  let fixture: ComponentFixture<BatchDataAnalysisComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BatchDataAnalysisComponent]
    });
    fixture = TestBed.createComponent(BatchDataAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
