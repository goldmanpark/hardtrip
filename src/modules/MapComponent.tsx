/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleMap, TrafficLayer, TransitLayer, MarkerF, DirectionsRenderer } from '@react-google-maps/api';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { Dropdown, Button } from 'react-bootstrap';
import Compass from './subModules/Compass';

interface MapProps{
  setPlaceInfo: React.Dispatch<React.SetStateAction<google.maps.places.PlaceResult | null>>;
  directions: google.maps.DirectionsResult[];
}

const MapComponent = (props: MapProps) => {
  const dispatch = useAppDispatch();
  const selectedLatLng = useAppSelector((state) => state.selectedLatLng);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [showTraffic, setShowTraffic] = useState<boolean>(false);
  const [showTransit, setShowTransit] = useState<boolean>(false);
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLng>(null);
  
  const placesService = useMemo(() => {
    if(map) return new google.maps.places.PlacesService(map)
    else return null;
  }, [map]);

  useEffect(() => {
    //직렬화된 데이터를 google.maps.LatLng 로 변환
    if(selectedLatLng){
      let pos = new google.maps.LatLng(selectedLatLng.lat, selectedLatLng.lng);
      setCurrentPosition(pos);
    }
  }, [selectedLatLng]);

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
          props.setPlaceInfo(place);
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

  return (
    <React.Fragment>
      <GoogleMap mapContainerStyle={{ width: '100%', height: '100vh' }}
                center={currentPosition}
                zoom={12}
                clickableIcons={true}
                options={{ disableDefaultUI : true, gestureHandling : 'greedy' }}
                onClick={onClickMap}
                onLoad={setMap}
                onUnmount={() => {setMap(null)}}
                >
        { showTraffic && <TrafficLayer/> }
        { showTransit && <TransitLayer/> }
        { props.directions.map(d => (<DirectionsRenderer directions={d}/>)) }
        <MarkerF position={currentPosition}/>
      </GoogleMap>

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
    </React.Fragment>
  );
};

export default MapComponent;
