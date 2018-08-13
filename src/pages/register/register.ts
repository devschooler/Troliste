import { Component } from '@angular/core';
import { NavController,ActionSheetController,LoadingController} from 'ionic-angular';
import { LoginPage } from '../login/login';
import { FormBuilder, FormGroup, Validators,AbstractControl } from '@angular/forms';
import { Camera } from 'ionic-native';
import { Service } from '../../providers/service';
import { TabsPage }  from '../tabs/tabs';
import { Storage } from '@ionic/storage';

 /*
  Generated class for the Register page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage {
registerForm:any;
loader:any;
firstName :AbstractControl;
profileimage:any;
  constructor(public navCtrl: NavController, public formBuilder: FormBuilder,private loadingCtrl: LoadingController,public actionSheetCtrl: ActionSheetController,public _service:Service,public storage: Storage) {
        this.profileimage = 'assets/profile-default.jpg'
        this.registerForm = formBuilder.group({
           firstName: ['',Validators.required],
           lastName: ['',Validators.required],
           email:['',Validators.required],
          
           Pseudo:['',Validators.required],
           password:['',Validators.required],
        });
      }
  ionViewDidLoad() {
    console.log('Hello RegisterPage Page');
  }

  profilePic()
  {
    let actionSheet = this.actionSheetCtrl.create({
     title: 'Choose your image',
     buttons: [
       {
         text: 'Gallery',
         role: 'destructive',
         handler: () => {
            this.openCamera(0)
           console.log('Destructive clicked');
         }
       },{
         text: 'Camera',
         handler: () => {
           this.openCamera(1)
           console.log('Archive clicked');
         }
       },{
         text: 'Cancel',
         role: 'cancel',
         handler: () => {
           console.log('Cancel clicked');
         }
       }
     ]
   });
   actionSheet.present();
  }

  // choose image from gallery/camera
  openCamera(type){

    var options = {
      quality: 100,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: type,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 500,
      targetHeight: 500,
      saveToPhotoAlbum: false,
	     correctOrientation:true
    };

    Camera.getPicture(options).then((imageData) => {
    // imageData is either a base64 encoded string or a file URI
    // If it's base64:
    this.profileimage = 'data:image/jpeg;base64,' + imageData;
    }, (err) => {
    // Handle error
    });
  }

  login()
  {
    // console.log(this.registerForm.value)
     this.navCtrl.setRoot(LoginPage)
  }


  register(){
    this.showLoading()
    let _data = {
      firstName: this.registerForm.controls['firstName']._value,
      lastName: this.registerForm.controls['lastName']._value,
      email: this.registerForm.controls['email']._value,
      Pseudo: this.registerForm.controls['Pseudo']._value,
      password: this.registerForm.controls['password']._value,
      profilePic:this.profileimage
    }

    this._service.registerUser(_data).then((data) => {

      if(data)
      {
        this._service.getLoginUserData(data).then((resp) =>{
          console.log(resp)
          this.storage.set('userData',JSON.stringify(resp))
          setTimeout(() =>{
              this._service.toast('Enregistrement réussi');
              this.loader.dismiss();
              this.navCtrl.setRoot(TabsPage);
          },3000)
        })
      }
      else
      {
        this.loader.dismiss();
      }
    });

  }

  showLoading() {
    this.loader = this.loadingCtrl.create({
      content: 'Chargement'
    });
    this.loader.present();
  }


}
