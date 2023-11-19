/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { Card, Table } from 'react-bootstrap';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { Travel, TravelSerialized, deSerializeTravel, serializeTravel } from '../DataType/Travel';
import { Place } from '../DataType/Place';
import { updatePlaceList, deletePlaceList, setSelectedIdx } from '../redux/travelListSlice';
import { CompareDate, GetDaysDiff } from './CommonFunctions';
import GetPlaceIcon from '../DataType/GetPlaceIcon';
import DatePicker from 'react-datepicker';
import DeleteIcon from '@mui/icons-material/Delete';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import CheckIcon from '@mui/icons-material/Check';
import RouteIcon from '@mui/icons-material/Route';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface TravelInfoProps{
  exit: () => void;
  setDirections: React.Dispatch<React.SetStateAction<google.maps.DirectionsResult[]>>;
  setPlaceId: React.Dispatch<React.SetStateAction<string>>;
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
    return () => {
      //props해제
      props.setDirections([]);
      props.setPlaceId('')
    }
  }, []);

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
        const days = GetDaysDiff(endDate, startDate) + 1;
        
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
      
      const temp = selectedTravel.places.map(x => ({...x, isDel: false, isEdit: false} as PlaceEdit))
      temp.sort((x, y) => CompareDate(x.startDTTM, y.startDTTM));
      temp.forEach(x => {
        tempPlaceList[x.day].push(x);
      });

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

  const createRoute = async (day: number) => {
    const target = orderedPlaceArray.filter(x => x.day === day);
    const routeList = [];
    for(let i = 0 ; i < target.length - 1 ; i++){
      let req = {
        origin: { placeId: target[i].place_id } as google.maps.Place,
        destination: { placeId: target[i + 1].place_id } as google.maps.Place,
        travelMode: google.maps.TravelMode.TRANSIT
      } as google.maps.DirectionsRequest;
      const route = await findRoute(req);
      if(route){
        routeList.push(route);
      }
    }
    props.setDirections(routeList);
  }

  const findRoute = async (req: google.maps.DirectionsRequest) => {
    let routeResult: google.maps.DirectionsResult | null;
    await directionsService.route(req, async (result, status) => {
      if(status === google.maps.DirectionsStatus.OK){
        //console.log(result);
        const distance = result.routes[0].legs[0].distance.value;

        if(distance <= 1.5 && req.travelMode === google.maps.TravelMode.TRANSIT){
          //거리가 1.5km이하라면 걸어간다
          req.travelMode = google.maps.TravelMode.WALKING;
          routeResult = await findRoute(req);
        } else {
          routeResult =  result;
        }          
      } else {
        console.error(result);
        routeResult = null;
      }
    });
    return routeResult;
  }

  const removePlace = (place: PlaceEdit) => {
    const data = [...orderedPlaceMatrix];
    loop: for(let i = 0 ; i < data.length ; i++){
      for(let j = 0 ; j < data[i].length ; j++){
        if(data[i][j].id === place.id){
          data[i][j].isDel = true;
          break loop;
        }
      }
    }
    setOrderedPlaceMatrix(data);
  }

  const cancelRemove = (place: Place) => {
    const data = [...orderedPlaceMatrix];
    loop: for(let i = 0 ; i < data.length ; i++){
      for(let j = 0 ; j < data[i].length ; j++){
        if(data[i][j].id === place.id){
          data[i][j].isDel = false;
          break loop;
        }
      }
    }
    setOrderedPlaceMatrix(data);
  }

  const updateStartDTTM = (placeId: string, newDate: Date, travelDay?: Date) => {
    if(!travelDay) return;

    const data = [...orderedPlaceMatrix];
    let rowIdx = 0;
    loop: for(let i = 0 ; i < data.length ; i++){
      for(let j = 0 ; j < data[i].length ; j++){
        if(data[i][j].id === placeId){
          data[i][j].isEdit = true;
          data[i][j].startDTTM = new Date(travelDay.getFullYear(), travelDay.getMonth(), travelDay.getDate(), newDate.getHours(), newDate.getMinutes())
          rowIdx = i;
          break loop;
        }
      }
    }
    data[rowIdx] = data[rowIdx].sort((x, y) => CompareDate(x.startDTTM, y.startDTTM));
    setOrderedPlaceMatrix(data);
  }

  const updateEndDTTM = (placeId: string, newDate: Date, travelDay?: Date) => {
    if(!travelDay) return;

    const data = [...orderedPlaceMatrix];
    loop: for(let i = 0 ; i < data.length ; i++){
      for(let j = 0 ; j < data[i].length ; j++){
        if(data[i][j].id === placeId){
          data[i][j].isEdit = true;
          data[i][j].endDTTM = new Date(travelDay.getFullYear(), travelDay.getMonth(), travelDay.getDate(), newDate.getHours(), newDate.getMinutes())
          break loop;
        }
      }
    }
    setOrderedPlaceMatrix(data);
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
        <div ref={p.innerRef} {...p.droppableProps} style={{background: 'lightgrey'}}>
          { p.placeholder }
          <div className='d-flex flex-row justify-content-between'>
            {
              t.day
              ? <div className='text-align-left'>{`DAY-${t.day} ${(t.date as Date).toLocaleDateString()}`}</div>
              : <div className='text-align-left'>N/A</div>
            }
            <RouteIcon onClick={() => createRoute(i)}/>
          </div>          
          <Table>
            <colgroup>
              <col width='5%'/>
              <col width='40%'/>
              <col width='10%'/>
              <col width='10%'/>
              <col width='5%'/>
            </colgroup>
            <tbody>
            { places.map((x, j) => drawDraggable(j, x, i)) }
            </tbody>
          </Table>
        </div>
      }      
      </Droppable>
    )
  }

  const HideCalendar = ({ className, children }) => {
    return (
      <div/>
    )
  }

  const drawDraggable = (i: number, place: PlaceEdit, day: number) => {
    const travelDate: Date | undefined = typeof(travelDays[day].date) !== 'string' ? travelDays[day].date as Date : undefined;
    return (
      <Draggable key={place.id} draggableId={place.id} index={i}>
      {(p2: any) => (
        <tr ref={p2.innerRef} {...p2.draggableProps} {...p2.dragHandleProps}>
          <td className='p-1' style={{textDecoration: place.isDel ? 'line-through' : ''}}>
            {GetPlaceIcon(place)}
          </td>
          <td className='text-align-left p-1' style={{textDecoration: place.isDel ? 'line-through' : ''}}
              onClick={() => {props.setPlaceId(place.place_id)}}>
            {place.name}
            {p2.placeholder}
          </td>
          <td className='p-1'>
            <DatePicker className='w-100 text-align-center'
                        showTimeSelect
                        dateFormat="HH:mm"
                        timeFormat="HH:mm"
                        calendarContainer={HideCalendar}
                        selected={place.startDTTM ? place.startDTTM : travelDate}
                        onChange={(date) => {updateStartDTTM(place.id, date, travelDate)}}/>
          </td>
          <td className='p-1'>
            <DatePicker className='w-100 text-align-center'
                        showTimeSelect
                        dateFormat="HH:mm"
                        timeFormat="HH:mm"
                        calendarContainer={HideCalendar}
                        selected={place.endDTTM ? place.endDTTM : travelDate}
                        onChange={(date) => {updateEndDTTM(place.id, date, travelDate)}}/>
          </td>
          <td className='p-1'>
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