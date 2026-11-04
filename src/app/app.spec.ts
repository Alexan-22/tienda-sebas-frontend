
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App - Sebas Collection', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App]
    }).compileComponents();
  });

  it('debe crear correctamente la aplicación', () => {
    const fixture = TestBed.createComponent(App);

    const app = fixture.componentInstance;

    expect(app).toBeTruthy();
  });

  it('debe mostrar el router-outlet principal', async () => {
    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    const routerOutlet = compiled.querySelector('router-outlet');

    expect(routerOutlet).not.toBeNull();
  });

});
