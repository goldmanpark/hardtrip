import { Timestamp } from "firebase/firestore";
import { Place, PlaceFireStore, PlaceRedux, PlaceFS2Redux } from "./Place";

export interface TravelFireStore{
  id: string;
  uid: string;
  name: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  places?: PlaceFireStore[];
}

export interface TravelRedux{
  id: string;
  uid: string;
  name: string;
  startDateSeconds?: number;
  startDateNanoSeconds?: number;
  endDateSeconds?: number;
  endDateNanoSeconds?: number;
  places: PlaceRedux[];
}

export function TravelFS2Redux(fs: TravelFireStore): TravelRedux{
  const redux = {
    id: fs.id,
    uid: fs.uid,
    name: fs.name
  } as TravelRedux;
  if(fs.startDate){
    redux.startDateSeconds = fs.startDate.seconds;
    redux.startDateNanoSeconds = fs.startDate.nanoseconds;
  }
  if(fs.endDate){
    redux.endDateSeconds = fs.endDate.seconds;
    redux.endDateNanoSeconds = fs.endDate.nanoseconds;
  }
  if(fs.places instanceof Array){
    redux.places = fs.places.map(x => (PlaceFS2Redux(x)));
  }
  return redux;
}

export class Travel{
  id: string;
  uid: string;
  name: string;
  startDate: Date;
  endDate: Date;
  places: Place[];
  
  constructor(redux: TravelRedux){
    this.id = redux.id;
    this.uid = redux.uid;
    this.name = redux.name;
    
    if(redux.startDateSeconds){
      this.startDate = new Timestamp(redux.startDateSeconds, redux.startDateNanoSeconds).toDate();
    }
    if(redux.endDateSeconds){
      this.endDate = new Timestamp(redux.endDateSeconds, redux.endDateNanoSeconds).toDate();
    }    
    if(redux.places instanceof Array && redux.places.length > 0){
      this.places = redux.places.map(x => { return new Place(x) });
    } else {
      this.places = [];
    }    
  }

  getRedux(): TravelRedux{
    const redux = {
      id: this.id,
      uid: this.uid,
      name: this.name,
      places: this.places.map(x => x.getRedux())
    } as TravelRedux

    if(this.startDate){
      const start = Timestamp.fromDate(this.startDate);
      redux.startDateSeconds = start.seconds;
      redux.startDateNanoSeconds = start.nanoseconds;
    }
    if(this.endDate){
      const end = Timestamp.fromDate(this.endDate);
      redux.endDateSeconds = end.seconds;
      redux.endDateNanoSeconds = end.nanoseconds;
    }

    return redux;
  }
}