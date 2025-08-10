import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class LoadJavascriptService {

  constructor( ) {
  }

load(archivos: string[]){

  for(let archivo of archivos){
    let script = document.createElement('script');
    script.src = "../../assets/js/" + archivo + ".js";
    script.type = "text/javascript";
    script.async = true;
    console.log(script.src)
    let body = document.getElementsByTagName('body')[0];
    body.appendChild(script);
  }
}
}
