/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';
import { Card } from 'react-bootstrap';

interface PlaceInfoPanelProps{
  placeInfo: google.maps.places.PlaceResult
}

const renderStarRating = (rating: number) => {
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

//https://developers.google.com/maps/documentation/javascript/reference/places-service?hl=ko#PlaceResult  
const PlaceInfoPanel = (props: PlaceInfoPanelProps) => {
  return (
    <Card className="custom-card">
      <Card.Header>
      {props.placeInfo.name}
      </Card.Header>
      <Card.Body>
        <span className='d-flex flex-row gap-2'>
          <span>{props.placeInfo.rating}</span>
          <span>{renderStarRating(props.placeInfo.rating)}</span>
          <span>{`(${props.placeInfo.user_ratings_total})`}</span>
        </span>
        
        <span>{`${props.placeInfo.types.join(', ')}`}</span>
      </Card.Body>
    </Card>
  );
}

export default PlaceInfoPanel;