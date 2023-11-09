/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import './css/custom_button.css'
import './css/custom_place.css'
import './css/custom_etc.css';
import "react-datepicker/dist/react-datepicker.css";
import { LoadScript, Libraries } from '@react-google-maps/api';

import { useAuth } from '../AuthContext';
import { useAppDispatch } from '../redux/store';
import { readTravelList } from '../redux/travelListSlice';
import { setCurrentLatLng } from '../redux/selectedLatLngSlice';
import { Button } from 'react-bootstrap';

import Login from './Login';
import MapComponent from './MapComponent';
import TravelListPanel from './TravelListPanel';
import LocationSearcher from './LocationSearcher';
import PlaceInfoPanel from './PlaceInfoPanel';
import TravelInfoPanel from './TravelInfoPanel';
import { Travel } from '../DataType/Travel';

const Main = () => {
  const dispatch = useAppDispatch();
  const libraries: Libraries = ['places'];
  const { userData } = useAuth();
  const [showTravelList, setShowTravelList] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [selectedTravel, setSelectedTravel] = useState<Travel | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult[]>([]);
  
  useEffect(() => {
    if(selectedPlace) setSelectedTravel(null);
  }, [selectedPlace]);

  useEffect(() => {
    if(selectedTravel) setSelectedPlace(null);
  }, [selectedTravel]);

  useEffect(() => {
    if(userData){
      dispatch(readTravelList(userData.uid)); 
    }    
  }, [userData])

  return(
    <div className='d-flex'>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY ?? ''}
                  libraries={libraries}
                  onLoad={() => {dispatch(setCurrentLatLng())}}>
        <div className={`Header ${showTravelList || selectedPlace !== null || selectedTravel !== null ? 'active' : ''} d-flex gap-2 justify-content-between align-items-center`}>
          <Button variant="primary" onClick={() => {setShowTravelList(true)}}>Travels</Button>
          <LocationSearcher/>
          <Login/>
        </div> 

        <MapComponent
          placeInfo={selectedPlace}
          setPlaceInfo={setSelectedPlace}
          selectedTravel={selectedTravel}
          directions={directions}
        />

      {
        showTravelList &&
        <TravelListPanel
          //setSelectedTravel={setSelectedTravel}
          exit={() => {setShowTravelList(false)}}/>
      }
      {
        selectedPlace !== null &&
        <PlaceInfoPanel
          placeInfo={selectedPlace}
          exit={() => {setSelectedPlace(null)}}/>
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