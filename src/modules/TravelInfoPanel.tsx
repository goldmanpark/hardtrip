/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { Card, Table } from 'react-bootstrap';
import { ITravel, Travel } from '../DataType/Travel';
import { IPlace, Place } from '../DataType/Place';
import { deletePlace } from '../redux/travelListSlice';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface PROPS{
  travel: Travel;
  exit: () => void;
}

const TravelInfoPanel = (props : PROPS) => {
  const dispatch = useAppDispatch();

  const removePlace = (place: IPlace) => {
    dispatch(deletePlace({
      travelId: props.travel.id,
      place: place
    }))
  }

  return(
    <Card className="custom-card">
      <Card.Header>
        <div className='d-flex flex-row justify-content-between'>
          <span>{ props.travel.name }</span>
          <CloseRoundedIcon onClick={props.exit}/>
        </div>
      </Card.Header>
      <Card.Body className='overflow-auto'>
        {
          props.travel.places instanceof Array &&
          <Table>
            <thead>
              <tr>
                <th>place</th>
                <th>order</th>
                <th>edit</th>
              </tr>
            </thead>
            <tbody>
              {
                props.travel.places.map((x, i) => (
                  <tr key={'place' + i}>
                    <td>{x.name}</td>
                    <td>{x.order}</td>
                    <td>
                      <EditIcon onClick={() => {}}/>
                      <DeleteIcon onClick={() => {removePlace(x)}}/>
                    </td>
                  </tr>
                ))
              }
            </tbody>            
          </Table>
        }
      </Card.Body>
    </Card>
  )
}

export default TravelInfoPanel;