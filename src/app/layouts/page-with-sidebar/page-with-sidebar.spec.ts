import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageWithSidebar } from './page-with-sidebar';

describe('PageWithSidebar', () => {
  let component: PageWithSidebar;
  let fixture: ComponentFixture<PageWithSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageWithSidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(PageWithSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
