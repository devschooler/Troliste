import { Component,NgZone } from '@angular/core';
// import { AgmCoreModule } from 'angular2-google-maps/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as firebase from 'firebase';
import {MomentModule} from 'angular2-moment/moment.module';
import { NavController,ModalController,ActionSheetController ,ToastController,AlertController,Events,LoadingController}from 'ionic-angular';
import {NativeAudio,Camera} from 'ionic-native';
import {GlobalVars} from '../../providers/globalvars';
import { AddPostPage } from '../add-post/add-post';
import { CommentPage } from '../comment/comment'
import { Storage } from '@ionic/storage';
import { LocationSharePage } from '../location-share/location-share'
import { UserProfilePage } from '../user-profile/user-profile';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  userData;
  _post;
  _user;
  _notification;
  recentPost :any;
  profilePic;
  isType;
  _onlineUser;
  loader;
  constructor(private navCtrl: NavController,public modalCtrl: ModalController,private zone: NgZone,public loadingCtrl: LoadingController,public GlobalVars:GlobalVars,public actionSheetCtrl: ActionSheetController,public alertCtrl:AlertController,public storage: Storage,public  toastCtrl:ToastController,public events: Events) {

    this.loader = this.loadingCtrl.create({
      content: 'Chargement...'
    });
    this.loader.present();
    setTimeout(() =>{
         this.loader.dismiss();
    },3000);
    NativeAudio.preloadComplex('like', 'assets/facebook_ringtone_pop.m4a', 1, 1, 0).then((data)=>{}, (err)=>{});

    this._post = firebase.database().ref('post');
    this._user = firebase.database().ref('user');
    //    var scrollRef = new firebase.util.Scroll(this._post,'post');

    this._notification = firebase.database().ref('notification');
    this.recentPost = [];
    events.publish('notificationGet:created', 1);
    // NativeAudio.preloadComplex('like', 'assets/facebook_ringtone_pop.m4a', 1, 1, 0).then((data)=>{}, (err)=>{});

    GlobalVars.getMyGlobalVar().then((data) =>{
        this.userData =  JSON.parse(data);
        setTimeout(() =>{
            this.getPost();
        },1000)
        this._onlineUser =   firebase.database().ref('onlineUser');

        var connectedRef = firebase.database().ref(".info/connected");
        connectedRef.on("value", (snap) => {
          if (snap.val() === true) {
           this._onlineUser.child(this.userData.userKey).set('online')
          } else {
          }
        })
        this._onlineUser.child(this.userData.userKey).onDisconnect().remove()

    })
    // user data change
    this._user.on('child_changed',(data) =>{
      this.getPost()
    })

    // change of post
    this._post.on('child_changed',(data) =>{
        this.changeData(data)
    })

    // remove post data
    this._post.on('child_removed',(data) =>{
        this.changeData(data)
    })
    // this._post.orderByKey().limitToLast(5).on('child_added',(data) =>{
    //   alert('asd')
    // })
    // this.recentPost = [{"postDateTime":"Mon Dec 05 2016 19:26:14 GMT+0530 (IST)","postImage":"","postText":"This is demo post ","userData":{"aboutSelf":"Hs hsf shf hdfhjdfhj hf hsjfh","email":"Nk@gmail.com","firstName":"Nakul","lastName":"Kundaliya","Pseudo":"Developing","password":"123123","profilePic":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAMAAABlApw1AAAAGXRFW…TahWdWVxl8J1VvrDAaKzZWT/Y1HLrduNjlgwR+5v8FGAD7APIfByIJFAAAAABJRU5ErkJggg==","uid":"gr6Vfby3PdPkTHF6USENnQBTDVQ2"},"userId":"gr6Vfby3PdPkTHF6USENnQBTDVQ2"}]
  }

  addPost() {
    let modal = this.modalCtrl.create(AddPostPage,{loginuser:this.userData});
    modal.present();
  }
  ionViewWillEnter(){
  }

  changeData(data){
    let res =_.find(this.recentPost, function(o) { return o.id == data.key});
    if(res)
    {
      let tempArray = data.val();
      let loginUserID = this.userData.uid
      tempArray.id =data.key;
      // check likes
      if(tempArray.likes)
      {
          res.totalLikes =Object.keys(tempArray.likes).length;
          res.likes = tempArray.likes;
          let isLike = _.findKey(tempArray.likes, function(o) { return o.uid == loginUserID});
          if(isLike)
          {
            res.isLike = true;
          }
          else
          {
            res.isLike = false;
          }
      }
      else
      {
        res.totalLikes =null;
        res.likes = null;
        res.isLike =false;
      }

      // check comments
      if(tempArray.comments)
      {
        res.totalComments =Object.keys(tempArray.comments).length;
        res.comments = tempArray.comments;
        let isComment = _.findKey(tempArray.comments, function(o) { return o.uid == loginUserID});
        if(isComment)
        {
          res.isComment = true;
        }
        else
        {
          res.isComment = false;
        }
      }
      else
      {
        res.totalComments =null;
        res.comments = null;
        res.isComment =false;
      }

    }
  }
  doRefresh(refresher){
      this.getPost();
      setTimeout(() => {
        console.log('Async operation has ended');
        refresher.complete();
      }, 2000);
  }
  getPost()
  {
    this.recentPost = [];
    let loginUserID = this.userData.uid
    setTimeout(() =>{
      this._post.orderByKey().limitToLast(5).on('child_added',(data) =>{
          this.zone.run(() => {
              let tempArray = data.val();
              if(tempArray.isType == 2)
              {
                tempArray.mapData = JSON.parse(tempArray.postText);
                tempArray.mapUrl ="https://maps.googleapis.com/maps/api/staticmap?center="+tempArray.mapData.address+"&zoom=13&size=500x200&maptype=roadmap&markers=color:red|label:S|"+tempArray.mapData.lat+","+tempArray.mapData.long
              }
              tempArray.id =data.key;

              // Get post user data by userKey
              this._user.child(tempArray.userKey).on('value',(res) =>{
                tempArray.userData = res.val()
              })
              // check this post like by login user or not
              if(tempArray.likes)
              {
                    tempArray.totalLikes =Object.keys(tempArray.likes).length;
                  let isLike = _.findKey(tempArray.likes, function(o) { return o.uid == loginUserID});
                  if(isLike)
                  {
                    tempArray.isLike = true;
                  }

              }
              if(tempArray.comments)
              {
                tempArray.totalComments =Object.keys(tempArray.comments).length;
                let isComment = _.findKey(tempArray.comments, function(o) { return o.uid == loginUserID});
                if(isComment)
                {
                  tempArray.isComment = true;
                }
              }

              this.recentPost.unshift(tempArray);
            })
       })
    },300)
  }

  likePost(postData)
  {
    NativeAudio.play('like', () => alert('sadas'));


    if(postData.userKey!==this.userData.userKey)
    {

      let  currentDate= new Date().toString();
      if(postData.isType==1)
      {
        this.isType = 2 // if postData.type == 0 means this is profile pic change post
      }
      else if(postData.isType==2)
      {
        this.isType = 3 // isType = 3 means notification type is location sharing
      }
      else
      {
        this.isType = 0 // if postData.type == 0 means this is simple post
      }
      let notificationArray = {
        postUserID:postData.userId,
        postUserKey:postData.userKey,
        postText:postData.postText,
        postKey:postData.id,
        isType:this.isType, // here isType means notification type if 0=post like or 1 = post comment,
        userKey:this.userData.userKey, // here userKey is login user key
        userId:this.userData.uid, // here userid is login user id
        notificationDateTime:currentDate,
        isRead:0, // here isRead means user read this notification or not if 0 = unread and 1 =  read
        // isHistory:0 // here isHistory check user 1st time like
      }
      this._notification.child(postData.userKey).push(notificationArray)
    }
    this._post.child(postData.id+'/likes').push({uid:this.userData.uid})
  }

  deslikePost(postData)
  {
    let loginUserID = this.userData.uid

    if(postData.likes)
    {
      console.log('postData'+postData.likes)
      this._notification.child(postData.userKey).once('value',(data)=>{
        let isPostLike = _.findKey(data.val(),function(o){return o.postKey == postData.id});
        if(isPostLike)
        {
          let r =this._notification.child(postData.userKey).child(isPostLike).remove()
        }
      })
      let isLike = _.findKey(postData.likes, function(o) { return o.uid == loginUserID});

      if(isLike)
      {
        console.log('postData.id'+postData.id)
        let likeRef = this._post.child(postData.id+'/likes/'+isLike).remove()
      }
    }
  }

  commentPost(postData)
  {
   let modal =  this.modalCtrl.create(CommentPage,{postData:postData,userData:this.userData});
     modal.present();
  }

  changeProfile(){
    let actionSheet = this.actionSheetCtrl.create({
     title: 'Change your profile picture',
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
    this.profilePic = 'data:image/jpeg;base64,' + imageData;

    let confirm = this.alertCtrl.create({
       title: 'Set as profile picture',
       message: "<img src='"+this.profilePic +"' height='200px'>",
       buttons: [
         {
           text: 'Cancle',
           handler: () => {
             console.log('Disagree clicked');
           }
         },
         {
           text: 'Set',
           handler: () => {
             let  currentDate= new Date().toString()
              let tempData = {
                userId : this.userData.uid,
                // userData: this.userData,
                userKey:this.userData.userKey,
                postText: '',
                postImage: this.profilePic,
                postDateTime:currentDate,
                isType:1 // here isType is use for user post type 0 means new post and 1 means user update profile pic
              }

              let res = this._post.push(tempData).key;
              if(res)
              {
                console.log(JSON.stringify(res));
                NativeAudio.play('post', () => console.log('uniqueId1 is done playing'));
                let toast = this.toastCtrl.create({
                  message: 'Update Profile successfully',
                  duration: 2000,
                  position: 'bottom'
                });

                toast.present();
              }
              setTimeout(() =>{
                delete this.userData.profilePic;
                let  tempArray = this.userData;
                tempArray.profilePic = this.profilePic;
                let refUser = this._user.child(this.userData.userKey).update(tempArray);
                if(refUser)
                {
                     this.storage.set('userData',JSON.stringify(tempArray));
                }
                setTimeout(() =>{
                  this.events.publish('changeProfile:created',{});
                },1000)
              },100)
           }
         }
       ]
     });
     confirm.present();


    }, (err) => {
    // Handle error
    });
  }

  locationShare(){
    this.navCtrl.push(LocationSharePage,{loginuser:this.userData})
  }
  openMap(lat,long){
    window.open('http://maps.google.com/maps?q='+lat+','+long, '_system', 'location=yes')
  }
  userProfile(userKey){
    this.navCtrl.push(UserProfilePage,{userKey:userKey,userData:this.userData})
  }
}
