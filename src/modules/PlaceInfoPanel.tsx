/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar as solidStar, faXmark, faPlus } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';
import { Card, Carousel, Navbar, Nav, Container } from 'react-bootstrap';

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
                <div className='d-flex justify-content-center align-items-center'>
                  <img src={p.getUrl()} alt='' className='mw-100 h-auto' style={{'maxHeight' : '400px'}}/>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        }
      </div>
    )
  }

  const drawStarRating = (rating: number): JSX.Element[] => {
    // 별점을 정수부와 소수부로 나누기
    const integerPart = Math.floor(rating);
    const decimalPart = rating - integerPart;
    const stars: JSX.Element[] = [];
  
    for(let i = 0 ; i < integerPart ; i++){
      stars.push(<FontAwesomeIcon icon={solidStar} style={{color: "#c4db14",}} />)
    }
    if(decimalPart >= 0.5){
      stars.push(<FontAwesomeIcon icon={regularStar} style={{color: "#c4db14",}} />)
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
            <FontAwesomeIcon icon={faPlus} />
            <FontAwesomeIcon icon={faXmark} onClick={props.exit}/>
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