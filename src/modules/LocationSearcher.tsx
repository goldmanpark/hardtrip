/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, lazy, Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { geocodeByPlaceId } from 'react-google-places-autocomplete';

import { useAppDispatch } from '../redux/store';
import { setSelectedCoordinate } from '../redux/selectedCoordinateSlice';

import Coordinate from '../DataType/Coordinate';

interface LocationSearcherProps{
  
}

const Autocomplete = lazy(() => import('react-google-places-autocomplete'));

const LocationSearcher = (props: LocationSearcherProps) => {
  const dispatch = useAppDispatch();
  const [locResult, setLocResult] = useState<any>(null);

  useEffect(() => {
    if(locResult){
      getGeocode(locResult.value.place_id);
    }
  }, [locResult]);

  const getGeocode = (id: string) => {
    geocodeByPlaceId(id)
    .then(results => {
      if(results instanceof Array && results.length > 0){
        let res = results[0];
        let coord = {
          lat: res.geometry.location.lat(),
          lng: res.geometry.location.lng()
        } as Coordinate;        
        dispatch(setSelectedCoordinate(coord));
      }
    })
    .catch(error => {
      console.error(error);
    });
  }

  return (
    <div className='w-100'>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <Autocomplete
            apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
            selectProps={{
              value: locResult,
              onChange: setLocResult,
            }}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default LocationSearcher;
