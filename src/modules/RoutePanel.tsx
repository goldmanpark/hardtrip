/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Card, Form } from 'react-bootstrap';
import { Place } from '../DataType/Place';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RouteIcon from '@mui/icons-material/Route';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsTransitIcon from '@mui/icons-material/DirectionsTransit';
import PedalBikeIcon from '@mui/icons-material/PedalBike';
import DriveEtaIcon from '@mui/icons-material/DriveEta';

interface RoutePanelProps{
  //from TravelInfoEditPanel
  from: Place;
  to: Place;
  //to MapComponent
  setDirections: React.Dispatch<React.SetStateAction<google.maps.DirectionsResult[]>>;
  onClose?: () => void;
}

const RoutePanel = (props: RoutePanelProps) => {
  const directionsService = new google.maps.DirectionsService();
  const [currentMode, setCurrentMode] = useState<google.maps.TravelMode>(null);
  const [direction, setDirection] = useState<google.maps.DirectionsResult>(null);
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);

  useEffect(() => {
    setRoutes([]);
  }, [props.from, props.to]);

  useEffect(() => {
    props.setDirections([direction]);
  }, [direction]);

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
        setDirection(result);
        setRoutes(result.routes);
        setCurrentMode(mode);
      } else {
        console.error(result);
      }
    });
  }

  const setCurrentRoute = (route: google.maps.DirectionsRoute) => {
    setDirection(prev => ({...prev, routes: [route]}))
  }
  //#endregion

  //#region [conditional rendering]
  const renderRouteCard = (route: google.maps.DirectionsRoute, idx: number): JSX.Element => {
    const leg = route.legs[0];
    return (
      <Card key={`route_${idx}`}>
        <Card.Header className='p-1 d-flex justify-content-between'>
          {`${leg.distance.text} ${leg.duration.text} `}
          { route.fare && `${route.fare.currency} ${route.fare.value}`}
          <RouteIcon onClick={() => setCurrentRoute(route)}/>
        </Card.Header>
        {
          currentMode === google.maps.TravelMode.TRANSIT &&
          <Card.Body className='p-1 d-flex flex-column'>
          {
            leg.steps.map(step => (
              <Card>
                <Card.Header className='p-1 text-align-left'>
                { travelModeIcon(step.travel_mode) }
                {`${step.distance.text} ${step.duration.text}`}
                </Card.Header>
                {
                  step.transit && step.transit.line &&
                  <Card.Body className='p-1 text-align-left'>
                    {`${step.transit.line.vehicle.type} / ${step.transit.line.name} `}
                    {step.transit.line.short_name && `/${ step.transit.line.short_name}`}
                  </Card.Body>
                }
              </Card>
            ))
          }
          </Card.Body>
        }        
      </Card>
    )
  }

  const travelModeIcon = (mode: google.maps.TravelMode) => {
    switch (mode) {
      case google.maps.TravelMode.WALKING:
        return <DirectionsWalkIcon/>;
      case google.maps.TravelMode.BICYCLING:
        return <PedalBikeIcon/>;
      case google.maps.TravelMode.TRANSIT:
        return <DirectionsTransitIcon/>;
      case google.maps.TravelMode.DRIVING:
        return <DriveEtaIcon/>;
      default:
        return <React.Fragment/>
    }
  }
  //#endregion

  return(
    <Card className='custom-card card-right'>
       <Card.Header className='d-flex flex-row justify-content-between align-items-center'>
        <h4 className='m-0'>Find Route</h4>
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

        <div className='d-flex flex-row justify-content-around mb-3'>
          <button className='RouteButton' onClick={e => { searchRoute(google.maps.TravelMode.WALKING); }}>
           <DirectionsWalkIcon className='RouteIcon'/>
          </button>
          <button className='RouteButton' onClick={e => { searchRoute(google.maps.TravelMode.TRANSIT); }}>
            <DirectionsTransitIcon className='RouteIcon'/>
          </button>
          <button className='RouteButton' onClick={e => { searchRoute(google.maps.TravelMode.BICYCLING); }}>
            <PedalBikeIcon className='RouteIcon'/>
          </button>
          <button className='RouteButton' onClick={e => { searchRoute(google.maps.TravelMode.DRIVING); }}>
            <DriveEtaIcon className='RouteIcon'/>
          </button>
        </div>

        <div className='d-flex flex-column gap-3'>
        { routes.map((x, i) => { return renderRouteCard(x, i)})}
        </div>
      </Card.Body>
    </Card>
  )
}

export default RoutePanel;