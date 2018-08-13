import { Component } from '@angular/core';
import { NavController,NavParams,ModalController} from 'ionic-angular';
import {NativeAudio} from 'ionic-native';
import * as firebase from 'firebase';
import * as _ from 'lodash';

import { CommentPage } from '../comment/comment'

@Component({
  selector: 'page-user-profile',
  templateUrl: 'user-profile.html'
})
export class UserProfilePage {
  userData;
  selectedUserData;
  _post;
  _user;
  _notification;
  recentPost :any;
  isType;
  userKey;
  constructor(public navCtrl: NavController,public params: NavParams,public modalCtrl: ModalController){
      this.userKey =  this.params.get('userKey');
      this.userData = this.params.get('userData')
      this._post = firebase.database().ref('post');
      this._user = firebase.database().ref('user');
      this._notification = firebase.database().ref('notification')
      this.recentPost = [];
      this._user.child(this.userKey).on('value',(res)=>{
          this.selectedUserData = res.val();
      },(err)=>{
          console.log(err)
      })
      // NativeAudio.preloadComplex('like', 'assets/facebook_ringtone_pop.m4a', 1, 1, 0).then((data)=>{}, (err)=>{});

      // ser data change
      // this._user.on('child_changed',(data) =>{
      //   this.getPost()
      // })
      this._post.orderByChild('userKey').equalTo(this.userKey).on('child_changed',(data) =>{
          this.changeData(data)
      })
      // remove post data
      this._post.orderByChild('userKey').equalTo(this.userKey).on('child_removed',(data) =>{
          this.changeData(data)
      })
      this.getPost()

    }
    getPost()
    {
      this.recentPost = [];
      let loginUserID = this.userData.uid
      this._post.orderByChild('userKey').equalTo(this.userKey).on('child_added',(data) =>{
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
        console.log(notificationArray)
        this._notification.child(postData.userKey).push(notificationArray)
      }
      console.log("=========------=========")
      this._post.child(postData.id+'/likes').push({uid:this.userData.uid})
      console.log("=========")
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
    openMap(lat,long){
      window.open('http://maps.google.com/maps?q='+lat+','+long, '_system', 'location=yes')
    }
  }
