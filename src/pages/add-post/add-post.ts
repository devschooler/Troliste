import { Component } from '@angular/core';
import { NavController ,ViewController,ActionSheetController,NavParams,ToastController} from 'ionic-angular';
import { Camera,NativeAudio } from 'ionic-native';
import * as firebase from 'firebase';
// import {NativeAudio} from 'ionic-native';
/*
  Generated class for the AddPost page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-add-post',
  templateUrl: 'add-post.html'
})
export class AddPostPage {
  shareImage;
  userData;
  postText;
  _post;
  constructor(public navCtrl: NavController,public viewCtrl: ViewController,public actionSheetCtrl: ActionSheetController,public params:NavParams,public toastCtrl: ToastController) {
    this.shareImage = ''
    this.userData =  this.params.get('loginuser');
    this._post = firebase.database().ref('post')
    // NativeAudio.preloadComplex('post', 'assets/post.mp3', 1, 1, 0).then((data)=>{}, (err)=>{});
      // NativeAudio.preloadComplex('like', 'assets/facebook_ringtone_pop.m4a', 1, 1, 0).then((data)=>{}, (err)=>{});
      // console.log("userdata"+JSON.stringify(this.userData))
  }

  ionViewDidLoad() {
    console.log('Hello AddPostPage Page');
  }
  dismiss() {
      this.viewCtrl.dismiss();
  }
  imageShare()
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
    this.shareImage = 'data:image/jpeg;base64,' + imageData;
    }, (err) => {
    // Handle error
    });
  }
  removeImage(){
    this.shareImage=''
  }

  addPost()
  {
     let  currentDate= new Date().toString()
      let tempData = {
        userId : this.userData.uid,
        // userData: this.userData,
        userKey:this.userData.userKey,
        postText: this.postText,
        postImage: this.shareImage,
        postDateTime:currentDate,
        isType:0 // here isType is use for user post type 0 means new post and 1 means user update profile pic
      }

      let res = this._post.push(tempData).key;
      if(res)
      {
        console.log(JSON.stringify(res));
        NativeAudio.play('post', () => console.log('uniqueId1 is done playing'));

        let toast = this.toastCtrl.create({
          message: 'Post added successfully',
          duration: 2000,
          position: 'bottom'
        });
        setTimeout(() =>{
          this.viewCtrl.dismiss();
        },1000)
        toast.present();
      }

  }

}
