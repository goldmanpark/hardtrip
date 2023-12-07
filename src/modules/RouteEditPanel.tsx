/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react';
import { Card, Form, Dropdown } from 'react-bootstrap';
import { Place } from '../DataType/Place';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RouteIcon from '@mui/icons-material/Route';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsTransitIcon from '@mui/icons-material/DirectionsTransit';
import PedalBikeIcon from '@mui/icons-material/PedalBike';
import DriveEtaIcon from '@mui/icons-material/DriveEta';

interface RouteEditPanelProps{
  from: Place;
  to: Place;
  onClose?: () => void;
}

const RouteEditPanel = (props: RouteEditPanelProps) => {
  const directionsService = new google.maps.DirectionsService();
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);

  //#region [functions]
  const searchRoute = async (mode: google.maps.TravelMode) => {
    const req = {
      origin: { placeId: props.from.place_id } as google.maps.Place,
      destination: { placeId: props.to.place_id } as google.maps.Place,
      travelMode: mode,
      provideRouteAlternatives: true
    } as google.maps.DirectionsRequest;

    await directionsService.route(req, async (result, status) => {
      if(status === google.maps.DirectionsStatus.OK){
        console.log(result)
        setRoutes(result.routes);
      } else {
        console.error(result);
      }
    });
  }
  //#endregion

  //#region [conditional rendering]
  //#endregion

  return(
    <Card className='custom-card card-right'>
       <Card.Header className='d-flex flex-row justify-content-between align-items-center'>
        <h4 className='m-0'>Edit Route</h4>
        <CloseRoundedIcon onClick={() => {props.onClose()}}/>
      </Card.Header>

      <Card.Body className='overflow-auto d-flex flex-column'>
        <Form>
          <Form.Group className="mb-3 d-flex flex-column align-items-start">
            <Form.Label>from</Form.Label>
            <Form.Control type='text' disabled value={props.from.name}/>
            <Form.Label>to</Form.Label>
            <Form.Control type='text' disabled value={props.to.name}/>
          </Form.Group>
        </Form>

        <div className='d-flex flex-row justify-content-between'>
          <Dropdown>
            <Dropdown.Toggle variant="secondary">
              <RouteIcon/>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={e => { searchRoute(google.maps.TravelMode.WALKING); }}>
                <DirectionsWalkIcon/>
                Walk
              </Dropdown.Item>
              <Dropdown.Item onClick={e => { searchRoute(google.maps.TravelMode.TRANSIT); }}>
                <DirectionsTransitIcon/>
                Transit
              </Dropdown.Item>
              <Dropdown.Item onClick={e => { searchRoute(google.maps.TravelMode.BICYCLING); }}>
                <PedalBikeIcon/>
                Bicycle
              </Dropdown.Item>
              <Dropdown.Item onClick={e => { searchRoute(google.maps.TravelMode.DRIVING); }}>
                <DriveEtaIcon/>
                Driving
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        
      </Card.Body>
    </Card>
  )
}

export default RouteEditPanel;