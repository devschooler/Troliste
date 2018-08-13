import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController,NavParams,ToastController } from 'ionic-angular';
import { Geolocation,NativeAudio } from 'ionic-native';
import * as firebase from 'firebase';
/*
  Generated class for the LocationShare page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
declare var google;
@Component({
  selector: 'page-location-share',
  templateUrl: 'location-share.html'
})

export class LocationSharePage {
 @ViewChild('map') mapElement: ElementRef;
  map: any;
  autocompleteItems;
  autocomplete;
  service = new google.maps.places.AutocompleteService();
  isMapDisplay = true;
  lat;
  long;
  address;
  userData;
  _post;
  constructor(public navCtrl: NavController,public params:NavParams,public toastCtrl: ToastController) {
    this.autocompleteItems = [];
     this.autocomplete = {
       query: ''
     };
     this.userData =  this.params.get('loginuser');
     this._post = firebase.database().ref('post')
     NativeAudio.preloadComplex('post', 'assets/post.mp3', 1, 1, 0).then((data)=>{}, (err)=>{});
     setTimeout(() =>{
        //this.loadMap('22.2000','74.022222222','Ahemdabad')
        this.getCurrentPostion()
     },1000)
  }

  ionViewDidLoad() {
    console.log('Hello LocationSharePage Page');
  }

  // location
  updateSearch() {
   if (this.autocomplete.query == '') {
     this.autocompleteItems = [];
     return;
   }
   //this.autocompleteItems = [];

   this.service.getPlacePredictions({ input: this.autocomplete.query, componentRestrictions: {country: 'IN'} }, (data)=>{
     data.forEach((prediction) => {

          this.isMapDisplay = false;
          this.autocompleteItems.push(prediction);
     });
   });
  //  console.log(JSON.stringify(this.autocompleteItems))
  }

  getCurrentPostion(){
    Geolocation.getCurrentPosition().then((position) => {
     let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
     let mapOptions = {
       center: latLng,
       zoom: 15,
       mapTypeId: google.maps.MapTypeId.ROADMAP
     }
     let geocoder = new google.maps.Geocoder;
     this.lat = position.coords.latitude;
     this.long = position.coords.longitude;
     geocoder.geocode({'location': latLng}, (results) => {
      this.address = results[1].formatted_address;
     })
     this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
     this.addMarker(this.address)
   }, (err) => {
     alert("err"+err)
     console.log(err);
   });

  }

  loadMap(lat,long,address){
      this.lat = lat;
      this.long = long;
      this.address  = address;
      let latLng = new google.maps.LatLng(lat, long);

      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
     this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
     this.addMarker(address)
  }

  dismiss(){
  }
  addMarker(address){
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });

    let content = "<h4>"+address+"</h4>";

    this.addInfoWindow(marker, content);
  }

  addInfoWindow(marker, content){
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });

  }

  chooseItem(data){
    this.isMapDisplay = true;
    this.autocomplete.query = data.description;
    let geocoder = new google.maps.Geocoder;
    geocoder.geocode({'placeId': data.place_id}, (res) => {
      setTimeout(() =>{
         this.loadMap(res[0].geometry.location.lat(),res[0].geometry.location.lng(),res[0].formatted_address)
      },1000)
    })
    // setTimeout(() =>{
    //    this.loadMap()
    // },1000)
  }

  shareLocation(){
    let locationArray = {
      lat:this.lat,
      long:this.long,
      address:this.address
    }
    let  currentDate= new Date().toString()
     let tempData = {
       userId : this.userData.uid,
       // userData: this.userData,
       userKey:this.userData.userKey,
       postText: JSON.stringify(locationArray),
       postImage: '',
       postDateTime:currentDate,
       isType:2 // here isType is use for user post type 0 means new post and 1 means user update profile pic  and 2 means location share
     }

     setTimeout(() =>{
        let res = this._post.push(tempData).key;
        if(res)
        {
          console.log(JSON.stringify(res));
          NativeAudio.play('post', () => console.log('uniqueId1 is done playing'));

          let toast = this.toastCtrl.create({
            message: 'Post added successfully',
            duration: 2000,
            position: 'bottom'
          });
          setTimeout(() =>{
            this.navCtrl.pop();
          },1000)
          toast.present();
        }
     },1000)


  }
}
