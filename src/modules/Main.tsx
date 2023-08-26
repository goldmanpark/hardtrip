import React, { useEffect, useState } from 'react';
import './custom.css'
import MapComponent from './MapComponent';
import Menu from './Menu';
import LocationSearcher from './LocationSearcher';

const Main = () => {
  const [showTraffic, setShowTraffic] = useState<boolean>(false);
  const [showTransit, setShowTransit] = useState<boolean>(false);
  const [showBicycle, setShowBicycle] = useState<boolean>(false);
  const [selectedLatitude, setSelectedLatitude] = useState<number | null>(null);
  const [selectedLongitude, setSelectedLongitude] = useState<number | null>(null);

  return(
    <div>
      <div className='Header d-flex gap-2 justify-content-between '>
        <Menu
          setShowTraffic={setShowTraffic}
          setShowTransit={setShowTransit}
          setShowBicycle={setShowBicycle}
        />
        <LocationSearcher
          setSelectedLatitude={setSelectedLatitude}
          setSelectedLongitude={setSelectedLongitude}
        />
      </div>
    
      <MapComponent
        showTraffic={showTraffic}
        showTransit={showTransit}
        showBicycle={showBicycle}
        selectedLatitude={selectedLatitude}
        selectedLongitude={selectedLongitude}
      />
    </div>
  )
}

export default Main;