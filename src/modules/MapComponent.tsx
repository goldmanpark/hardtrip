import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, TrafficLayer, TransitLayer } from '@react-google-maps/api';
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
  const selectedCoordinate: Coordinate = useAppSelector((state) => state.selectedCoordinate);

  useEffect(() => {
    dispatch(setCurrentCoordinate());
  }, []);
  
  const onClickMap = (e: google.maps.MapMouseEvent) => {
    e.stop();
    let gia = e as any;
    if(gia.placeId){
      console.log(gia.placeId);
    }
  }

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY ?? ''}>
      <GoogleMap mapContainerStyle={{ width: '100%', height: '100vh' }}
                 center={selectedCoordinate}
                 zoom={5}
                 clickableIcons={true}
                 options={{ disableDefaultUI : true }}
                 onClick={onClickMap}>
        {props.showTraffic && <TrafficLayer/> }
        {props.showTransit && <TransitLayer/> }
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
