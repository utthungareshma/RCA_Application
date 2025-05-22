import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CqalistComponent } from './cqalist.component';

describe('CqalistComponent', () => {
  let component: CqalistComponent;
  let fixture: ComponentFixture<CqalistComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CqalistComponent]
    });
    fixture = TestBed.createComponent(CqalistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
