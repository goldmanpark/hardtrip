import { Timestamp } from "firebase/firestore";
import { IPlace, Place } from "./Place";

export interface ITravel{
  id: string;
  uid: string;
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  places: IPlace[];
}

export class Travel implements ITravel{
  id: string;
  uid: string;
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
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