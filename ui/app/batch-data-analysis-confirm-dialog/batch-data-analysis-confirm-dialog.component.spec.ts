import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchDataAnalysisConfirmDialogComponent } from './batch-data-analysis-confirm-dialog.component';

describe('BatchDataAnalysisConfirmDialogComponent', () => {
  let component: BatchDataAnalysisConfirmDialogComponent;
  let fixture: ComponentFixture<BatchDataAnalysisConfirmDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BatchDataAnalysisConfirmDialogComponent]
    });
    fixture = TestBed.createComponent(BatchDataAnalysisConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
