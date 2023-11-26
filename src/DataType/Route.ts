export interface Route{
  sourceId: string;
  destinationId: string;
  sourcePlaceId: string;
  destinationPlaceId: string;
  travelMode: google.maps.TravelMode;
  distance: number;
  duration: number;
  fare: number;
  currency: string;
}