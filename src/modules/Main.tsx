/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import './custom.css'
import './custom_place.css'
import { LoadScript, Libraries } from '@react-google-maps/api';
import { CSSTransition } from 'react-transition-group';
import { useAppDispatch } from '../redux/store';
import { setCurrentCoordinate } from '../redux/selectedCoordinateSlice';

import Login from './Login';
import MapComponent from './MapComponent';
import Menu from './Menu';
import LocationSearcher from './LocationSearcher';
import PlaceInfoPanel from './PlaceInfoPanel';

const Main = () => {
  const dispatch = useAppDispatch();
  const libraries: Libraries = ['places'];
  const [showTraffic, setShowTraffic] = useState<boolean>(false);
  const [showTransit, setShowTransit] = useState<boolean>(false);
  const [placeInfo, setPlaceInfo] = useState<google.maps.places.PlaceResult | null>(null);

  useEffect(() => {
    dispatch(setCurrentCoordinate());
  }, []);

  return(
    <div className='d-flex'>
      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY ?? ''}
        libraries={libraries}>
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
        <CSSTransition
          in={placeInfo !== null}
          timeout={300}
          unmountOnExit>
          <PlaceInfoPanel
            placeInfo={placeInfo}/>
        </CSSTransition>
      </LoadScript>
    </div>
  )
}

export default Main;