/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react';
import { Card, Form } from 'react-bootstrap';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Place } from '../DataType/Place';

interface RouteEditPanelProps{
  from: Place;
  to: Place;
  onClose?: () => void;
}

const RouteEditPanel = (props: RouteEditPanelProps) => {
  return(
    <Card className='custom-card card-right'>
       <Card.Header className='d-flex flex-row justify-content-between align-items-center'>
        <h4 className='m-0'>Edit Route</h4>
        <CloseRoundedIcon onClick={() => {props.onClose()}}/>
      </Card.Header>

      <Card.Body className='overflow-auto'>

      </Card.Body>
    </Card>
  )
}

export default RouteEditPanel;