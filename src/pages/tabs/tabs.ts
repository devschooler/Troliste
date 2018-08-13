import { Component } from '@angular/core';
import { NavParams ,Events} from 'ionic-angular';

import { HomePage } from '../home/home';
import { NotificationPage } from '../notification/notification';
import { ProfilePage } from '../profile/profile';
import { ChatsPage } from '../chats/chats'

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = HomePage;
  tab2Root: any = NotificationPage;
  tab3Root: any = ProfilePage;
  tab4Root: any = ChatsPage;
  mySelectedIndex: number;
  badge:any = 0;
  constructor(navParams: NavParams,public events: Events) {
      this.mySelectedIndex = navParams.data.tabIndex || 0;
      events.subscribe('notificationRemove:created', (count) => {
        // userEventData is an array of parameters, so grab our first and only arg
        this.badge = parseInt(this.badge) - parseInt(count);;
      });
      events.subscribe('notificationCount:created', (count) => {
        // userEventData is an array of parameters, so grab our first and only arg
        console.log("==count==="+count);
        setTimeout(() =>{
            this.badge = parseInt(this.badge) + parseInt(count);;
        },500)

      });
  }
  ionViewWillEnter(){

  }
}
