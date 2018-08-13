import { Component,NgZone} from '@angular/core';
import * as moment from 'moment';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import { NavController,Events } from 'ionic-angular';
import {GlobalVars} from '../../providers/globalvars';
import { PostDetailPage } from '../post-detail/post-detail'

@Component({
  selector: 'notification-page',
  templateUrl: 'notification.html'
})
export class NotificationPage {
  _notification;
  _user;
  recentNotification;
  userData;
  badge=12
  constructor(public navCtrl: NavController,public GlobalVars:GlobalVars,private zone: NgZone,public events: Events) {
    this._notification = firebase.database().ref('notification');
    this._user = firebase.database().ref('user');
    this.notificationData();
    // events.subscribe('notificationGet:created', (count) => {
    //   // userEventData is an array of parameters, so grab our first and only arg
    //   this.notificationData();
    // });

  }
  ionViewWillEnter(){

  }

  notificationData(){
    this.recentNotification = [];

    this.GlobalVars.getMyGlobalVar().then((data) =>{
        this.userData =  JSON.parse(data);
        //  remove post data
        this._notification.child(this.userData.userKey).on('child_removed',(data) =>{
            // this.getNotification(data)
            let temDt = data.val();
            if(temDt.isRead==0)
            {
              this.events.publish('notificationRemove:created', 1);
            }
            _.remove(this.recentNotification, function(o) {
                return o.id === data.key;
            });

        });
        setTimeout(() =>{
          this.getNotification();
        },2000)
        // get userNotification
    })
  }

  getNotification(){
    this.recentNotification = [];
    this._notification.child(this.userData.userKey).orderByKey().limitToLast(5).on('child_added',(data) =>{
      this.zone.run(() => {
          let tempArray = data.val();
          tempArray.id =data.key;
          // check user notification is read or not
          if(tempArray.isRead==0)
          {
                setTimeout(() =>{
                   this.events.publish('notificationCount:created', 1);
                },2000)
          }
          // Get post user data by userKey
          this._user.child(tempArray.userKey).on('value',(res) =>{
            tempArray.userData = res.val();

          })
          this.recentNotification.unshift(tempArray)
        })
    });

  }

  gotToPostDetail(data)
  {
    let uid = this.userData.userKey;
    if(data.isRead==0)
    {
      let tempData = {
        isRead : 1,
        isType:data.isType,
        notificationDateTime:data.notificationDateTime,
        postKey:data.postKey,
        postUserID:data.postUserID,
        postUserKey:data.postUserKey,
        userId:data.userId,
        userKey:data.userKey,
        postText:data.postText
      }
      this.events.publish('notificationRemove:created', 1);
      this._notification.child(uid).child(data.id).update(tempData);
      let res =_.find(this.recentNotification, function(o) { return o.id == data.id});
      if(res){
        res.isRead = 1
      }
    }
    this.navCtrl.parent.parent.push(PostDetailPage,{postKey:data.postKey,userData:this.userData});
  }
}
