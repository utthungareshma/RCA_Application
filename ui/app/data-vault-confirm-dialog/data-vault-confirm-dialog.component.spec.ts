import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataVaultConfirmDialogComponent } from './data-vault-confirm-dialog.component';

describe('DataVaultConfirmDialogComponent', () => {
  let component: DataVaultConfirmDialogComponent;
  let fixture: ComponentFixture<DataVaultConfirmDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataVaultConfirmDialogComponent]
    });
    fixture = TestBed.createComponent(DataVaultConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
