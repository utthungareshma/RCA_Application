import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfDialogComponent } from './pdf-dialog.component';

describe('PdfDialogComponent', () => {
  let component: PdfDialogComponent;
  let fixture: ComponentFixture<PdfDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PdfDialogComponent]
    });
    fixture = TestBed.createComponent(PdfDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
