/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import { LoadScript, Libraries } from '@react-google-maps/api';

import { useAuth } from '../AuthContext';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { readTravelList } from '../redux/travelListSlice';
import { setCurrentLatLng } from '../redux/selectedLatLngSlice';
import { Button, Dropdown } from 'react-bootstrap';

import MapComponent from './MapComponent';
import MobileDraggable from './subModules/MobileDraggable';
import LocationSearcher from './LocationSearcher';
import TravelListPanel from './TravelListPanel';
import TravelInfoEditPanel from './TravelInfoEditPanel';
import TravelInfoViewPanel from './TravelInfoViewPanel';
import PlaceInfoPanel from './PlaceInfoPanel';
import RoutePanel from './RoutePanel';
import UserInfo from './UserInfo';
import Compass from './subModules/Compass';
import { Place } from '../DataType/Place';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const MainMobile = () => {
  const dispatch = useAppDispatch();
  const selectedIdxRedux = useAppSelector(state => state.travelList.selectedIdx);
  const selectedOpenedIdxRedux = useAppSelector(state => state.openedTravelList.selectedIdx);
  const libraries: Libraries = ['places'];
  const { userData } = useAuth();

  //Main only
  const [showLeftPanel, setShowLeftPanel] = useState<null | 'travelList' | 'travelEdit' | 'travelView'>(null);
  const [showRightPanel, setShowRightPanel] = useState<null | 'placeResult' | 'route' | 'userInfo'>(null);
  
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
      setShowLeftPanel('travelEdit');
    }
  }, [selectedIdxRedux]);

  useEffect(() => {
    if(selectedOpenedIdxRedux >= 0){
      setShowLeftPanel('travelView');
    }
  }, [selectedOpenedIdxRedux]);

  useEffect(() => {
    if(placeResult){
      setFrom(null);
      setTo(null);
      setShowRightPanel('placeResult');
    }
  }, [placeResult]);

  useEffect(() => {
    if(from && to){
      setPlaceResult(null);
      setShowRightPanel('route');
    }
  }, [from, to])

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
        <div className={`Header p-2 flex-grow-1 d-flex gap-2 justify-content-between align-items-center`}>
          <Button variant="primary" onClick={() => {setShowLeftPanel('travelList')}}>Travels</Button>
          <LocationSearcher setPlaceResult={setPlaceResult}/>
          <AccountCircleIcon style={{width: '40px', height: '40px'}}
            onClick={() => setShowRightPanel('userInfo')}/>
        </div>

        <MapComponent
          showTraffic={showTraffic}
          showTransit={showTransit}
          placeResult={placeResult}
          setPlaceResult={setPlaceResult}
          placeId={selectedPlaceId}
          directions={directions}
          markerPlaces={markerPlaces}
        />

        <div className={`Footer p-2 d-flex flex-row justify-content-between`}>
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
          (showLeftPanel === 'travelList' ||
          showLeftPanel === 'travelEdit' ||
          showLeftPanel === 'travelView' ||
          (showRightPanel === 'placeResult' && placeResult) ||
          (showRightPanel === 'route' && from && to) ||
          showRightPanel === 'userInfo')
          &&
          <MobileDraggable>
          {
            showLeftPanel === 'travelList' &&
            <TravelListPanel exit={() => {setShowLeftPanel(null)}}/>          
          }
          {
            showLeftPanel === 'travelEdit' &&
            <TravelInfoEditPanel
              setPlaceId={setSelectedPlaceId}
              setMarkerPlaces={setMarkerPlaces}
              setDirections={setDirections}
              setFrom={setFrom}
              setTo={setTo}
              onClose={() => {setShowLeftPanel(null)}}/>
          }
          {
            showLeftPanel === 'travelView' &&          
            <TravelInfoViewPanel
              setPlaceId={setSelectedPlaceId}
              setMarkerPlaces={setMarkerPlaces}
              setDirections={setDirections}
              setFrom={setFrom}
              setTo={setTo}
              onClose={() => {setShowLeftPanel(null)}}/>          
          }
          {
            showRightPanel === 'placeResult' && placeResult &&          
            <PlaceInfoPanel
              placeResult={placeResult}
              onClose={() => {
                setPlaceResult(null);
                setShowRightPanel(null);
              }}/>
          }
          {
            showRightPanel === 'route' && from && to &&
            <RoutePanel 
              from={from} to={to} 
              setDirections={setDirections}
              onClose={() => {
                setFrom(null);
                setTo(null);
                setShowRightPanel(null);
              }}/>
          }
          {
            showRightPanel === 'userInfo' &&
            <UserInfo onClose={() => setShowRightPanel(null)}/>
          }
          </MobileDraggable>
        }
      </LoadScript>
    </div>
  )
}

export default MainMobile;