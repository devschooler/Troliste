import { Component } from '@angular/core';
import { NavController,AlertController ,Events,NavParams,ModalController} from 'ionic-angular';
import {NativeAudio} from 'ionic-native';
import { Service } from '../../providers/service';
import { LoginPage} from '../login/login';
import {EditProfilePage} from '../edit-profile/edit-profile';
import {GlobalVars} from '../../providers/globalvars';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import * as moment from 'moment';
import { CommentPage } from '../comment/comment'
import { Storage } from '@ionic/storage';

@Component({
  selector: 'profile-page',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  userData;
  rootPage;
  _post;
  _user;
  _notification;
  recentPost :any;
  isType;
_onlineUser;
  constructor(public navCtrl: NavController,public _service:Service,public alertCtrl: AlertController,public GlobalVars:GlobalVars,public storage: Storage,public events: Events,public modalCtrl: ModalController) {
    this._post = firebase.database().ref('post');
    this._onlineUser =   firebase.database().ref('onlineUser');
    this._user = firebase.database().ref('user');
    this._notification = firebase.database().ref('notification')
    this.recentPost = [];

    GlobalVars.getMyGlobalVar().then((data) =>{
        this.userData =  JSON.parse(data);
        console.log(this.userData.profilePic)
    })
    events.subscribe('changeProfile:created', (userEventData) => {
      GlobalVars.getMyGlobalVar().then((data) =>{
          this.userData =  JSON.parse(data);
          console.log(this.userData.profilePic)
      })
    });
    // NativeAudio.preloadComplex('like', 'assets/facebook_ringtone_pop.m4a', 1, 1, 0).then((data)=>{}, (err)=>{});
    setTimeout(() =>{
      this._post.orderByChild('userKey').equalTo(this.userData.userKey).on('child_changed',(data) =>{
          this.changeData(data)
      })
      // remove post data
      this._post.orderByChild('userKey').equalTo(this.userData.userKey).on('child_removed',(data) =>{
          this.changeData(data)
      })
      this.getPost()
    },1000)

  }
  getPost()
  {
    this.recentPost = [];
    let loginUserID = this.userData.uid
    this._post.orderByChild('userKey').equalTo(this.userData.userKey).on('child_added',(data) =>{
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
  }

  likePost(postData)
  {
    console.log(postData)
    NativeAudio.play('like', () => console.log('uniqueId1 is done playing'));


    if(postData.userKey!==this.userData.userKey)
    {

      let  currentDate= new Date().toString();
      if(postData.isType==1)
      {
        this.isType = 2 // if postData.type == 0 means this is profile pic change post
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

  commentPost(postData)
  {
   let modal =  this.modalCtrl.create(CommentPage,{postData:postData,userData:this.userData});
     modal.present();
  }

  logout(){
    let confirm = this.alertCtrl.create({
      title: 'Déconnexion',
      message: 'Voulez vous vraiment vous déconnecter ? ',
      buttons: [
        {
          text: 'non',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Oui',
          handler: () => {
            this.storage.remove('userData')
            this.storage.clear();
            //this.navCtrl.setRoot(LoginPage);
          this._onlineUser.child(this.userData.userKey).remove()
            this.navCtrl.parent.parent.setRoot(LoginPage);
            firebase.auth().signOut().then(function() {

            })
          }
        }
      ]
    });
    confirm.present();
  }
  editProfile()
  {
    this.navCtrl.push(EditProfilePage,{userData:this.userData})
  }
  openMap(lat,long){
    window.open('http://maps.google.com/maps?q='+lat+','+long, '_system', 'location=yes')
  }
}
