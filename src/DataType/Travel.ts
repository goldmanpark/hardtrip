import { IPlace, Place } from "./Place";

export interface ITravel{
  id: string;
  uid: string;
  name: string;
  places: IPlace[];
}

export class Travel implements ITravel{
  id: string;
  uid: string;
  name: string;
  places: IPlace[];
  placeMap: Map<string, Place>

  constructor(travelRef: ITravel){
    this.id = travelRef.id;
    this.uid = travelRef.uid;
    this.name = travelRef.name;
    this.places = [];
    this.placeMap = new Map<string, Place>();
  }

  getPlaceList(): Place[]{
    return Array.from(this.placeMap.values());
  }
}