import React, { useEffect } from 'react';
import useGoogle from "react-google-autocomplete/lib/usePlacesAutocompleteService";


const LocationSearcher = () => {
  const {
    placesService,
    placePredictions,
    getPlacePredictions,
    isPlacePredictionsLoading,
  } = useGoogle({
    apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  
  return(
    <div className='w-100'>
      <input
        placeholder="Debounce 500 ms"
        onChange={(evt: any) => {
          getPlacePredictions({ input: evt.target.value });
        }}
      />
    </div>    
  )
}

export default LocationSearcher;