import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideScrollbarOptions } from 'ngx-scrollbar';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // provideClientHydration(),
    provideRouter(appRoutes),
    provideAnimationsAsync(),
    provideScrollbarOptions({
      visibility: 'hover',
      appearance: 'compact',
    }),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (iconRegistry: MatIconRegistry) => () => {
        const defaultFontSetClasses = iconRegistry.getDefaultFontSetClass();
        const outlinedFontSetClasses = defaultFontSetClasses
          .filter((fontSetClass) => fontSetClass !== 'material-icons')
          .concat(['material-symbols-outlined']);
        iconRegistry.setDefaultFontSetClass(...outlinedFontSetClasses);
      },
      deps: [MatIconRegistry],
    },
  ],
};
