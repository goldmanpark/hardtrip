/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { Card, Carousel, Navbar, Nav, Container, Row, Col, Dropdown } from 'react-bootstrap';
import Travel from '../DataType/Travel';
import Place from '../DataType/Place';
import { addPlace2Travel } from '../redux/travelListSlice';

import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccessAlarmRoundedIcon from '@mui/icons-material/AccessAlarmRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarHalfRoundedIcon from '@mui/icons-material/StarHalfRounded';
import TurnedInNotRoundedIcon from '@mui/icons-material/TurnedInNotRounded';
import TurnedInRoundedIcon from '@mui/icons-material/TurnedInRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';

interface PlaceInfoPanelProps{
  placeInfo: google.maps.places.PlaceResult
  exit: () => void;
}

//https://developers.google.com/maps/documentation/javascript/reference/places-service?hl=ko#PlaceResult
const PlaceInfoPanel = (props: PlaceInfoPanelProps) => {
  const dispatch = useAppDispatch();
  const travelList: Travel[] = useAppSelector((state) => state.travelList);
  const [selectedTab, setSelectedTab] = useState<'summary' | 'review' | 'info'>('summary');

  const renderContent = () => {
    switch (selectedTab) {
      case 'summary':
        return renderSummary();
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
              props.placeInfo.photos.map(p => (
              <Carousel.Item>
                <div className='d-flex justify-content-center align-items-center' style={{'maxHeight' : '400px'}}>
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

  const saveCurrentPlace = (travel: Travel) => {
    let place = new Place(props.placeInfo);
    travel.places.set(travel.doc_id, place);
    dispatch(addPlace2Travel({
      travel_doc_id : travel.doc_id,
      place: place
    }));
  }

  return (
    <Card className="custom-card">
      <Card.Header>
        { props.placeInfo.name }
        <Navbar className='p-0'>
          <Container>
            <Nav className="justify-content-around" activeKey="/summary" variant="underline">
              <Nav.Item>
                <Nav.Link eventKey="summary" onSelect={() => setSelectedTab('summary')}>Summary</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="review" onSelect={() => setSelectedTab('review')}>Review</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="info" onSelect={() => setSelectedTab('info')}>Info</Nav.Link>
              </Nav.Item>
            </Nav>
            
            <Dropdown>
              <Dropdown.Toggle id="dropdown-basic">
                <TurnedInNotRoundedIcon />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {
                  travelList.map(t => (
                    <Dropdown.Item onClick={() => {saveCurrentPlace(t)}}>
                      {t.name}
                    </Dropdown.Item>
                  ))
                }
              </Dropdown.Menu>
            </Dropdown>
            <CloseRoundedIcon onClick={props.exit}/>
          </Container>
        </Navbar>
      </Card.Header>

      <Card.Body className='overflow-auto'>
        {renderContent()}
      </Card.Body>
    </Card>
  );
}

export default PlaceInfoPanel;