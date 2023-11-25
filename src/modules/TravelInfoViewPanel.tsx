/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { Card, Table, Accordion } from 'react-bootstrap';
import AccordionContext from 'react-bootstrap/AccordionContext';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import { Travel, TravelSerialized, deSerializeTravel } from '../DataType/Travel';
import { Place } from '../DataType/Place';
import { setSelectedIdx } from '../redux/travelListSlice';
import { CompareDate, GetDaysDiff, GetHHmm } from './CommonFunctions';

import GetPlaceIcon from '../DataType/GetPlaceIcon';
import RouteIcon from '@mui/icons-material/Route';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PlaceIcon from '@mui/icons-material/Place';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';

interface TravelInfoProps{
  exit: () => void;
  //to MapComponent
  setPlaceId: React.Dispatch<React.SetStateAction<string>>;
  setMarkerPlaces: React.Dispatch<React.SetStateAction<Place[]>>
  setDirections: React.Dispatch<React.SetStateAction<google.maps.DirectionsResult[]>>;
  //panel전환
  setEditTravel: React.Dispatch<React.SetStateAction<boolean>>;
}

interface TravelDay{
  day: number;
  date: Date | string;
}

const TravelInfoViewPanel = (props : TravelInfoProps) => {
  const dispatch = useAppDispatch();
  const travelListRedux: TravelSerialized[] = useAppSelector(state => state.travelList.list);
  const selectedIdxRedux = useAppSelector(state => state.travelList.selectedIdx);
  const directionsService = new google.maps.DirectionsService();

  const [selectedTravel, setSelectedTravel] = useState<Travel>(null);
  const [travelDays, setTravelDays] = useState<TravelDay[]>([]);
  const [orderedPlaceArray, setOrderedPlaceArray] = useState<Place[]>([]);
  const [orderedPlaceMatrix, setOrderedPlaceMatrix] = useState<Place[][]>([[]]);

  //#region [useEffect]
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

      const temp = selectedTravel.places;
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
  //#endregion

  //#region [Functions]
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
  //#endregion

  //#region [Event Handler]
  const closeTravel = () => {
    dispatch(setSelectedIdx(-1));
    props.exit();
  }
  //#endregion

  //#region [Droppable Event Handler]
  const drawDailyMarkers = (day?: number) => {
    if(day){
      props.setMarkerPlaces(orderedPlaceMatrix[day]);
    } else {
      props.setMarkerPlaces(orderedPlaceArray);
    }
  }

  const drawDailyRoute = async (day: number) => {
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
  //#endregion

  //#region [Draggable Event Handler]
  const drawRoute = async (place: Place) => {
    let source: Place;
    loop: for(let i = 0 ; i < orderedPlaceMatrix.length ; i++){
      for(let j = 0 ; j < orderedPlaceMatrix[i].length ; j++){
        if(orderedPlaceMatrix[i][j].id === place.id){
          source = orderedPlaceMatrix[i][j - 1];
          break loop;
        }
      }
    }
    const req = {
      origin: { placeId: source.place_id } as google.maps.Place,
      destination: { placeId: place.place_id } as google.maps.Place,
      travelMode: google.maps.TravelMode.TRANSIT
    } as google.maps.DirectionsRequest;
    const route = await findRoute(req);
    props.setDirections([route]);
  }
  //#endregion

  //#region [conditional render]
  const AccordionButton = ({eventKey}) => {
    const { activeEventKey } = useContext(AccordionContext);
    const decoratedOnClick = useAccordionButton(eventKey);  
    
    if(activeEventKey){
      return (
        activeEventKey.includes(eventKey) 
          ? <KeyboardArrowUpIcon onClick={decoratedOnClick}/> 
          : <KeyboardArrowDownIcon onClick={decoratedOnClick}/>
      )
    } else {
      return (
        <KeyboardArrowDownIcon onClick={decoratedOnClick}/>
      )
    }    
  }

  const drawDay = (i: number, places: Place[]) => {
    const t = travelDays[i];
    return(
      <Card>
        <Card.Header className='p-1 w-100 d-flex flex-row justify-content-between'>
          {
            t.day
            ? <div className='text-align-left'>{`DAY-${t.day} ${(t.date as Date).toLocaleDateString()}`}</div>
            : <div className='text-align-left'>N/A</div>
          }
          <span>
            <PlaceIcon onClick={e => { drawDailyMarkers(i); }}/>
            <RouteIcon onClick={e => { drawDailyRoute(i); }}/>
            <AccordionButton eventKey={i.toString()}/>
          </span>
        </Card.Header>
        <Accordion.Collapse eventKey={i.toString()} className='p-0'>
          <Table>
            <colgroup>
              <col width='5%'/>
              <col width='40%'/>
              <col width='10%'/>
              <col width='10%'/>
              <col width='5%'/>
              <col width='5%'/>
            </colgroup>
            <tbody>
            { places.map((x, j) => drawPlace(j, x, i)) }
            </tbody>
          </Table>
        </Accordion.Collapse>
      </Card>
    )
  }

  const drawPlace = (i: number, place: Place, day: number) => {
    return (
      <tr>
        <td className='p-1'>
          {GetPlaceIcon(place)}
        </td>
        <td className='text-align-left p-1'
            onClick={() => {props.setPlaceId(place.place_id)}}>
          { place.name }
        </td>
        <td className='p-1'>
          { GetHHmm(place.startDTTM) }
        </td>
        <td className='p-1'>
          { GetHHmm(place.endDTTM) }
        </td>
        <td className='position-relative'>
        {
          i > 0 &&            
          <button className='RouteButton'>
            <RouteIcon className='RouteIcon' onClick={e => { drawRoute(place); }}/>
          </button>
        }
        </td>
      </tr>
    )
  }
  //#endregion

  return(
    //알수없는 이유로 translate발생
    <Card className="custom-card" style={{transform: 'translateY(-5px)'}}>
      <Card.Header>
        <div className='d-flex flex-row justify-content-between'>
          <span>{ selectedTravel?.name }</span>
          <span>
            <EditCalendarIcon onClick={() => props.setEditTravel(true)}/>
            <PlaceIcon onClick={() => drawDailyMarkers()}/>
            <CloseRoundedIcon onClick={closeTravel}/>
          </span>
        </div>
      </Card.Header>
      <Card.Body className='overflow-auto p-1'>
        <Accordion alwaysOpen>
        {
          orderedPlaceMatrix.length === travelDays.length && //안전장치
          orderedPlaceMatrix.map((x, i) => drawDay(i, x))
        }
        </Accordion>
      </Card.Body>
    </Card>
  )
}

export default TravelInfoViewPanel;