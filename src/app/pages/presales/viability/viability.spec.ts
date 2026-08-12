import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Viability } from './viability';

describe('Viability', () => {
  let component: Viability;
  let fixture: ComponentFixture<Viability>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Viability],
    }).compileComponents();

    fixture = TestBed.createComponent(Viability);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
