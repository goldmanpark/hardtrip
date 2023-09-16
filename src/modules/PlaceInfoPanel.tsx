/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';


import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccessAlarmRoundedIcon from '@mui/icons-material/AccessAlarmRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarHalfRoundedIcon from '@mui/icons-material/StarHalfRounded';
import TurnedInNotRoundedIcon from '@mui/icons-material/TurnedInNotRounded';
import TurnedInRoundedIcon from '@mui/icons-material/TurnedInRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Card, Carousel, Navbar, Nav, Container, Row, Col } from 'react-bootstrap';

interface PlaceInfoPanelProps{
  placeInfo: google.maps.places.PlaceResult
  exit: () => void;
}

//https://developers.google.com/maps/documentation/javascript/reference/places-service?hl=ko#PlaceResult  
const PlaceInfoPanel = (props: PlaceInfoPanelProps) => {
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
            <Col>
              <AccessAlarmRoundedIcon/>
            </Col>
            <Col xs={10} sm={10} className='d-flex justify-content-start'>
              
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
            <TurnedInNotRoundedIcon/>
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