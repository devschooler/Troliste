import { Directive } from '@angular/core';
import { Storage } from '@ionic/storage';

@Directive({
  selector: '[my-like]'
})
export class MyLike {

  constructor(public storage: Storage) {
    console.log('Hello ElasticHeader Directive');
  }

}
