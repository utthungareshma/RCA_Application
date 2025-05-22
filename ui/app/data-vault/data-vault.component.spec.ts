import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataVaultComponent } from './data-vault.component';

describe('DataVaultComponent', () => {
  let component: DataVaultComponent;
  let fixture: ComponentFixture<DataVaultComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataVaultComponent]
    });
    fixture = TestBed.createComponent(DataVaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
