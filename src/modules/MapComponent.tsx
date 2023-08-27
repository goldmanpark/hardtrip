import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, TrafficLayer, TransitLayer, BicyclingLayer } from '@react-google-maps/api';

interface MapProps{
  showTraffic: boolean;
  showTransit: boolean;
  showBicycle: boolean;
  selectedLatitude: number | null;
  selectedLongitude: number | null;
}

type Coordinate = {
  lat: number;
  lng: number;
}

const MapComponent = (props: MapProps) => {
  const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const mapOption = {
    disableDefaultUI : true
  } as google.maps.MapOptions;
  const containerStyle = {
    width: '100%',
    height: '100vh',
  };

  const [center, setCenter] = useState<Coordinate>();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setCenter({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    });
  }, []);

  useEffect(() => {
    if(props.selectedLatitude && props.selectedLongitude){
      setCenter({
        lat: props.selectedLatitude,
        lng: props.selectedLongitude
      })
    }
  }, [props.selectedLatitude, props.selectedLongitude])

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
