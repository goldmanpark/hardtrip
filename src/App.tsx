import React, {useEffect, useState} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button } from 'react-bootstrap';


import MapComponent from './modules/MapComponent';
import Menu from './modules/Menu';

function App() {
  const btnCss = {
    position: 'absolute',
    top: '20px', /* 좌상단에서의 거리 조절 */
    left: '20px', /* 좌상단에서의 거리 조절 */
    zIndex: 9999, /* 다른 요소들보다 항상 위에 놓기 */
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  } as React.CSSProperties;

  const [showTraffic, setShowTraffic] = useState<boolean>(false);
  const [showTransit, setShowTransit] = useState<boolean>(false);
  const [showBicycle, setShowBicycle] = useState<boolean>(false);

  return (
    <div className="App">
      <div>
        <Menu
          style={btnCss}
          setShowTraffic={setShowTraffic}
          setShowTransit={setShowTransit}
          setShowBicycle={setShowBicycle}
        />
        <MapComponent
          showTraffic={showTraffic}
          showTransit={showTransit}
          showBicycle={showBicycle}
        />
      </div>
    </div>
  );
}

export default App;
