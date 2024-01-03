import { Place, PlaceSerialized, serializePlace, deSerializePlace } from "./Place";

export interface TravelSerialized{
  id: string;
  uid: string;
  name: string;
  opened: boolean;
  startDate?: number;
  endDate?: number;
  places?: PlaceSerialized[];
}

export interface Travel extends Omit<TravelSerialized, 'startDate' | 'endDate' | 'places'>{
  startDate?: Date;
  endDate?: Date;
  places: Place[];
}

export function serializeTravel(travel: Travel): TravelSerialized{
  return {
    ...travel,
    startDate: travel.startDate ? travel.startDate.getTime() : undefined,
    endDate: travel.endDate ? travel.endDate.getTime() : undefined,
    places: travel.places instanceof Array ? travel.places.map(x => serializePlace(x)) : []
  } as TravelSerialized;
}

export function deSerializeTravel(travel: TravelSerialized): Travel{
  return {
    ...travel,
    startDate: travel.startDate ? new Date(travel.startDate) : undefined,
    endDate: travel.endDate ? new Date(travel.endDate) : undefined,
    places: travel.places instanceof Array ? travel.places.map(x => deSerializePlace(x)) : []
  } as Travel;
}