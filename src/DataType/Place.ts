import Travel from "./Travel";

class Place{
  key: string; //placeInfo.place_id
  placeInfo: google.maps.places.PlaceResult;
  travel: Travel;

  constructor(info: google.maps.places.PlaceResult, t: Travel){
    this.key = info.place_id;
    this.placeInfo = info;
    this.travel = t;
  }
}

export default Place;