import React, { useEffect, useState } from 'react';
import './custom.css'
import MapComponent from './MapComponent';
import Menu from './Menu';
import LocationSearcher from './LocationSearcher';

const Main = () => {
  const [showTraffic, setShowTraffic] = useState<boolean>(false);
  const [showTransit, setShowTransit] = useState<boolean>(false);
  const [showBicycle, setShowBicycle] = useState<boolean>(false);

  return(
    <div>
      <div className='Header d-flex gap-2 justify-content-between '>
        <Menu
          setShowTraffic={setShowTraffic}
          setShowTransit={setShowTransit}
          setShowBicycle={setShowBicycle}
        />
        <LocationSearcher/>
      </div>
    
      <MapComponent
        showTraffic={showTraffic}
        showTransit={showTransit}
        showBicycle={showBicycle}
      />
    </div>
  )
}

export default Main;