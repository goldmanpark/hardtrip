/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../redux/store';
import { setSelectedCoordinate } from '../redux/selectedCoordinateSlice';
import { Autocomplete } from '@react-google-maps/api';

import Coordinate from '../DataType/Coordinate';

const LocationSearcher = () => {
  const dispatch = useAppDispatch();
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete>();

  const onPlaceChanged = () => {
    if(!autocomplete) return;

    const place: google.maps.places.PlaceResult = autocomplete.getPlace();
    let coord = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    } as Coordinate;
    dispatch(setSelectedCoordinate(coord));
  }

  return (
    <div className='w-100'>
      <Autocomplete
        onLoad={setAutocomplete}
        onPlaceChanged={onPlaceChanged}>
        <input className='MenuButton w-100'
               type='text'
               placeholder='Find Place...'/>
      </Autocomplete>
    </div>
  );
};

export default LocationSearcher;
