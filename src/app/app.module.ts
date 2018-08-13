import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { NotificationPage } from '../pages/notification/notification';
import { ProfilePage } from '../pages/profile/profile';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { RegisterPage } from '../pages/register/register';
// import { Service } from '../providers/service';
import { AddPostPage } from '../pages/add-post/add-post'
import { Storage } from '@ionic/storage';
import {MomentModule} from 'angular2-moment/moment.module';
import { MyLike } from '../providers/mylike';
import { CommentPage } from '../pages/comment/comment';
import {EditProfilePage} from '../pages/edit-profile/edit-profile';
import {GlobalVars} from '../providers/globalvars';
import { PostDetailPage } from '../pages/post-detail/post-detail';
import { LocationSharePage } from '../pages/location-share/location-share';
import { AgmCoreModule,GoogleMapsAPIWrapper } from 'angular2-google-maps/core';
import { UserProfilePage } from '../pages/user-profile/user-profile';
import { ChatsPage } from '../pages/chats/chats';
import { ChattingPage } from '../pages/chatting/chatting'
@NgModule({
  declarations: [
    MyApp,
    NotificationPage,
    ProfilePage,
    HomePage,
    TabsPage,
    LoginPage,
    RegisterPage,
    AddPostPage,
    MyLike,
    CommentPage,
    EditProfilePage,
    PostDetailPage,
    LocationSharePage,
    UserProfilePage,
    ChatsPage,
    ChattingPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    MomentModule,
    AgmCoreModule.forRoot({ apiKey: 'AIzaSyAX4MUd1h_xit-HLs7gg6aRGXv7ecqsB44'})
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    NotificationPage,
    ProfilePage,
    HomePage,
    TabsPage,
    LoginPage,
    RegisterPage,
    AddPostPage,
    CommentPage,
    EditProfilePage,
    PostDetailPage,
    LocationSharePage,
    UserProfilePage,
    ChatsPage,
    ChattingPage
  ],
  providers: [Storage,GlobalVars]
})
export class AppModule {}
