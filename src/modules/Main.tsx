import React, { useState } from 'react';
import './custom.css'
import Login from './Login';
import MapComponent from './MapComponent';
import Menu from './Menu';
import LocationSearcher from './LocationSearcher';

const Main = () => {
  const [showTraffic, setShowTraffic] = useState<boolean>(false);
  const [showTransit, setShowTransit] = useState<boolean>(false);
  
  return(
    <div>
      <div className='Header d-flex gap-2 justify-content-between align-items-center'>
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
      />
    </div>
  )
}

export default Main;