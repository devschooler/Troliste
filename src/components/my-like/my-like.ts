import { Directive } from '@angular/core';

/*
  Generated class for the MyLike directive.

  See https://angular.io/docs/ts/latest/api/core/index/DirectiveMetadata-class.html
  for more info on Angular 2 Directives.
*/
@Directive({
  selector: '[my-like]' // Attribute selector
})
export class MyLike {

  constructor() {
    console.log('Hello MyLike Directive');
  }

}
