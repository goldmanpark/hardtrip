/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleMap, LoadScript, Libraries, TrafficLayer, TransitLayer } from '@react-google-maps/api';
import { geocodeByPlaceId } from 'react-google-places-autocomplete';

import { useAppSelector, useAppDispatch } from '../redux/store';
import { setSelectedCoordinate, setCurrentCoordinate } from '../redux/selectedCoordinateSlice';

import Coordinate from '../DataType/Coordinate';

interface MapProps{
  showTraffic: boolean;
  showTransit: boolean;
}

const MapComponent = (props: MapProps) => {
  const dispatch = useAppDispatch();
  const libraries: Libraries = ['places'];
  const selectedCoordinate: Coordinate = useAppSelector((state) => state.selectedCoordinate);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const placesService = useMemo(() => {
    if(map) return new google.maps.places.PlacesService(map)
    else return null;
  }, [map]);

  useEffect(() => {
    dispatch(setCurrentCoordinate());
  }, []);

  const onClickMap = (e: google.maps.MapMouseEvent) => {
    e.stop();
    let _id = (e as any).placeId;
    if(map instanceof google.maps.Map && _id && placesService){
      let request = {
        placeId: _id,
        fields: ['name', 'formatted_address', 'rating', 'reviews']
      } as google.maps.places.PlaceDetailsRequest;

      placesService.getDetails(request, (place: any, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // 장소 정보를 사용자에게 표시
            console.log('장소 이름: ' + place.name);
            console.log('주소: ' + place.formatted_address);
            console.log('평점: ' + place.rating);
            // 리뷰 등 다른 정보도 여기에서 사용할 수 있음
        }
      });
    }
  }

  return (
    <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY ?? ''}
        libraries={libraries}>
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
    </LoadScript>
  );
};

export default MapComponent;
