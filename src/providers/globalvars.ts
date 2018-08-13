import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class GlobalVars {
myGlobalVar;
  constructor(public storage: Storage) {
    this.myGlobalVar = "";
  }

  setMyGlobalVar(value) {
    this.myGlobalVar = value;
    this.storage.set('userData',value)
  }

  getMyGlobalVar() {
    // return this.myGlobalVar;
    return  this.storage.get('userData')
  }

  setToUserKey(value){
    this.storage.set('toUserKey',value)
  }

  getToUserKey(){
    return this.storage.get('toUserKey')
  }

}
