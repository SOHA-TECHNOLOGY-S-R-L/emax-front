import { Injectable } from '@angular/core';

import * as moment from 'moment-timezone'

@Injectable({
  providedIn: 'root'
})
export class ZonaHorariaDefectoService {

  constructor() { }
  setDefaultTimeZone(){
  moment.tz.setDefault('America/Lima');

  }
}
