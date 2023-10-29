/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../redux/store';
import { Card, Table } from 'react-bootstrap';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { ITravel, Travel } from '../DataType/Travel';
import { IPlace, Place } from '../DataType/Place';
import { updatePlaceList, deletePlaceList } from '../redux/travelListSlice';
import { MarkerInfo } from './MapComponent';
import DeleteIcon from '@mui/icons-material/Delete';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import CheckIcon from '@mui/icons-material/Check';
import RouteIcon from '@mui/icons-material/Route';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface TravelInfoProps{
  travel: ITravel;
  exit: () => void;
  setDirections: React.Dispatch<React.SetStateAction<google.maps.DirectionsResult[]>>;
}

interface PlaceAug extends IPlace{
  isDel: boolean;
}

const TravelInfoPanel = (props : TravelInfoProps) => {
  const dispatch = useAppDispatch();
  const directionsService = new google.maps.DirectionsService();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [orderedPlaces, setOrderedPlaces] = useState<PlaceAug[]>([]);

  useEffect(() => {
    if(props.travel && props.travel.places instanceof Array){
      let temp = [...props.travel.places].sort((x, y) => x.order - y.order);
      setOrderedPlaces(temp.map(x => ({...x, isEdit: false, isDel: false})));
    }
  }, [props.travel]);

  //#region [Event Handler]
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedData = [...orderedPlaces];
    const [removed] = reorderedData.splice(result.source.index, 1);
    reorderedData.splice(result.destination.index, 0, removed);
    setOrderedPlaces(reorderedData.map((x, i) => ({...x, order: x.order === 999 ? 999 : i + 1})));
    setIsEdit(true);
  };

  const createRoute = async () => {
    for(let i = 0 ; i < orderedPlaces.length - 1 ; i++){
      let req = {
        origin: { placeId: orderedPlaces[i].place_id } as google.maps.Place,
        destination: { placeId: orderedPlaces[i + 1].place_id } as google.maps.Place,
        travelMode: google.maps.TravelMode.TRANSIT
      } as google.maps.DirectionsRequest;

      directionsService.route(req, (result, status) => {
        if(status === google.maps.DirectionsStatus.OK){
          console.log(result);
          props.setDirections(prev => [...prev, result]);
        } else {
          console.error(result);
        }
      });
    }
  }

  const removePlace = (place: IPlace) => {
    const data = orderedPlaces.map(x => x.id === place.id ? {...x, isDel: true, order: 999} : x).sort((x, y) => x.order - y.order);
    data.forEach((x, i) => {
      if(x.order !== 999) x.order = i + 1;
    });
    setOrderedPlaces(data);
    setIsEdit(true);
  }

  const cancelRemove = (place: IPlace) => {
    const newOrder = orderedPlaces.filter(x => !x.isDel).length + 1;
    const data = orderedPlaces.map(x => x.id === place.id ? {...x, isDel: false, order: newOrder} : x);
    setOrderedPlaces(data.sort(x => x.order));
  }

  const confirmEdit = () => {
    dispatch(deletePlaceList({travelId: props.travel.id, placeList: orderedPlaces.filter(x => x.isDel)}));
    dispatch(updatePlaceList({travelId: props.travel.id, placeList: orderedPlaces.filter(x => !x.isDel)}));
  }
  //#endregion

  return(
    <Card className="custom-card">
      <Card.Header>
        <div className='d-flex flex-row justify-content-between'>
          <span>{ props.travel.name }</span>
          <span>
            <RouteIcon onClick={createRoute}/>
            {
              isEdit && <CheckIcon onClick={confirmEdit}/>
            }
            <CloseRoundedIcon onClick={props.exit}/>
          </span>          
        </div>
      </Card.Header>
      <Card.Body className='overflow-auto'>
        <Table>
          <thead>
            <tr>
              <th>place</th>
              <th>order</th>
              <th></th>
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
                            <td className='text-align-left' style={{textDecoration: x.isDel ? 'line-through' : ''}}>
                              {x.name}
                            </td>
                            <td>{x.order}</td>
                            <td>
                              {
                                x.isDel
                                  ? <DoDisturbIcon onClick={() => {cancelRemove(x)}}/>
                                  : <DeleteIcon onClick={() => {removePlace(x)}}/>
                              }                              
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