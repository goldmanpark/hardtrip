export interface PlaceSerialized{
  id: string;
  place_id: string;
  name: string;
  day: number;
  startDTTM?: number;  
  endDTTM?: number;
  latLng: google.maps.LatLngLiteral;
  type: string; //https://developers.google.com/maps/documentation/places/web-service/supported_types?hl=ko
}

export interface Place extends Omit<PlaceSerialized, 'startDTTM' | 'endDTTM'>{
  startDTTM?: Date;
  endDTTM?: Date;
}

export function serializePlace(place: Place): PlaceSerialized{
  return {
    ...place,
    startDTTM: place.startDTTM ? place.startDTTM.getTime() : undefined,
    endDTTM: place.endDTTM ? place.endDTTM.getTime() : undefined
  } as PlaceSerialized;
}

export function deSerializePlace(place: PlaceSerialized): Place{
  return {
    ...place,
    startDTTM: place.startDTTM ? new Date(place.startDTTM) : undefined,
    endDTTM: place.endDTTM ? new Date(place.endDTTM) : undefined
  } as Place;
}