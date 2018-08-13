import { Component,NgZone ,ViewChild} from '@angular/core';
import { NavController,NavParams,Content,ActionSheetController } from 'ionic-angular';
import * as firebase from 'firebase';
import {GlobalVars} from '../../providers/globalvars';
import {NativeAudio,Camera} from 'ionic-native';

/*
  Generated class for the Chatting page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-chatting',
  templateUrl: 'chatting.html',
})
export class ChattingPage {
  @ViewChild(Content) content: Content;

  messageText;
  toUserData;
  userData;
  _chats;
  messages:any;
  firstChatId;
  secondChatId;
  chatId;
  _user;
  _lastChats;
  constructor(public navCtrl: NavController,public params: NavParams,private zone: NgZone,public GlobalVars:GlobalVars,public actionSheetCtrl:ActionSheetController) {
    this.toUserData = this.params.get('toUserData');
    this.userData = this.params.get('userData')
    this._chats = firebase.database().ref('chats');
    this._user= firebase.database().ref('user');
    this._lastChats = firebase.database().ref('lastchat');
    this.messages = [];
    this.chatId = this.toUserData.userKey;
    console.log(this.toUserData)
    this.getChats();
    this._lastChats.child(this.userData.userKey).child(this.toUserData.userKey).child('isRead').set('1');

    GlobalVars.setToUserKey(this.toUserData.userKey)
    }

  getChats()
  {
    this._chats.child(this.userData.userKey).orderByChild('chatId').equalTo(this.chatId).on('child_added',(data) =>{
          this.zone.run(() => {
            let tempArray = data.val();

            // if(tempArray.loginUserKey == tempArray.senderKey)
            // {
            //   // loginuser profile data;
            //   let userData = this.userData;
            //   let toUserData = this.toUserData;
            // }
            // else
            // {
            //   // to user profile data
            //   let userData = this.toUserData;
            //   let toUserData = this.userData;
            // }
            //
            // tempArray.userData = userData
            this.messages.push(tempArray)
            setTimeout(() =>{
              this.content.scrollToBottom();
            },300)

          });

    })
  }

  ionViewWillLeave() {
    console.log('Hello ChattingPage Page');
        this.GlobalVars.setToUserKey('null')
  }
  scrollToTop() {
    this.content.scrollToTop();
  }
  onBlur(event){
    setTimeout(() =>{
      this.content.scrollToBottom();
    },2000)
  }
  sendMessage(message,isType,textarea){
    if(textarea){
      textarea.setFocus();
    }
    let  currentDate= new Date().toString()

    let messageArrayForUser = {
      senderKey:this.userData.userKey,
      receiverKey:this.toUserData.userKey,
      message:message,
      loginUserKey:this.userData.userKey,
      isType:isType,
      isRead:'0',
      dateTime:currentDate,
      chatId:this.toUserData.userKey
    }

    let messageArrayForToUser = {
        senderKey:this.userData.userKey,
        receiverKey:this.toUserData.userKey,
        message:message,
        loginUserKey:this.userData.userKey,
        isType:isType,
        isRead:'0',
        dateTime:new Date().toString(),
        chatId:this.userData.userKey
      }
      NativeAudio.play('sendmessage', () => console.log('uniqueId1 is done playing'));

    let resUser =  this._chats.child(this.userData.userKey).push(messageArrayForUser);
    if(resUser)
    {
      this._lastChats.child(this.userData.userKey).child(this.toUserData.userKey).set(messageArrayForUser)
    }
    let resToUser = this._chats.child(this.toUserData.userKey).push(messageArrayForToUser);
    if(resToUser)
    {
      this._lastChats.child(this.toUserData.userKey).child(this.userData.userKey).set(messageArrayForToUser)
    }
    this.messageText = '';

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
    let shareImage = 'data:image/jpeg;base64,' + imageData;
    this.sendMessage(shareImage,1,null)
    }, (err) => {
    // Handle error
    });
  }
}
