/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, lazy, Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { geocodeByPlaceId } from 'react-google-places-autocomplete';

interface LocationSearcherProps{
  setSelectedLatitude: React.Dispatch<React.SetStateAction<number | null>>;
  setSelectedLongitude: React.Dispatch<React.SetStateAction<number | null>>;
}

const Autocomplete = lazy(() => import('react-google-places-autocomplete'));

const LocationSearcher = (props: LocationSearcherProps) => {
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
        props.setSelectedLatitude(res.geometry.location.lat);
        props.setSelectedLongitude(res.geometry.location.lng);
      }
    })
    .catch(error => {
      props.setSelectedLatitude(null);
      props.setSelectedLongitude(null);
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
