import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GoogleTagManagerService {
  private gtmId = 'GTM-K6WZG3LV'; // Replace with your GTM ID

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  public init() {
    if (isPlatformBrowser(this.platformId)) {
      // Insert the GTM script into the <head>
      const script = document.createElement('script');
      script.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${this.gtmId}');
      `;
      document.head.appendChild(script);

      // Insert the <noscript> iframe into the <body>
      const noscript = document.createElement('noscript');
      noscript.innerHTML = `
        <iframe src="https://www.googletagmanager.com/ns.html?id=${this.gtmId}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe>
      `;
      document.body.insertBefore(noscript, document.body.firstChild);
    }
  }
}
