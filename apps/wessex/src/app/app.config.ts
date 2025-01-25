import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  type ApplicationConfig,
  inject,
  provideAppInitializer,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideScrollbarOptions } from 'ngx-scrollbar';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // provideClientHydration(),
    provideExperimentalZonelessChangeDetection(),
    provideRouter(appRoutes),
    provideHttpClient(
      // withInterceptors([
      // ]),
      withFetch(),
    ),
    provideAnimationsAsync(),
    provideScrollbarOptions({
      visibility: 'hover',
      appearance: 'compact',
    }),
    provideAppInitializer(() => {
      const iconRegistry = inject(MatIconRegistry);

      const defaultFontSetClasses = iconRegistry.getDefaultFontSetClass();
      const outlinedFontSetClasses = defaultFontSetClasses
        .filter((fontSetClass) => fontSetClass !== 'material-icons')
        .concat(['material-symbols-outlined']);
      iconRegistry.setDefaultFontSetClass(...outlinedFontSetClasses);
    }),
  ],
};
