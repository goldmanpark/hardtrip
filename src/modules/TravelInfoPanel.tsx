/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../redux/store';
import { Card, Table } from 'react-bootstrap';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { Travel } from '../DataType/Travel';
import { Place } from '../DataType/Place';
import { updatePlaceList, deletePlaceList } from '../redux/travelListSlice';
import DeleteIcon from '@mui/icons-material/Delete';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import CheckIcon from '@mui/icons-material/Check';
import RouteIcon from '@mui/icons-material/Route';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface TravelInfoProps{
  travel: Travel;
  exit: () => void;
  setDirections: React.Dispatch<React.SetStateAction<google.maps.DirectionsResult[]>>;
}

interface TravelDay{
  day?: number;
  date: Date | string;
}

const TravelInfoPanel = (props : TravelInfoProps) => {
  const dispatch = useAppDispatch();
  const directionsService = new google.maps.DirectionsService();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [travelDays, setTravelDays] = useState<TravelDay[]>([]);
  const [orderedPlaces, setOrderedPlaces] = useState<Place[]>([]);

  useEffect(() => {
    if(props.travel && props.travel.places instanceof Array){
      //1. travelDays생성
      const startDate = props.travel.startDate;
      const endDate = props.travel.endDate;
      const days = getDaysDiff(endDate, startDate);

      const list = [];
      for(let i = 0 ; i < days ; i++){
        const newDate = new Date(startDate);
        newDate.setDate(newDate.getDate() + (i * 1));
        list.push({
          day: i + 1,
          date: newDate
        } as TravelDay);
      }
      list.unshift({ date: 'N/A' } as TravelDay);
      setTravelDays(list);

      let temp = [...props.travel.places].sort((x, y) => getDaysDiff(x.startDTTM, y.startDTTM));
      setOrderedPlaces(temp);
    }
  }, [props.travel]);

  //#region [Event Handler]
  const getDaysDiff = (d1: Date, d2: Date) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const diff = d1.getTime() - d2.getTime();
    return Math.round(diff / oneDay);
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedData = [...orderedPlaces];
    if(result.source.droppableId === result.destination.droppableId){
      const [removed] = reorderedData.splice(result.source.index, 1);
      reorderedData.splice(result.destination.index, 0, removed);
      setOrderedPlaces(reorderedData);
      setIsEdit(true);
    } else {
      reorderedData[result.source.index].day = parseInt(result.destination.droppableId);
      setOrderedPlaces(reorderedData);
      setIsEdit(true);
    }
    
  }

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

  const removePlace = (place: Place) => {
    const data = [...orderedPlaces];
    const i = data.findIndex(x => x.id === place.id);
    data[i].isDel = true;
    setOrderedPlaces(data);
    setIsEdit(true);
  }

  const cancelRemove = (place: Place) => {
    const data = [...orderedPlaces];
    const i = data.findIndex(x => x.id === place.id);
    data[i].isDel = false;
    setOrderedPlaces(data);
  }

  const confirmEdit = () => {
    dispatch(deletePlaceList({travelId: props.travel.id, placeList: orderedPlaces.filter(x => x.isDel)}));
    dispatch(updatePlaceList({travelId: props.travel.id, placeList: orderedPlaces.filter(x => !x.isDel)}));
  }
  //#endregion

  //#region [render element]
  const drawDroppable = (i: number, t: TravelDay) => {
    return(
      <Droppable key={i} droppableId={t.day ? t.day.toString() : ''}>
      {
        (p) => 
        <div ref={p.innerRef} {...p.droppableProps}>
          {
            t.day
            ? <div className='text-align-left'>{`DAY-${t.day} ${t.date.toLocaleString()}`}</div>
            : <span>N/A</span>
          }
          <Table>
            {
              t.day === undefined &&
              <thead>
                <tr>
                  <th>place</th>
                  <th></th>
                </tr>
              </thead>
            }
            <tbody>
            {
              orderedPlaces.filter(x => x.day === t.day).map((x, i) => drawDraggable(i, x))
            }
            </tbody>
          </Table>
        </div>
      }
      
      </Droppable>
    )
  }

  const drawDraggable = (i: number, place: Place) => {
    return (
      <Draggable key={place.id} draggableId={place.id} index={i}>
      {(p2) => (
        <tr ref={p2.innerRef} {...p2.draggableProps} {...p2.dragHandleProps}>
          <td className='text-align-left' style={{textDecoration: place.isDel ? 'line-through' : ''}}>
            {place.name}
          </td>
          <td>
            {
              place.isDel
                ? <DoDisturbIcon onClick={() => {cancelRemove(place)}}/>
                : <DeleteIcon onClick={() => {removePlace(place)}}/>
            }
          </td>
        </tr>
      )}
      </Draggable>
    )
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
        <DragDropContext onDragEnd={onDragEnd}>
        {
          travelDays.map((x, i) => drawDroppable(i, x))
        }
        </DragDropContext>
      </Card.Body>
    </Card>
  )
}

export default TravelInfoPanel;