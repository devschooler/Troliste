import { Component } from '@angular/core';
import { NavController,NavParams,ModalController} from 'ionic-angular';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import * as moment from 'moment';
import {MomentModule} from 'angular2-moment/moment.module';
import {NativeAudio} from 'ionic-native';
import {CommentPage } from '../comment/comment'
/*
  Generated class for the PostDetail page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-post-detail',
  templateUrl: 'post-detail.html'
})
export class PostDetailPage {
  _post;
  _user;
  postDetail;
  userData;
  comment;
  commentText;
  _notification;
  constructor(public navCtrl: NavController,public params:NavParams,public modalCtrl: ModalController) {
    this._post = firebase.database().ref('post');
    this._user = firebase.database().ref('user');
    this._notification = firebase.database().ref('notification')
  }

  ionViewWillEnter(){
    let postKey  =  this.params.get('postKey');
    this.userData = this.params.get('userData');
    let loginUserID = this.userData.uid
    this._post.child(postKey).on('value',(data) => {

      let tempArray = data.val();
      tempArray.id =data.key;
      if(tempArray.isType == 2)
      {
        tempArray.mapData = JSON.parse(tempArray.postText);
        tempArray.mapUrl ="https://maps.googleapis.com/maps/api/staticmap?center="+tempArray.mapData.address+"&zoom=13&size=500x200&maptype=roadmap&markers=color:red|label:S|"+tempArray.mapData.lat+","+tempArray.mapData.long
      }
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
        tempArray.totalComments = Object.keys(tempArray.comments).length;

        let commentList = []

        for(let p in tempArray.comments)
        {
          let resData = tempArray.comments[p]
          this._user.child(resData.userKey).on('value',(data) =>{
            resData.userData = data.val()
          })
          commentList.push(resData)
        }
        tempArray.comment =  commentList

        let isComment = _.findKey(tempArray.comments, function(o) { return o.uid == loginUserID});
        if(isComment)
        {
          tempArray.isComment = true;
        }
      }
      this.postDetail = tempArray;
    })
  }

  commentPost(postData)
  {
   let modal =  this.modalCtrl.create(CommentPage,{postData:postData,userData:this.userData});
     modal.present();
  }
  likePost(postData)
  {

    NativeAudio.play('like', () => console.log('uniqueId1 is done playing'));

    if(postData.userKey!==this.userData.userKey)
    {
      let  currentDate= new Date().toString()
      let notificationArray = {
        postUserID:postData.userId,
        postUserKey:postData.userKey,
        postText:postData.postText,
        postKey:postData.id,
        isType:0, // here isType means notification type if 0=post like or 1 = post comment,
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

  openMap(lat,long){
    window.open('http://maps.google.com/maps?q='+lat+','+long, '_system', 'location=yes')
  }
}
