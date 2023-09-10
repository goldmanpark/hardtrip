/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleMap, Libraries, TrafficLayer, TransitLayer } from '@react-google-maps/api';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { setSelectedCoordinate } from '../redux/selectedCoordinateSlice';

import Coordinate from '../DataType/Coordinate';

interface MapProps{
  showTraffic: boolean;
  showTransit: boolean;
  setPlaceInfo: React.Dispatch<React.SetStateAction<google.maps.places.PlaceResult | null>>;
}

const MapComponent = (props: MapProps) => {
  const dispatch = useAppDispatch();
  const selectedCoordinate: Coordinate = useAppSelector((state) => state.selectedCoordinate);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const placesService = useMemo(() => {
    if(map) return new google.maps.places.PlacesService(map)
    else return null;
  }, [map]);

  const onClickMap = (e: google.maps.MapMouseEvent) => {
    e.stop();
    let _id = (e as any).placeId;
    if(map instanceof google.maps.Map && _id && placesService){
      let request = {
        placeId: _id,
        fields: [
          'adr_address',
          'vicinity',
          'icon',
          'icon_background_color',
          'name',
          'opening_hours',
          'photo',
          'rating',
          'user_ratings_total',
          'reviews',
          'types',
          'website'
        ]
      } as google.maps.places.PlaceDetailsRequest;

      placesService.getDetails(request, (place: any, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          console.log(place);
          props.setPlaceInfo(place);
        }
      });
    }
  }

  return (
    <GoogleMap mapContainerStyle={{ width: '100%', height: '100vh' }}
               center={selectedCoordinate}
               zoom={12}
               clickableIcons={true}
               options={{ disableDefaultUI : true }}
               onClick={onClickMap}
               onLoad={setMap}
               onUnmount={() => {setMap(null)}}>
      {props.showTraffic && <TrafficLayer/> }
      {props.showTransit && <TransitLayer/> }

    </GoogleMap>
  );
};

export default MapComponent;
