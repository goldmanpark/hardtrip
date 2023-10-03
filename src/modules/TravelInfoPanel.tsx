/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../redux/store';
import { Card, Table } from 'react-bootstrap';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { ITravel, Travel } from '../DataType/Travel';
import { IPlace, Place } from '../DataType/Place';
import { deletePlace } from '../redux/travelListSlice';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface PROPS{
  travel: ITravel;
  exit: () => void;
}

const TravelInfoPanel = (props : PROPS) => {
  const dispatch = useAppDispatch();
  const [orderedPlaces, setOrderedPlaces] = useState<IPlace[]>([]);

  useEffect(() => {
    if(props.travel && props.travel.places instanceof Array){
      let temp = [...props.travel.places].sort((x, y) => x.order - y.order);
      setOrderedPlaces(temp)
    }
  }, [props.travel]);

  //#region [Event Handler]
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const reorderedData = Array.from(orderedPlaces);
    const [removed] = reorderedData.splice(result.source.index, 1);
    reorderedData.splice(result.destination.index, 0, removed);
    setOrderedPlaces(reorderedData.map((x, i) => ({...x, order: i + 1})));
  };

  const removePlace = (place: IPlace) => {
    dispatch(deletePlace({
      travelId: props.travel.id,
      place: place
    }))
  }
  //#endregion

  return(
    <Card className="custom-card">
      <Card.Header>
        <div className='d-flex flex-row justify-content-between'>
          <span>{ props.travel.name }</span>
          <CloseRoundedIcon onClick={props.exit}/>
        </div>
      </Card.Header>
      <Card.Body className='overflow-auto'>
        <Table>
          <thead>
            <tr>
              <th>place</th>
              <th>order</th>
              <th>edit</th>
            </tr>
          </thead>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="tbody" type="table">
                {(p1) => (
                  <tbody className='tbody' ref={p1.innerRef} {...p1.droppableProps}>
                  {
                    orderedPlaces.map((x, i) => (
                      <Draggable key={x.id} draggableId={x.id} index={i}>
                        {(p2) => (
                          <tr ref={p2.innerRef}
                              {...p2.draggableProps}
                              {...p2.dragHandleProps}>
                            <td className='text-align-left'>{x.name}</td>
                            <td>{x.order}</td>
                            <td>
                              <DeleteIcon onClick={() => {removePlace(x)}}/>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))
                  }
                  {p1.placeholder}
                  </tbody>
                )}
              </Droppable>
            </DragDropContext>

        </Table>
      </Card.Body>
    </Card>
  )
}

export default TravelInfoPanel;