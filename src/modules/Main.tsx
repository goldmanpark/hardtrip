/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleMap, TrafficLayer, TransitLayer, MarkerF } from '@react-google-maps/api';
import { Dropdown } from 'react-bootstrap';
import './css/custom_button.css'
import './css/custom_place.css'
import './css/custom_etc.css';
import { LoadScript, Libraries } from '@react-google-maps/api';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { setCurrentLatLng } from '../redux/selectedLatLngSlice';

import Login from './Login';
import TravelListDropdown from './TravelListDropdown';
import LocationSearcher from './LocationSearcher';
import PlaceInfoPanel from './PlaceInfoPanel';
import TravelInfoPanel from './TravelInfoPanel';
import Compass from './subModules/Compass';
import { ITravel } from '../DataType/Travel';

const Main = () => {
  const dispatch = useAppDispatch();
  const libraries: Libraries = ['places'];
  
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [showTraffic, setShowTraffic] = useState<boolean>(false);
  const [showTransit, setShowTransit] = useState<boolean>(false);
  
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLng>(null);
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [selectedTravel, setSelectedTravel] = useState<ITravel | null>(null);
  const selectedLatLng = useAppSelector((state) => state.selectedLatLng);
  
  const placesService = useMemo(() => {
    if(map) return new google.maps.places.PlacesService(map)
    else return null;
  }, [map]);

  //#region [useEffect]
  useEffect(() => {
    if(selectedLatLng){
      let pos = new google.maps.LatLng(selectedLatLng.lat, selectedLatLng.lng);
      setCurrentPosition(pos);
    }
  }, [selectedLatLng]);

  useEffect(() => {
    if(selectedPlace) setSelectedTravel(null);
  }, [selectedPlace]);

  useEffect(() => {
    if(selectedTravel) setSelectedPlace(null);
  }, [selectedTravel]);
  //#endregion

  //#region [Map event handler]
  const onClickMap = (e: google.maps.MapMouseEvent) => {
    e.stop();
    let _id = (e as any).placeId;
    if(map instanceof google.maps.Map && _id && placesService){
      let request = {
        placeId: _id,
        fields: [
          'place_id',
          'adr_address',
          'vicinity',
          'icon',
          'icon_background_color',
          'name',
          'opening_hours',
          'photo',
          'rating',
          'user_ratings_total',
          'reviews',
          'types',
          'website',
          'geometry'
        ]
      } as google.maps.places.PlaceDetailsRequest;

      placesService.getDetails(request, (place: any, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          setSelectedPlace(place);
        }
      });
    }
  }

  const onClickTraffic = () => {
    setShowTraffic(prev => !prev);
  }

  const onClickTransit = () => {
    setShowTransit(prev => !prev);
  }
  //#endregion

  return(
    <div className='d-flex'>
      <div className={`Header ${selectedPlace !== null ? 'active' : ''} d-flex gap-2 justify-content-between align-items-center`}>
        <TravelListDropdown
          selectedTravel={selectedTravel}
          setSelectedTravel={setSelectedTravel}
        />
        <LocationSearcher/>
        <Login/>
      </div> 

      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY ?? ''}
                  libraries={libraries}
                  onLoad={() => {dispatch(setCurrentLatLng())}}>
        <GoogleMap mapContainerStyle={{ width: '100%', height: '100vh' }}
                  center={currentPosition}
                  zoom={12}
                  clickableIcons={true}
                  options={{ disableDefaultUI : true, gestureHandling : 'greedy' }}
                  onClick={onClickMap}
                  onLoad={setMap}
                  onUnmount={() => {setMap(null)}}>
          { showTraffic && <TrafficLayer/> }
          { showTransit && <TransitLayer/> }
          <MarkerF position={currentPosition}/>
        </GoogleMap>
      </LoadScript>
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
            exit={() => {setSelectedTravel(null)}}/>
        }
      <div className='Footer w-100 d-flex flex-row justify-content-between'>
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
    </div>
  )
}

export default Main;