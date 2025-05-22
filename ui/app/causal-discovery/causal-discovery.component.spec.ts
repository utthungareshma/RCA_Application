import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CausalDiscoveryComponent } from './causal-discovery.component';

describe('CausalDiscoveryComponent', () => {
  let component: CausalDiscoveryComponent;
  let fixture: ComponentFixture<CausalDiscoveryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CausalDiscoveryComponent]
    });
    fixture = TestBed.createComponent(CausalDiscoveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
