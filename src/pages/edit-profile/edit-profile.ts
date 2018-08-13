import { Component } from '@angular/core';
import { NavController,ActionSheetController,LoadingController,NavParams} from 'ionic-angular';
import { ProfilePage } from '../profile/profile';
import { FormBuilder, FormGroup, Validators,AbstractControl } from '@angular/forms';
import { Camera } from 'ionic-native';
import { Service } from '../../providers/service';
import { TabsPage }  from '../tabs/tabs';
import { Storage } from '@ionic/storage';
import * as firebase from 'firebase';

/*
  Generated class for the EditProfile page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html'
})
export class EditProfilePage {
  registerForm:any;
  loader:any;
  firstName :AbstractControl;
  profileimage:any;
  userData;
  _user;
    constructor(public navCtrl: NavController, public formBuilder: FormBuilder,private loadingCtrl: LoadingController,public params:NavParams,public actionSheetCtrl: ActionSheetController,public _service:Service,public storage: Storage) {
          this.userData =  this.params.get('userData');
          this._user = firebase.database().ref('user')

          if(this.userData.profilePic=='')
          {
              this.profileimage = 'assets/profile-default.jpg'
          }
          else
          {
            this.profileimage = this.userData.profilePic;
          }


        }
  ionViewDidLoad() {
    console.log('Hello EditProfilePage Page');
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
  updateProfile(){
    delete this.userData.profilePic;
    let  tempArray = this.userData;
    tempArray.profilePic = this.profileimage
    let refUser = this._user.child(this.userData.userKey).update(tempArray);
    if(refUser)
    {
         this.storage.set('userData',JSON.stringify(tempArray));
         this.navCtrl.pop();
    }
  }
}
