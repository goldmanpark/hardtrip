/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import './css/custom_button.css'
import './css/custom_place.css'
import './css/custom_etc.css';
import { LoadScript, Libraries } from '@react-google-maps/api';
import { useAppDispatch } from '../redux/store';
import { setCurrentLatLng } from '../redux/selectedLatLngSlice';

import Login from './Login';
import MapComponent from './MapComponent';
import TravelListDropdown from './TravelListDropdown';
import LocationSearcher from './LocationSearcher';
import PlaceInfoPanel from './PlaceInfoPanel';
import TravelInfoPanel from './TravelInfoPanel';
import { ITravel } from '../DataType/Travel';

const Main = () => {
  const dispatch = useAppDispatch();
  const libraries: Libraries = ['places'];
  const [placeInfo, setPlaceInfo] = useState<google.maps.places.PlaceResult | null>(null);
  const [selectedTravel, setSelectedTravel] = useState<ITravel | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult[]>([]);

  useEffect(() => {
    if(placeInfo) setSelectedTravel(null);
  }, [placeInfo]);

  useEffect(() => {
    if(selectedTravel) setPlaceInfo(null);
  }, [selectedTravel])

  return(
    <div className='d-flex'>
      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY ?? ''}
        libraries={libraries}
        onLoad={() => {dispatch(setCurrentLatLng())}}>
        <div className={`Header ${placeInfo !== null ? 'active' : ''} d-flex gap-2 justify-content-between align-items-center`}>
          <TravelListDropdown
            selectedTravel={selectedTravel}
            setSelectedTravel={setSelectedTravel}
          />
          <LocationSearcher/>
          <Login/>
        </div> 

        <MapComponent
          setPlaceInfo={setPlaceInfo}
          directions={directions}
        />        
        {
          placeInfo !== null &&
          <PlaceInfoPanel
            placeInfo={placeInfo}
            exit={() => {setPlaceInfo(null)}}/>
        }
        {
          selectedTravel !== null &&
          <TravelInfoPanel
            travel={selectedTravel}
            setDirections={setDirections}
            exit={() => {setSelectedTravel(null)}}/>
        }
      </LoadScript>
    </div>
  )
}

export default Main;