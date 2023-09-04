/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';

export interface PlaceInfoPanelProps{
  //https://developers.google.com/maps/documentation/javascript/reference/places-service?hl=ko#PlaceResult  
  PlaceInfo: google.maps.places.PlaceResult
}

export const PlaceInfoPanel = (props: PlaceInfoPanelProps) => {
  return (
    <Card>
      <Card.Body>
        <Card.Title>{props.PlaceInfo.name}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{props.PlaceInfo.vicinity}</Card.Subtitle>
      </Card.Body>
    </Card>
  );
}