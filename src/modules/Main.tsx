/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import './css/custom_button.css'
import './css/custom_place.css'
import './css/custom_etc.css';
import "react-datepicker/dist/react-datepicker.css";
import { LoadScript, Libraries } from '@react-google-maps/api';

import { useAuth } from '../AuthContext';
import { useAppSelector, useAppDispatch } from '../redux/store';
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
import { Place } from '../DataType/Place';

const Main = () => {
  const dispatch = useAppDispatch();
  const selectedIdxRedux = useAppSelector(state => state.travelList.selectedIdx);
  const libraries: Libraries = ['places'];
  const { userData } = useAuth();

  const [showPanel, setShowPanel] = useState<null | 'travelList' | 'travelInfo'>(null);
  
  //LocationSearcher -> MapComponent/PlaceInfoPanel
  //MapComponent -> PlaceInfoPanel
  const [placeResult, setPlaceResult] = useState<google.maps.places.PlaceResult | null>(null);  

  //TravelInfoPanel -> MapComponent
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [directions, setDirections] = useState<google.maps.DirectionsResult[]>([]);
  const [markerPlaces, setMarkerPlaces] = useState<Place[]>([]);
  
  useEffect(() => {
    if(userData){
      dispatch(readTravelList(userData.uid)); 
    }    
  }, [userData]);

  useEffect(() => {
    if(selectedIdxRedux >= 0){
      setShowPanel('travelInfo');
    }
  }, [selectedIdxRedux]);

  return(
    <div className='h-100'>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY ?? ''}
                  libraries={libraries}
                  onLoad={() => {dispatch(setCurrentLatLng())}}>
        <div className='Panel'>
          {
            showPanel === 'travelList' &&
            <TravelListPanel exit={() => {setShowPanel(null)}}/>
          }
          {
            showPanel === 'travelInfo' &&
            <TravelInfoPanel
              setPlaceId={setSelectedPlaceId}
              setMarkerPlaces={setMarkerPlaces}
              setDirections={setDirections}          
              exit={() => {setShowPanel(null)}}/>
          }
          <div className='p-1 flex-grow-1 d-flex gap-2 justify-content-between align-items-center'
               style={{pointerEvents: 'auto', top: 0}}>
            <Button variant="primary" onClick={() => {setShowPanel('travelList')}}>Travels</Button>
            <LocationSearcher setPlaceInfo={setPlaceResult}/>
            <Login/>
          </div> 
          {
            placeResult &&
            <PlaceInfoPanel 
              placeResult={placeResult}
              onClose={() => setPlaceResult(null)}/>
          }
        </div>

        <MapComponent
          placeInfo={placeResult}          
          setPlaceResult={setPlaceResult}
          placeId={selectedPlaceId}
          directions={directions}
          markerPlaces={markerPlaces}
        />
      </LoadScript>
    </div>
  )
}

export default Main;