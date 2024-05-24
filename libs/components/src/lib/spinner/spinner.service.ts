import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SpinnerService {
  private _visible$ = new BehaviorSubject(true);
  readonly visible$ = this._visible$.asObservable();

  show = () => {
    this._visible$.next(true);
  };
  hide = () => {
    this._visible$.next(false);
  };
}
