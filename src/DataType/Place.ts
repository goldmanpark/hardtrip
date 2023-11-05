import { Timestamp } from "firebase/firestore";

/** FireStore저장용 데이터 */
export interface PlaceFireStore{
  id: string;
  place_id: string;
  name: string;
  day?: number;
  startDTTM?: Timestamp;
  endDTTM?: Timestamp;
  latLng: google.maps.LatLngLiteral;
}

/** Redux용 데이터 */
export interface PlaceRedux{
  id: string;
  place_id: string;
  name: string;
  day?: number;
  startDTTMSeconds?: number;
  startDTTMNanoSeconds?: number;
  endDTTMSeconds?: number;
  endDTTMNanoSeconds?: number;
  latLng: google.maps.LatLngLiteral;
}

export function PlaceFS2Redux(fs: PlaceFireStore): PlaceRedux{
  const redux = {...fs} as PlaceRedux;
  if(fs.startDTTM){
    redux.startDTTMSeconds = fs.startDTTM.seconds;
    redux.startDTTMNanoSeconds = fs.startDTTM.nanoseconds;
  }
  if(fs.endDTTM){
    redux.endDTTMSeconds = fs.endDTTM.seconds;
    redux.endDTTMNanoSeconds = fs.endDTTM.nanoseconds;
  }
  return redux;
}

export function PlaceRedux2FS(redux: PlaceRedux): PlaceFireStore{
  const fs = {...redux} as PlaceFireStore;
  if(redux.startDTTMSeconds){
    fs.startDTTM = new Timestamp(redux.startDTTMSeconds, redux.startDTTMNanoSeconds);
  }
  if(redux.endDTTMSeconds){
    fs.endDTTM = new Timestamp(redux.endDTTMSeconds, redux.endDTTMNanoSeconds);
  }
  return fs;
}

/** 어플리케이션 데이터 */
export class Place{
  id: string;
  place_id: string;
  name: string;
  day?: number;
  
  startDTTM?: Date;
  endDTTM?: Date;  
  latLng: google.maps.LatLng;
  placeInfo: google.maps.places.PlaceResult;  

  //상태관리용
  isDel: boolean;
  isEdit: boolean;

  constructor(redux?: PlaceRedux){
    if(redux){
      this.id = redux.id;
      this.place_id = redux.place_id;
      this.name = redux.name;
      this.day = redux.day;
  
      if(redux.startDTTMSeconds){
        this.startDTTM = (new Timestamp(redux.startDTTMSeconds, redux.startDTTMNanoSeconds)).toDate();
      }
      if(redux.endDTTMSeconds){
        this.endDTTM = (new Timestamp(redux.endDTTMSeconds, redux.endDTTMNanoSeconds)).toDate();
      }
      this.latLng = new google.maps.LatLng(redux.latLng);
      this.isDel = false;
      this.isEdit = false;
    }    
  }

  public getRedux(): PlaceRedux{
    const redux = {
      id: this.id,
      place_id: this.place_id,
      name: this.name,
      day: this.day,
      latLng: this.latLng.toJSON()
    } as PlaceRedux;
    
    if(this.startDTTM){
      const start = Timestamp.fromDate(this.startDTTM);
      redux.startDTTMSeconds = start.seconds;
      redux.startDTTMNanoSeconds = start.nanoseconds;
    }
    if(this.endDTTM){
      const end = Timestamp.fromDate(this.endDTTM);
      redux.endDTTMSeconds = end.seconds;
      redux.endDTTMNanoSeconds = end.nanoseconds;
    }
    
    return redux;
  }
}