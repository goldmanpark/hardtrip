import { IPlace, Place } from "./Place";

export interface ITravel{
  id: string;
  uid: string;
  name: string;
  startDate: string; //yyyy.MM.dd
  endDate: string; //yyyy.MM.dd
  places: IPlace[];
}

export class Travel implements ITravel{
  id: string;
  uid: string;
  name: string;
  startDate: string;
  endDate: string;
  places: Place[];
  
  constructor(travelRef: ITravel){
    this.id = travelRef.id;
    this.uid = travelRef.uid;
    this.name = travelRef.name;
    this.startDate = travelRef.startDate;
    this.endDate = travelRef.endDate;
    this.places = [];
  }
}