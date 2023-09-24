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
    this.placeMap = new Map<string, Place>();
  }
  
}