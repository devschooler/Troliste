import { Component } from '@angular/core';
import { NavController, NavParams ,ViewController} from 'ionic-angular';
import * as firebase from 'firebase';
import {NativeAudio} from 'ionic-native';

/*
  Generated class for the Comment page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-comment',
  templateUrl: 'comment.html'
})
export class CommentPage {
  commentText;
  _post;
  _user;
  postData;
  userData;
  commentList;
  _notification;
  constructor(public navCtrl: NavController,public params: NavParams,public viewCtrl: ViewController) {
    this.postData = this.params.get('postData');
    this.userData = this.params.get('userData')
    this._post = firebase.database().ref('post')
    this._user = firebase.database().ref('user')
    this._notification = firebase.database().ref('notification')
    this.commentList = [];
    // NativeAudio.preloadComplex('post', 'assets/post.mp3', 1, 1, 0).then((data)=>{}, (err)=>{});

    // console.log("Commnet"+JSON.stringify())
    for(let p in this.postData.comments)
    {
      let resData = this.postData.comments[p]
      this._user.child(resData.userKey).on('value',(data) =>{
        resData.userData = data.val()
        console.log(data.val())
      })
      this.commentList.push(resData)

    }
    // console.log("comment"+JSON.stringify(this.commentList))
  }

  ionViewDidLoad() {

  }

  dismiss() {
      this.viewCtrl.dismiss();
  }

  postComment()
  {
    let tempArray= {
      uid:this.userData.uid,
      userKey:this.userData.userKey,
      commentText:this.commentText,
      commentDateTime:new Date().toString(),
    }

    let tempPushArray= {
      uid:this.userData.uid,
      userData:this.userData,
      userKey:this.userData.userKey,
      commentText:this.commentText,
      commentDateTime:new Date().toString(),
    }
    // NativeAudio.play('post', () => console.log('uniqueId1 is done playing'));

    if(this.postData.userKey!==this.userData.userKey)
    {
      let  currentDate= new Date().toString();
      let isType ;
      if(this.postData.isType==0) // simple post
      {
          isType = 1 // here isType=1 means comment on post
      }
      else if(this.postData.isType == 1) // user change profile pic
      {
          isType = 1  // comment on post
      }
      else if(this.postData.isType == 2) // check in post
      {
          isType = 4 //  comment on checkin
      }
      else
      {
        isType = 1
      }
      let notificationArray = {
        postUserID:this.postData.userId,
        postUserKey:this.postData.userKey,
        postText:this.postData.postText,
        postKey:this.postData.id,
        isType:1, // here isType means notification type if 0=post like or 1 = post comment,
        userKey:this.userData.userKey, // here userKey is login user key
        userId:this.userData.uid, // here userid is login user id
        notificationDateTime:currentDate,
        isRead:0, // here isRead means user read this notification or not if 0 = unread and 1 =  read
        // isHistory:0 // here isHistory check user 1st time like
      }
      this._notification.child(this.postData.userKey).push(notificationArray)
    }

    this.commentList.push(tempPushArray)
    this.commentText=''
    this._post.child(this.postData.id+'/comments').push(tempArray)
  }
}
