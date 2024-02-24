/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { Card, Table, Accordion } from 'react-bootstrap';
import AccordionContext from 'react-bootstrap/AccordionContext';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import { Travel, TravelSerialized, deSerializeTravel } from '../DataType/Travel';
import { Place } from '../DataType/Place';
import { Route } from '../DataType/Route';
import { setSelectedOpenedIdx } from '../redux/openedTravelListSlice';
import { CompareDate, GetDaysDiff, GetHHmm } from './CommonFunctions';

import GetPlaceIcon from '../DataType/GetPlaceIcon';
import RouteIcon from '@mui/icons-material/Route';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PlaceIcon from '@mui/icons-material/Place';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsTransitIcon from '@mui/icons-material/DirectionsTransit';
import PedalBikeIcon from '@mui/icons-material/PedalBike';
import DriveEtaIcon from '@mui/icons-material/DriveEta';

interface TravelInfoProps{
  //to MapComponent
  setPlaceId: React.Dispatch<React.SetStateAction<string>>;
  setMarkerPlaces: React.Dispatch<React.SetStateAction<Place[]>>
  setDirections: React.Dispatch<React.SetStateAction<google.maps.DirectionsResult[]>>;
  //to RouteEditPanel
  setFrom: React.Dispatch<React.SetStateAction<Place>>;
  setTo: React.Dispatch<React.SetStateAction<Place>>;
  onClose: () => void;
}

interface TravelDay{
  day: number;
  date: Date | string;
}

const TravelInfoViewPanel = (props : TravelInfoProps) => {
  const dispatch = useAppDispatch();
  const openedTravelListRedux: TravelSerialized[] = useAppSelector((state) => state.openedTravelList.list);
  const selectedOpenedIdxRedux = useAppSelector(state => state.openedTravelList.selectedIdx);
  const directionsService = new google.maps.DirectionsService();
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

  const [selectedTravel, setSelectedTravel] = useState<Travel>(null);
  const [travelDays, setTravelDays] = useState<TravelDay[]>([]);
  const [orderedPlaceArray, setOrderedPlaceArray] = useState<Place[]>([]);
  const [orderedPlaceMatrix, setOrderedPlaceMatrix] = useState<Place[][]>([[]]);
  const [routeList, setRouteList] = useState<Route[]>([]);

  //#region [useEffect]
  useEffect(() => {
    return () => {
      //props해제
      props.setDirections([]);
      props.setPlaceId('')
    }
  }, []);

  useEffect(() => {
    if(openedTravelListRedux.length > 0 && selectedOpenedIdxRedux >= 0){
      setSelectedTravel(deSerializeTravel(openedTravelListRedux[selectedOpenedIdxRedux]));
    } else {
      setSelectedTravel(null);
    }
  }, [openedTravelListRedux, selectedOpenedIdxRedux]);

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

      const temp = selectedTravel.places.map(x => ({...x, isDel: false, isEdit: false} as Place))
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
    //1. 1차원 배열 재설정
    setOrderedPlaceArray(orderedPlaceMatrix.reduce((acc, cur) => acc.concat(cur), []));

    //2. routeList 재설정
    const data = [];
    for(let i = 0 ; i < orderedPlaceMatrix.length ; i++){
      for(let j = 1 ; j < orderedPlaceMatrix[i].length ; j++){
        const from = orderedPlaceMatrix[i][j - 1];
        const to = orderedPlaceMatrix[i][j];
        const route = routeList.find(x => x.sourceId === from.id && x.destinationId === to.id);
        if(route){
          data.push(route);
        }
      }
    }
    setRouteList(data);
  }, [orderedPlaceMatrix]);
  //#endregion

  //#region [Functions]
  const haversineDistance = (from: google.maps.LatLngLiteral, to: google.maps.LatLngLiteral): number => {
    const R = 6371; //km
    const dLat = (to.lat - from.lat) * (Math.PI / 180);
    const dLng = (to.lng - from.lng) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; //km
  }

  const setRoute = (source: Place, destination: Place, result: google.maps.DirectionsResult, mode: google.maps.TravelMode) => {
    const route = routeList.find(x => x.sourceId === source.id && x.destinationId === destination.id);
    const resultRoute = result.routes[0];
    const newRoute = {
      sourceId: source.id,
      destinationId: destination.id,
      sourcePlaceId: source.place_id,
      destinationPlaceId: destination.place_id,
      travelMode: mode,
      distance: resultRoute.legs[0].distance.value,
      duration: resultRoute.legs[0].duration.value,
      fare: resultRoute.fare?.value,
      currency: resultRoute.fare?.currency
    } as Route;
    if(route){
      setRouteList(prev => prev.map(x => x.sourceId === route.sourceId && x.destinationId === route.destinationId ? newRoute : x));
    } else {
      setRouteList(prev => [...prev, newRoute]);
    }
  }
  //#endregion

  //#region [Event Handler]  
  const closeTravel = () => {
    dispatch(setSelectedOpenedIdx(-1));
    props.onClose();
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

  const searchDailyRoute = async (day: number) => {
    const target = orderedPlaceArray.filter(x => x.day === day);
    const directionList = [];
    for(let i = 0 ; i < target.length - 1 ; i++){
      const mode = haversineDistance(target[i].latLng, target[i + 1].latLng) >= 1.5
        ? google.maps.TravelMode.TRANSIT
        : google.maps.TravelMode.WALKING;
      const req = {
        origin: { placeId: target[i].place_id } as google.maps.Place,
        destination: { placeId: target[i + 1].place_id } as google.maps.Place,
        travelMode: mode
      } as google.maps.DirectionsRequest;

      await directionsService.route(req, async (result, status) => {
        if(status === google.maps.DirectionsStatus.OK){
          setRoute(target[i], target[i + 1], result, mode);
          directionList.push(result);
        } else {
          console.error(result);
        }
      });
    }
    props.setDirections(directionList);
  }
  //#endregion

  //#region [Draggable Event Handler]
  const setFromTo = (place: Place) => {
    let source: Place;
    loop: for(let i = 0 ; i < orderedPlaceMatrix.length ; i++){
      for(let j = 0 ; j < orderedPlaceMatrix[i].length ; j++){
        if(orderedPlaceMatrix[i][j].id === place.id){
          source = orderedPlaceMatrix[i][j - 1];
          break loop;
        }
      }
    }
    props.setFrom(source);
    props.setTo(place);
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
            ? <div className='text-align-left'>{`DAY-${t.day} ${(t.date as Date).toLocaleDateString()} ${daysOfWeek[(t.date as Date).getDay()]}`}</div>
            : <div className='text-align-left'>N/A</div>
          }
          <span>
            <PlaceIcon onClick={e => { drawDailyMarkers(i); }}/>
            <RouteIcon onClick={e => { searchDailyRoute(i); }}/>
            <AccordionButton eventKey={i.toString()}/>
          </span>
        </Card.Header>
        <Accordion.Collapse eventKey={i.toString()} className='p-0'>
          <Table>
            <colgroup>
              <col width='5%'/>
              <col width='40%'/>
              <col width='15%'/>
              <col width='15%'/>
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
          <button className='RouteButton BetweenTr' onClick={() => {setFromTo(place)}}>{drawRouteIcon(place)}</button>
        }
        </td>
      </tr>
    )
  }

  const drawRouteIcon = (destPlace: Place) => {
    const route = routeList.find(x => x.destinationId === destPlace.id);
    if(route){
      if(route.travelMode === google.maps.TravelMode.WALKING){
        return <DirectionsWalkIcon className='RouteIcon'/>
      }
      if(route.travelMode === google.maps.TravelMode.BICYCLING){
        return <PedalBikeIcon className='RouteIcon'/>
      }
      if(route.travelMode === google.maps.TravelMode.TRANSIT){
        return <DirectionsTransitIcon className='RouteIcon'/>
      }
      if(route.travelMode === google.maps.TravelMode.DRIVING){
        return <DriveEtaIcon className='RouteIcon'/>
      }
    } else {
      return <RouteIcon className='RouteIcon'/>
    }
  }
  //#endregion

  return(
    <Card className="custom-card card-left">
      <Card.Header>
        <div className='d-flex flex-row justify-content-between'>
          <span>{ selectedTravel?.name }</span>
          <span>
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