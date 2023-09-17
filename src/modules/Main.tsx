/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import './css/custom_button.css'
import './css/custom_place.css'
import { LoadScript, Libraries } from '@react-google-maps/api';
import { useAppDispatch } from '../redux/store';
import { setCurrentLatLng } from '../redux/selectedLatLngSlice';

import Login from './Login';
import MapComponent from './MapComponent';
import Menu from './Menu';
import LocationSearcher from './LocationSearcher';
import PlaceInfoPanel from './PlaceInfoPanel';
import Compass from './Compass';

const Main = () => {
  const dispatch = useAppDispatch();
  const libraries: Libraries = ['places'];
  const [showTraffic, setShowTraffic] = useState<boolean>(false);
  const [showTransit, setShowTransit] = useState<boolean>(false);
  const [placeInfo, setPlaceInfo] = useState<google.maps.places.PlaceResult | null>(null);

  return(
    <div className='d-flex'>
      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY ?? ''}
        libraries={libraries}
        onLoad={() => {dispatch(setCurrentLatLng())}}>
        <div className={`Header ${placeInfo !== null ? 'active' : ''} d-flex gap-2 justify-content-between align-items-center`}>
          <Menu
            showTraffic={showTraffic}
            showTransit={showTransit}
            setShowTraffic={setShowTraffic}
            setShowTransit={setShowTransit}
          />
          <LocationSearcher/>
          <Login/>
        </div> 

        <MapComponent
          showTraffic={showTraffic}
          showTransit={showTransit}
          setPlaceInfo={setPlaceInfo}
        />

        <div className='Footer d-flex flex-column'>
          <Compass/>
        </div>
        {
          placeInfo !== null &&
          <PlaceInfoPanel
            placeInfo={placeInfo}
            exit={() => {setPlaceInfo(null)}}/>
        }
      </LoadScript>
    </div>
  )
}

export default Main;