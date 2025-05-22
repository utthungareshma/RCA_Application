import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventAnalysisComponent } from './event-analysis.component';

describe('EventAnalysisComponent', () => {
  let component: EventAnalysisComponent;
  let fixture: ComponentFixture<EventAnalysisComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EventAnalysisComponent]
    });
    fixture = TestBed.createComponent(EventAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
