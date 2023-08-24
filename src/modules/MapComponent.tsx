import React, { useRef, useEffect } from 'react';
import { GoogleMap, LoadScript, TrafficLayer, TransitLayer, BicyclingLayer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

const center = {
  lat: 37.7749, // 지도의 초기 중앙 좌표 설정
  lng: -122.4194,
};

export interface MapProps{
  showTraffic: boolean;
  showTransit: boolean;
  showBicycle: boolean;
}

const MapComponent = (props: MapProps) => {
  const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const mapOption = {
    disableDefaultUI : true
  } as google.maps.MapOptions;

  return (
    <LoadScript googleMapsApiKey={key ? key : ''}>
      <GoogleMap mapContainerStyle={containerStyle}
                 center={center}
                 zoom={14}
                 clickableIcons={true}
                 options={mapOption}>
        {props.showTraffic && <TrafficLayer/> }
        {props.showTransit && <TransitLayer/> }
        {props.showBicycle && <BicyclingLayer/> }
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
