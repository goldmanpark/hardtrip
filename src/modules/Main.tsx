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
import { Button, Dropdown } from 'react-bootstrap';

import Login from './Login';
import MapComponent from './MapComponent';
import TravelListPanel from './TravelListPanel';
import LocationSearcher from './LocationSearcher';
import PlaceInfoPanel from './PlaceInfoPanel';
import TravelInfoEditPanel from './TravelInfoEditPanel';
import RoutePanel from './RoutePanel';
import Compass from './subModules/Compass';
import { Place } from '../DataType/Place';

const Main = () => {
  const dispatch = useAppDispatch();
  const selectedIdxRedux = useAppSelector(state => state.travelList.selectedIdx);
  const libraries: Libraries = ['places'];
  const { userData } = useAuth();

  //Main only
  const [showPanel, setShowPanel] = useState<null | 'travelList' | 'travelInfo'>(null);
  const [menuClassName, setMenuClassName] = useState<'Menu-active-none' | 'Menu-active-left' | 'Menu-active-right' | 'Menu-active-both'>('Menu-active-none')
  
  //Main -> MapComponent
  const [showTraffic, setShowTraffic] = useState<boolean>(false);
  const [showTransit, setShowTransit] = useState<boolean>(false);

  //LocationSearcher -> MapComponent/PlaceInfoPanel
  //MapComponent -> PlaceInfoPanel
  const [placeResult, setPlaceResult] = useState<google.maps.places.PlaceResult | null>(null);

  //TravelInfoPanel -> MapComponent
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [directions, setDirections] = useState<google.maps.DirectionsResult[]>([]);
  const [markerPlaces, setMarkerPlaces] = useState<Place[]>([]);

  //TravelInfoEditPanel -> RouteEditPanel
  const [from, setFrom] = useState<Place>(null);
  const [to, setTo] = useState<Place>(null);

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

  useEffect(() => {
    if(showPanel && placeResult){
      setMenuClassName('Menu-active-both')
    } else {
      if(showPanel){
        setMenuClassName('Menu-active-left');
      } else if(placeResult){
        setMenuClassName('Menu-active-right')
      } else {
        setMenuClassName('Menu-active-none');
      }
    }
  }, [showPanel, placeResult]);

  const onClickTraffic = () => {
    setShowTraffic(prev => !prev);
  }

  const onClickTransit = () => {
    setShowTransit(prev => !prev);
  }

  return(
    <div className='h-100 w-100'>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY ?? ''}
                  libraries={libraries}
                  onLoad={() => {dispatch(setCurrentLatLng())}}>
        <div className={`Header p-2 flex-grow-1 d-flex gap-2 justify-content-between align-items-center ${menuClassName}`}>
          <Button variant="primary" onClick={() => {setShowPanel('travelList')}}>Travels</Button>
          <LocationSearcher setPlaceInfo={setPlaceResult}/>
          <Login/>
        </div>

        <MapComponent
          showTraffic={showTraffic}
          showTransit={showTransit}
          placeInfo={placeResult}
          setPlaceResult={setPlaceResult}
          placeId={selectedPlaceId}
          directions={directions}
          markerPlaces={markerPlaces}
        />

        <div className={`Footer p-2 d-flex flex-row justify-content-between ${menuClassName}`}>
          <Dropdown title="Menu" autoClose="outside">
            <Dropdown.Toggle className='MenuButton'>
              Option
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item as="button">
                <div className="toggle-switch" onClick={onClickTraffic}>
                  <input type="checkbox" className="toggle-input" id="toggleTraffic"
                        checked={showTraffic} onChange={onClickTraffic}/>
                  <label className="toggle-label" htmlFor="toggleTraffic"></label>
                  <span className="toggle-text">{showTraffic ? 'Traffic On' : 'Traffic Off'}</span>
                </div>
              </Dropdown.Item>
              <Dropdown.Item>
                <div className="toggle-switch" onClick={onClickTransit}>
                  <input type="checkbox" className="toggle-input" id="toggleTransit"
                        checked={showTransit} onChange={onClickTransit}/>
                  <label className="toggle-label" htmlFor="toggleTransit"></label>
                  <span className="toggle-text">{showTransit ? 'Transit On' : 'Transit Off'}</span>
                </div>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Compass/>
        </div>
        {
          showPanel === 'travelList' &&
          <TravelListPanel exit={() => {setShowPanel(null)}}/>
        }
        {
          showPanel === 'travelInfo' &&
          <TravelInfoEditPanel
            setPlaceId={setSelectedPlaceId}
            setMarkerPlaces={setMarkerPlaces}
            setDirections={setDirections}
            setFrom={setFrom}
            setTo={setTo}
            onClose={() => {setShowPanel(null)}}/>
        }
        {
          placeResult &&
          <PlaceInfoPanel
            placeResult={placeResult}
            onClose={() => setPlaceResult(null)}/>
        }
        {
          from && to &&
          <RoutePanel 
            from={from} to={to} 
            setDirections={setDirections}
            onClose={() => {
              setFrom(null);
              setTo(null);
            }}/>
        }
      </LoadScript>
    </div>
  )
}

export default Main;