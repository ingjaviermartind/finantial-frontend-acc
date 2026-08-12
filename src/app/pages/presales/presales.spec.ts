import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Presales } from './presales';

describe('Presales', () => {
  let component: Presales;
  let fixture: ComponentFixture<Presales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Presales],
    }).compileComponents();

    fixture = TestBed.createComponent(Presales);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
