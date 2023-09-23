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

  constructor(id: string, uid: string, name: string){
    this.id = id;
    this.uid = uid;
    this.name = name;
    this.placeMap = new Map<string, Place>();
  }
  
}