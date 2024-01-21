/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { functions } from '../config/firebase';
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAuth } from '../AuthContext';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { Card, Carousel, Navbar, Nav, Container, Row, Col, Button, Dropdown } from 'react-bootstrap';
import { TravelSerialized } from '../DataType/Travel';
import { Place } from '../DataType/Place';
import { createPlace } from '../redux/travelListSlice';

import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccessAlarmRoundedIcon from '@mui/icons-material/AccessAlarmRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarHalfRoundedIcon from '@mui/icons-material/StarHalfRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import { GetyyyyMMdd } from './CommonFunctions';

interface PlaceInfoPanelProps{
  placeResult: google.maps.places.PlaceResult
  onClose?: () => void;
}

//https://developers.google.com/maps/documentation/javascript/reference/places-service?hl=ko#PlaceResult
const PlaceInfoPanel = (props: PlaceInfoPanelProps) => {
  const dispatch = useAppDispatch();
  const { userData } = useAuth();
  const travelListRedux: TravelSerialized[] = useAppSelector((state) => state.travelList.list);
  const [selectedTab, setSelectedTab] = useState<'summary' | 'review' | 'register'>('summary');
  
  const renderContent = () => {
    switch (selectedTab) {
      case 'summary':
        return renderSummary();
      case 'register':
        return renderRegister();
      default:
        break;
    }
  }

  //#region [conditional rendering: summary]
  const renderSummary = () => {
    getTripAdvisorInfo();
    return (
      <div className='d-flex flex-column gap-2'>
        <span className='d-flex flex-row gap-2'>
          <span>{props.placeResult.rating}</span>
          <span>{drawStarRating(props.placeResult.rating)}</span>
          <span>{`(${props.placeResult.user_ratings_total})`}</span>
        </span>

        <span>{`${props.placeResult.types.join(', ')}`}</span>

        {
          props.placeResult.photos && props.placeResult.photos.length > 0 &&
          <Carousel>
            {
              props.placeResult.photos.map((p, i) => (
              <Carousel.Item key={'carousel' + i.toString()}>
                <div className='d-flex justify-content-center align-items-center' style={{'maxHeight' : '300px'}}>
                  <img src={p.getUrl()} alt='' className='img-fluid'/>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        }

        <Container>
          <Row>
            <Col>
              <LocationOnOutlinedIcon/>
            </Col>
            <Col xs={10} sm={10} className='d-flex justify-content-start'>
              { props.placeResult.vicinity }
            </Col>
          </Row>
          <Row>
            <Col>
              <AccessAlarmRoundedIcon/>
            </Col>
            <Col xs={10} sm={10} className='d-flex flex-column'>
              { drawOpening() }
            </Col>
          </Row>
          <Row>
            <Col>
              <LanguageRoundedIcon/>
            </Col>
            <Col xs={10} sm={10} className='d-flex flex-column'>
              {
                props.placeResult.website
                  ? <a href={props.placeResult.website} target="_blank" rel="noopener noreferrer">{props.placeResult.website}</a>
                  : 'N/A'
              }
            </Col>
          </Row>
        </Container>
      </div>
    )
  }

  const drawStarRating = (rating: number): JSX.Element[] => {
    // 별점을 정수부와 소수부로 나누기
    const integerPart = Math.floor(rating);
    const decimalPart = rating - integerPart;
    const stars: JSX.Element[] = [];

    for(let i = 0 ; i < integerPart ; i++){
      stars.push(<StarRoundedIcon/>)
    }
    if(decimalPart >= 0.5){
      stars.push(<StarHalfRoundedIcon/>)
    }

    return stars;
  }

  const drawOpening = () => {
    if(!props.placeResult.opening_hours || !(props.placeResult.opening_hours.periods instanceof Array))
      return <span>N/A</span>;

    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const offset = props.placeResult.utc_offset_minutes / 60;
    const sign = offset >= 0 ? '+' : '-';
    const utcStr = `UTC ${sign}${Math.abs(offset).toString().padStart(2, '0')}:00`;
    const results = [];

    if(props.placeResult.opening_hours.periods.length === 7){
      for (let i = 0; i < 7; i++) {
        let t1 = props.placeResult.opening_hours.periods[i];
        
        results.push({
          day : t1.open.day,
          res : `${t1.open.time.slice(0, 2)}:${t1.open.time.slice(2)} ~ ${t1.close.time.slice(0, 2)}:${t1.close.time.slice(2)} (${utcStr})`          
        });
      }
    }
    else if(props.placeResult.opening_hours.periods.length === 14){
      for (let i = 0; i < 14; i += 2) {
        let t1 = props.placeResult.opening_hours.periods[i];
        let t2 = props.placeResult.opening_hours.periods[i + 1];

        let res = `${t1.open.time.slice(0, 2)}:${t1.open.time.slice(2)} ~ ${t1.close.time.slice(0, 2)}:${t1.close.time.slice(2)}`
        res += ' / ';
        res += `${t2.open.time.slice(0, 2)}:${t2.open.time.slice(2)} ~ ${t2.close.time.slice(0, 2)}:${t2.close.time.slice(2)} (${utcStr})`;
        results.push({
          day : t1.open.day,
          res : res
        });
      }
    }

    return(
      <Container>
        <Row>{ props.placeResult.opening_hours.isOpen ? '영업 중' : '영업 종료' }</Row>
        {
          results.map(r => (
            <Row className='items-align-center'>
              <Col className='p-1'>
                { days[r.day] }
              </Col>
              <Col xs={10} sm={10} className='d-flex justify-content-start' style={{fontSize : '14px'}}>
                { r.res }
              </Col>
            </Row>
          ))
        }
      </Container>
    )
  }

  const getTripAdvisorInfo = () => {
    const getInfo = httpsCallable(functions, 'get_trip_advisor_info');
    getInfo({
      searchQuery: props.placeResult.name,
      lat: props.placeResult.geometry.location.lat(),
      lng: props.placeResult.geometry.location.lng()
    })
    .then(res => console.log(res))
    .catch(err => console.error(err))
  }
  //#endregion

  //#region [conditional rendering: register]
  const renderRegister = () => {
    return (
      <table className='w-100'>
        <thead>
          <th>name</th>
          <th>start</th>
          <th>end</th>
          <th>register</th>
        </thead>
        <tbody>
        {
          travelListRedux.map((t, i) => (
            <tr key={'travel' + i.toString()}>
              <td className='text-align-left'>{t.name}</td>
              <td>{t.startDate ? GetyyyyMMdd(t.startDate) : ''}</td>
              <td>{t.endDate ? GetyyyyMMdd(t.endDate) : ''}</td>
              <td>
                <Dropdown>
                  <Dropdown.Toggle variant="success" id="dropdown-basic">
                    register
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                  {
                    props.placeResult.types.map(type => (
                      <Dropdown.Item onClick={() => {saveCurrentPlace(t, type)}}>{type}</Dropdown.Item>
                    ))
                  }
                  </Dropdown.Menu>
                </Dropdown>
              </td>
            </tr>
          ))
        }
        </tbody>
      </table>
    )
  }

  const saveCurrentPlace = (travel: TravelSerialized, type: string) => {
    let place = {
      place_id : props.placeResult.place_id,
      name : props.placeResult.name,
      day: 0,
      latLng : {
        lat: props.placeResult.geometry.location.lat(),
        lng: props.placeResult.geometry.location.lng()
      },
      type: type,
      utc_offset_minutes: props.placeResult.utc_offset_minutes
    } as Place;
    dispatch(createPlace({ travelId: travel.id, place: place }));
  }
  //#endregion
  
  return (
    <Card className='custom-card card-right'>
      <Card.Header className='d-flex flex-row justify-content-between align-items-center'>
        <h4 className='m-0'>{ props.placeResult?.name }</h4>
        <CloseRoundedIcon onClick={() => {props.onClose()}}/>
      </Card.Header>

      <Card.Body className='overflow-auto'>        
        <Navbar className='p-0'>
          <Container className="p-0">
            <Nav className="justify-content-around" activeKey="/summary" variant="underline"
                onSelect={(key: 'summary' | 'review' | 'register') => {setSelectedTab(key)}}>
              <Nav.Item>
                <Nav.Link eventKey="summary" onSelect={() => setSelectedTab('summary')}>Summary</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="review" onSelect={() => setSelectedTab('review')}>Review</Nav.Link>
              </Nav.Item>
              {
                userData &&                
                <Nav.Item>
                  <Nav.Link eventKey="register" onSelect={() => setSelectedTab('register')}>Register</Nav.Link>
                </Nav.Item>                
              }
            </Nav>
          </Container>
        </Navbar>
        { renderContent() }
      </Card.Body>
    </Card>
  );
}

export default PlaceInfoPanel;