/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../redux/store';
import { setSelectedLatLng } from '../redux/selectedLatLngSlice';
import { Autocomplete } from '@react-google-maps/api';

const LocationSearcher = () => {
  const dispatch = useAppDispatch();
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete>();

  const onPlaceChanged = () => {
    if(!autocomplete) return;

    const place: google.maps.places.PlaceResult = autocomplete.getPlace();
    let lat = place.geometry.location.lat();
    let lng = place.geometry.location.lng();
    let latLng = new google.maps.LatLng(lat, lng);
    dispatch(setSelectedLatLng(latLng));
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
