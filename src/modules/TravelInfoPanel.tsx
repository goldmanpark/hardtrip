/* eslint-disable react-hooks/exhaustive-deps */
///https://codesandbox.io/s/-w5szl?file=/src/index.js
import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { Card, Table } from 'react-bootstrap';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { Travel, TravelSerialized, deSerializeTravel, serializeTravel } from '../DataType/Travel';
import { Place } from '../DataType/Place';
import { updatePlaceList, deletePlaceList, setSelectedIdx } from '../redux/travelListSlice';
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
  day: number;
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
  const [orderedPlaceArray, setOrderedPlaceArray] = useState<PlaceEdit[]>([]);
  const [orderedPlaceMatrix, setOrderedPlaceMatrix] = useState<PlaceEdit[][]>([[]]);

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
      const tempTravelDays = [];
      const tempPlaceList = [[]];

      if(startDate instanceof Date && endDate instanceof Date){
        const days = getDaysDiff(endDate, startDate) + 1;
        
        for(let i = 0 ; i < days ; i++){
          const newDate = new Date(startDate);
          newDate.setDate(newDate.getDate() + (i * 1));
          tempTravelDays.push({
            day: i + 1,
            date: newDate
          } as TravelDay);
          tempPlaceList.push([]);
        }
      }
      tempTravelDays.unshift({ date: 'N/A', day: 0 } as TravelDay);
      setTravelDays(tempTravelDays);
      
      const temp = selectedTravel.places.map(x => ({...x, isDel: false, isEdit: false} as PlaceEdit));
      temp.forEach(x => {
        tempPlaceList[x.day].push(x);
      });
      //.sort((x, y) => getDaysDiff(x.startDTTM, y.startDTTM));
      setOrderedPlaceMatrix(tempPlaceList);
    } else {
      setTravelDays([{ date: 'N/A', day: 0 } as TravelDay]);
      setOrderedPlaceMatrix([[]]);
    }
  }, [selectedTravel]);

  useEffect(() => {
    setOrderedPlaceArray(orderedPlaceMatrix.reduce((acc, cur) => acc.concat(cur), []));
  }, [orderedPlaceMatrix]);

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
    const { source, destination } = result;
    if(!destination) return;

    const reorderedData = [...orderedPlaceMatrix];
    const [removed] = reorderedData[source.droppableId].splice(source.index, 1);
    const sourceDropID = parseInt(source.droppableId);
    const destDropID = parseInt(destination.droppableId);

    if(sourceDropID === destDropID){      
      reorderedData[sourceDropID].splice(destination.index, 0, removed);
      setOrderedPlaceMatrix(reorderedData);
    } else {      
      removed.day = destDropID;
      removed.isEdit = true;
      reorderedData[destDropID].splice(destination.index, 0, removed);
      setOrderedPlaceMatrix(reorderedData);
    }    
  }

  const createRoute = async () => {
    for(let i = 0 ; i < orderedPlaceArray.length - 1 ; i++){
      let req = {
        origin: { placeId: orderedPlaceArray[i].place_id } as google.maps.Place,
        destination: { placeId: orderedPlaceArray[i + 1].place_id } as google.maps.Place,
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
    const data = [...orderedPlaceArray];
    const i = data.findIndex(x => x.id === place.id);
    data[i].isDel = true;
    setOrderedPlaceArray(data);
  }

  const cancelRemove = (place: Place) => {
    const data = [...orderedPlaceArray];
    const i = data.findIndex(x => x.id === place.id);
    data[i].isDel = false;
    setOrderedPlaceArray(data);
  }

  const confirmEdit = () => {
    if(orderedPlaceArray.find(x => x.isDel)){
      dispatch(deletePlaceList({travelId: selectedTravel.id, placeList: orderedPlaceArray.filter(x => x.isDel)}));
    }
    if(orderedPlaceArray.find(x => x.isEdit)){
      dispatch(updatePlaceList({travelId: selectedTravel.id, placeList: orderedPlaceArray.filter(x => x.isEdit)}));
    }    
  }

  const closeTravel = () => {
    dispatch(setSelectedIdx(-1));
    props.exit();
  }
  //#endregion

  //#region [conditional render]
  const drawDroppable = (i: number, places: PlaceEdit[]) => {
    const t = travelDays[i];
    return(
      <Droppable key={i} droppableId={i.toString()}>
      {
        (p) => 
        <div ref={p.innerRef} {...p.droppableProps}>
          { p.placeholder }
          {
            t.day
            ? <div className='text-align-left'>{`DAY-${t.day} ${(t.date as Date).toLocaleDateString()}`}</div>
            : <div className='text-align-left'>N/A</div>
          }
          <Table>
            <tbody>
            { places.map((x, i) => drawDraggable(i, x)) }
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
              orderedPlaceArray.find(x => x.isDel || x.isEdit) && <CheckIcon onClick={confirmEdit}/>
            }
            <CloseRoundedIcon onClick={closeTravel}/>
          </span>
        </div>
      </Card.Header>
      <Card.Body className='overflow-auto'>
        <DragDropContext onDragEnd={onDragEnd}>
        {
          orderedPlaceMatrix.length === travelDays.length && //안전장치
          orderedPlaceMatrix.map((x, i) => drawDroppable(i, x))
        }
        </DragDropContext>
      </Card.Body>
    </Card>
  )
}

export default TravelInfoPanel;