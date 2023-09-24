import { Travel } from "./Travel";

export interface IPlace{
  id: string;
  place_id: string;
  name: string;
  order: number;
}

export class Place implements IPlace{
  id: string;
  place_id: string;
  name: string;
  order: number;

  placeInfo: google.maps.places.PlaceResult;  

  constructor(info: google.maps.places.PlaceResult){
    this.place_id = info.place_id;
    this.placeInfo = info;
    this.order = 0;
  }  
}