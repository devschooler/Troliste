import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import {GlobalVars} from '../../providers/globalvars';
import {ChattingPage} from '../chatting/chatting'
/*
  Generated class for the Chats page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-chats',
  templateUrl: 'chats.html'
})
export class ChatsPage {
  segmentSelected;
  _user;
  _onlineUser;
  allUserAray:any;
  onlineUser:any;
  userData;
  _chats;
  _lastChats;
  recentChats;
  constructor(public navCtrl: NavController,public GlobalVars:GlobalVars) {
    this.segmentSelected = 'all';
    this.allUserAray = [];
    this.onlineUser = [];
    this.recentChats = [];
    this._user = firebase.database().ref('user');
    this._onlineUser = firebase.database().ref('onlineUser');
    this._chats = firebase.database().ref('chats');
    this._lastChats = firebase.database().ref('lastchat');
    GlobalVars.getMyGlobalVar().then((data) =>{
        this.userData =  JSON.parse(data);
        this._user.on('child_added',(data)=>{
            let tempArray = data.val();
            tempArray.userKey = data.key;
            if(this.userData.userKey != data.key)
            {
                this.allUserAray.push(tempArray);
            }
        })
        this._onlineUser.on('child_added',(data) =>{

          this._user.child(data.key).on('value',(data)=>{
            if(this.userData.userKey != data.key)
            {
              let tempAry = data.val();
              tempAry.userKey = data.key;
              this.onlineUser.push(tempAry)
            }
          })
        })
        this._onlineUser.on('child_removed',(data) =>{
          //this.removeOnlineUser(data.key)
          let isDt = _.findKey(this.onlineUser, function(o) { return o.userKey == data.key});
          if(isDt)
          {
              this.onlineUser.splice(isDt-1, 1);
          }
        })

        this._lastChats.child(this.userData.userKey).on('child_added',(res) =>{

            let tempData = res.val();

            let key = res.key;
            this._user.child(key).once('value',(data)=>{
              tempData.aboutSelf = data.val().aboutSelf;
              tempData.email = data.val().email;
              tempData.firstName = data.val().firstName;
              tempData.lastName = data.val().lastName;
              tempData.profilePic = data.val().profilePic;
              tempData.uid = data.val().uid;
              tempData.userKey = key;
              this.recentChats.push(tempData)
            })
            // console.log(this.recentChats)
        })
        this._lastChats.child(this.userData.userKey).on('child_changed',(res) =>{
            let isData = _.find(this.recentChats, function(o) { return o.userKey == res.key});
            if(isData)
            {
                // when user on touser scree then set isRead = 1
                GlobalVars.getToUserKey().then((data) =>{
                  if(data == res.key)
                  {
                    isData.isRead = 1// check message status read or not 0 means unread and 1 means read message
                    isData.isType = res.val().isType; // chekc message type text or image if isType == 0 means text and isType ==1 means image
                    isData.message = res.val().message;
                    this._lastChats.child(this.userData.userKey).child(data).child('isRead').set('1');
                  }
                  else
                  {
                    isData.isRead = res.val().isRead; // check message status read or not 0 means unread and 1 means read message
                    isData.isType = res.val().isType; // chekc message type text or image if isType == 0 means text and isType ==1 means image
                    isData.message = res.val().message;
                  }
                })

            }
        })
    })
  }

  ionViewDidLoad() {
    console.log('Hello ChatsPage Page');
  }

  removeOnlineUser(data){

  }

  updateSchedule(){

  }

  goToChatting(data){
    this.navCtrl.parent.parent.push(ChattingPage,{toUserData:data,userData:this.userData})
  }
}
