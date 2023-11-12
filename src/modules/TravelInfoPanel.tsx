/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { Card, Table } from 'react-bootstrap';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { Travel, TravelSerialized, deSerializeTravel, serializeTravel } from '../DataType/Travel';
import { Place } from '../DataType/Place';
import { updatePlaceList, deletePlaceList } from '../redux/travelListSlice';
import DeleteIcon from '@mui/icons-material/Delete';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import CheckIcon from '@mui/icons-material/Check';
import RouteIcon from '@mui/icons-material/Route';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface TravelInfoProps{
  exit: () => void;
  setDirections: React.Dispatch<React.SetStateAction<google.maps.DirectionsResult[]>>;
}

interface TravelDay{
  day?: number;
  date: Date | string;
}

interface PlaceEdit extends Place{
  isDel: boolean;
  isEdit: boolean;
}

const TravelInfoPanel = (props : TravelInfoProps) => {
  const dispatch = useAppDispatch();
  const travelListRedux: TravelSerialized[] = useAppSelector(state => state.travelList.list);
  const selectedIdxRedux = useAppSelector(state => state.travelList.selectedIdx);
  const directionsService = new google.maps.DirectionsService();

  const [selectedTravel, setSelectedTravel] = useState<Travel>(null);
  const [travelDays, setTravelDays] = useState<TravelDay[]>([]);
  const [orderedPlaces, setOrderedPlaces] = useState<PlaceEdit[]>([]);

  useEffect(() => {
    if(travelListRedux.length > 0 && selectedIdxRedux >= 0){
      setSelectedTravel(deSerializeTravel(travelListRedux[selectedIdxRedux]));      
    } else {
      setSelectedTravel(null);
    }
  }, [travelListRedux, selectedIdxRedux]);

  useEffect(() => {
    if(selectedTravel){
      //1. travelDays생성
      const startDate = selectedTravel.startDate;
      const endDate = selectedTravel.endDate;
      const list = [];

      if(startDate instanceof Date && endDate instanceof Date){
        const days = getDaysDiff(endDate, startDate) + 1;
        
        for(let i = 0 ; i < days ; i++){
          const newDate = new Date(startDate);
          newDate.setDate(newDate.getDate() + (i * 1));
          list.push({
            day: i + 1,
            date: newDate
          } as TravelDay);
        }
      }
      list.unshift({ date: 'N/A' } as TravelDay);
      setTravelDays(list);
      
      let temp = [...selectedTravel.places]
        .map(x => ({...x, isDel: false, isEdit: false} as PlaceEdit))
        .sort((x, y) => getDaysDiff(x.startDTTM, y.startDTTM));
      setOrderedPlaces(temp);
    } else {
      setTravelDays([{ date: 'N/A' } as TravelDay]);
      setOrderedPlaces([]);
    }
  }, [selectedTravel]);

  //#region [Event Handler]
  const getDaysDiff = (d1?: Date, d2?: Date) => {
    if(d1 instanceof Date && d2 instanceof Date){
      const oneDay = 24 * 60 * 60 * 1000;
      const diff = d1.getTime() - d2.getTime();
      return Math.round(diff / oneDay);
    } else {
      return 0;
    }    
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedData = [...orderedPlaces];
    if(result.source.droppableId === result.destination.droppableId){
      const [removed] = reorderedData.splice(result.source.index, 1);
      reorderedData.splice(result.destination.index, 0, removed);
      setOrderedPlaces(reorderedData);
    } else {
      reorderedData[result.source.index].day = parseInt(result.destination.droppableId);
      reorderedData[result.source.index].isEdit = true;
      setOrderedPlaces(reorderedData);
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

  const removePlace = (place: PlaceEdit) => {
    const data = [...orderedPlaces];
    const i = data.findIndex(x => x.id === place.id);
    data[i].isDel = true;
    setOrderedPlaces(data);
  }

  const cancelRemove = (place: Place) => {
    const data = [...orderedPlaces];
    const i = data.findIndex(x => x.id === place.id);
    data[i].isDel = false;
    setOrderedPlaces(data);
  }

  const confirmEdit = () => {
    if(orderedPlaces.find(x => x.isDel)){
      dispatch(deletePlaceList({travelId: selectedTravel.id, placeList: orderedPlaces.filter(x => x.isDel)}));
    }
    if(orderedPlaces.find(x => x.isEdit)){
      dispatch(updatePlaceList({travelId: selectedTravel.id, placeList: orderedPlaces.filter(x => x.isEdit)}));
    }    
  }
  //#endregion

  //#region [render element]
  const drawDroppable = (i: number, t: TravelDay) => {
    return(
      <Droppable key={i} droppableId={t.day ? t.day.toString() : '0'}>
      {
        (p) => 
        <div ref={p.innerRef} {...p.droppableProps}>
          {
            t.day
            ? <div className='text-align-left'>{`DAY-${t.day} ${(t.date as Date).toLocaleDateString()}`}</div>
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

  const drawDraggable = (i: number, place: PlaceEdit) => {
    return (
      <Draggable key={place.id} draggableId={place.id} index={i}>
      {(p2: any) => (
        <tr ref={p2.innerRef} {...p2.draggableProps} {...p2.dragHandleProps}>
          <td className='text-align-left' style={{textDecoration: place.isDel ? 'line-through' : ''}}>
            {place.name}
            {p2.placeholder}
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
          <span>{ selectedTravel?.name }</span>
          <span>
            <RouteIcon onClick={createRoute}/>
            {
              orderedPlaces.find(x => x.isDel || x.isEdit) && <CheckIcon onClick={confirmEdit}/>
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