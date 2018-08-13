import { Component } from '@angular/core';
import { NavController ,LoadingController} from 'ionic-angular';
import { RegisterPage } from '../register/register';
import { Service } from '../../providers/service';
import { TabsPage } from '../tabs/tabs';
import { Storage } from '@ionic/storage';

// import { HomePage } from '../home/home'
/*
  Generated class for the Login page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  loader:any;
  private _fireAuth:any;
  data={email:'',password:''}

  constructor(private navCtrl: NavController,private loadingCtrl: LoadingController,public _service:Service,public storage: Storage) {


  }

  ionViewDidLoad() {
    console.log('Hello LoginPage Page');
  }
  ionViewWillEnter(){
    this.storage.get('userData').then((val) => {
        let data = JSON.parse(val)
        if(data)
        {
          this.navCtrl.setRoot(TabsPage)
        }
   })
  }
  login(){
     this.showLoading()
    ///console.log(JSON.stringify(this.data);
    this._service.signIn(this.data).then((res)=>{
      if(res)
      {
           this._service.getLoginUserData(res).then((resp) =>{
               this.storage.set('userData',JSON.stringify(resp));
                setTimeout(() =>{
                  this._service.toast('Connexion réussie ')
                   this.navCtrl.setRoot(TabsPage)
                   this.loader.dismiss();
                 },3000)
             })
      }
      else
      {
           this.loader.dismiss();
      }
    });
  }

  goToRegisterPage()
  {
    this.navCtrl.push(RegisterPage);
  }
  showLoading() {
    this.loader = this.loadingCtrl.create({
      content: 'Chargement'
    });
    this.loader.present();
  }
}
