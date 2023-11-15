/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { Card, Carousel, Navbar, Nav, Container, Row, Col, Button } from 'react-bootstrap';
import { TravelSerialized } from '../DataType/Travel';
import { Place } from '../DataType/Place';
import { createPlace } from '../redux/travelListSlice';

import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccessAlarmRoundedIcon from '@mui/icons-material/AccessAlarmRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarHalfRoundedIcon from '@mui/icons-material/StarHalfRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';

interface PlaceInfoPanelProps{
  placeInfo: google.maps.places.PlaceResult
  onClose?: () => void;
}

//https://developers.google.com/maps/documentation/javascript/reference/places-service?hl=ko#PlaceResult
const PlaceInfoPopup = (props: PlaceInfoPanelProps) => {
  const dispatch = useAppDispatch();
  const { userData } = useAuth();
  const travelListRedux: TravelSerialized[] = useAppSelector((state) => state.travelList.list);
  const [selectedTab, setSelectedTab] = useState<'summary' | 'review' | 'register'>('summary');

  //#region [conditional rendering]
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

  const renderSummary = () => {
    return (
      <div className='d-flex flex-column gap-2'>
        <span className='d-flex flex-row gap-2'>
          <span>{props.placeInfo.rating}</span>
          <span>{drawStarRating(props.placeInfo.rating)}</span>
          <span>{`(${props.placeInfo.user_ratings_total})`}</span>
        </span>

        {/* <span>{`${props.placeInfo.types.join(', ')}`}</span> */}

        {
          props.placeInfo.photos && props.placeInfo.photos.length > 0 &&
          <Carousel>
            {
              props.placeInfo.photos.map((p, i) => (
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
              { props.placeInfo.vicinity }
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
                props.placeInfo.website
                  ? <a href={props.placeInfo.website}>{props.placeInfo.website}</a>
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
    if(!props.placeInfo.opening_hours || !(props.placeInfo.opening_hours.periods instanceof Array))
      return <span>N/A</span>;

    const days = ['일', '월', '화', '수', '목', '금', '토'];
    let today = new Date();
    let results = [];

    if(props.placeInfo.opening_hours.periods.length === 7){
      for (let i = 0; i < 7; i++) {
        let t1 = props.placeInfo.opening_hours.periods[i];
        results.push({
          day : t1.open.day,
          res : t1.open.time.slice(0, 2) + ':' + t1.open.time.slice(2) + ' ~ ' + t1.close.time.slice(0, 2) + ':' + t1.close.time.slice(2)
        });
      }
    }
    else if(props.placeInfo.opening_hours.periods.length === 14){
      for (let i = 0; i < 14; i += 2) {
        let t1 = props.placeInfo.opening_hours.periods[i];
        let t2 = props.placeInfo.opening_hours.periods[i + 1];

        let res = t1.open.time.slice(0, 2) + ':' + t1.open.time.slice(2) + ' ~ ' + t1.close.time.slice(0, 2) + ':' + t1.close.time.slice(2);
        res += ' / ';
        res += t2.open.time.slice(0, 2) + ':' + t2.open.time.slice(2) + ' ~ ' + t2.close.time.slice(0, 2) + ':' + t2.close.time.slice(2);
        results.push({
          day : t1.open.day,
          res : res
        });
      }
    }

    return(
      <Container>
        <Row>{ props.placeInfo.opening_hours.isOpen ? '영업 중' : '영업 종료' }</Row>
      {
        results.map(r => (
          <Row className='items-align-center' style={{fontWeight : today.getDay() === r.day ? 'bold' : 'normal'}}>
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
              <td>{t.startDate ? drawDate(t.startDate) : ''}</td>
              <td>{t.endDate ? drawDate(t.endDate) : ''}</td>
              <td>
                <Button variant="secondary" onClick={() => {saveCurrentPlace(t)}}>
                  register
                </Button>
              </td>
            </tr>
          ))
        }
        </tbody>
      </table>
    )
  }

  const drawDate = (d: number) => {
    const date = new Date(d);
    const yyyy = date.getFullYear();
    const MM = date.getMonth();
    const dd = date.getDate();
    return `${yyyy}-${MM}-${dd}`;
  }
  //#endregion

  const saveCurrentPlace = (travel: TravelSerialized) => {
    let place = {
      place_id : props.placeInfo.place_id,
      name : props.placeInfo.name,
      day: 0,
      latLng : {
        lat: props.placeInfo.geometry.location.lat(),
        lng: props.placeInfo.geometry.location.lng()
      }      
    } as Place;
    dispatch(createPlace({ travelId: travel.id, place: place }));
  }

  return (
    <Card className='custom-modal'>
      <Card.Header className='d-flex flex-row justify-content-between align-items-center'>
        <h4 className='m-0'>{ props.placeInfo.name }</h4>
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

export default PlaceInfoPopup;