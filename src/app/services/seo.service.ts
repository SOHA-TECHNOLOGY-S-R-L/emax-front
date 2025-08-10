import { HttpClient } from "@angular/common/http";
import { DOCUMENT, inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Role } from "../models/role";
import { Modulo } from "../models/modulo";
import { environment } from "../../environments/environment";
import { Meta, Title } from "@angular/platform-browser";


@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private _document: Document = inject(DOCUMENT);
  public meta: Meta = inject(Meta);
  public title: Title = inject(Title);

  serCanonicalURL(url?: string) {
    const canURL = url == undefined ? this._document.URL : url;
    const head = this._document.getElementsByTagName('head')[0];
    let element: HTMLLinkElement | null = this._document.querySelector(`link[rel='canonical']`);
    if (!element) {
      element = this._document.createElement('link') as HTMLLinkElement;
      head.appendChild(element);
    }
    element.setAttribute('href', 'canonical');
    element.setAttribute('href', canURL);

  }

  setIndexFollow(state:boolean = true){
    this.meta.updateTag({name:"robots",content: state ? "index, follow": "noindex, nofollow" })
  }





}
