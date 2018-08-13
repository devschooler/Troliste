import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { ToastController } from 'ionic-angular';
import * as firebase from 'firebase';
import { Storage } from '@ionic/storage';

import 'rxjs/add/operator/map';

/*
  Generated class for the Service provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Service {
  private _fireAuth:any;
  private _db: any;
  private _userRef:any;
  public _post:any;
  constructor(public http: Http,public toastCtrl:ToastController) {
    this._fireAuth = firebase.auth();
    this._db = firebase.database().ref('/');
    this._userRef = firebase.database().ref('user');
    console.log('Hello Service Provider');
  }

  signIn(data)
  {
    return new Promise(resolve => {

      return  this._fireAuth.signInWithEmailAndPassword(data.email, data.password).then((data) =>{
          resolve(data);

        },(error) =>{
        this.toast(error)
           resolve(false);
        });
    })
  }

  registerUser(data)
  {    // return this._userRef.push(data).key;
    return new Promise(resolve => {
      return this._fireAuth.createUserWithEmailAndPassword(data.email, data.password)
      .then((res) => {
        // let usrId = res.uid;
        // return res
        let tempData = data;
        tempData.uid = res.uid;
        let resKey = this._userRef.push(tempData).key;
        console.log(resKey);
        resolve(tempData);
      },(error) =>{
        this.toast(error)
        resolve(false);
        return false;
      });
    })
  }

  toast(message)
  {
      let toast = this.toastCtrl.create({
        message: message,
        duration: 2000,
        position: 'bottom'
      });
      toast.present();
  }

  getLoginUserData(userData)
  {
    return new Promise(resolve => {
      return this._userRef.orderByChild('uid').equalTo(userData.uid).on('value',function(snap){
        let res = snap.val();
        let userData = {
          userKey:''
        }
        if(res){
          for (var k in res) {
              userData = res[k];
              userData.userKey = k;
          }

          resolve(userData);
        }
      })
    })
  }
  addPost(data)
  {
      return this._post.push(data).key;
  }
}
