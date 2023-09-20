import Travel from "./Travel";

class Place{
  uid: string; //placeInfo.place_id
  placeInfo: google.maps.places.PlaceResult;  

  constructor(info: google.maps.places.PlaceResult){
    this.uid = info.place_id;
    this.placeInfo = info;    
  }
}

export default Place;