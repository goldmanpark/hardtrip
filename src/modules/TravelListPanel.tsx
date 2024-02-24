/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Card, Table } from 'react-bootstrap';
import DatePicker from 'react-datepicker';

import { useAppSelector, useAppDispatch } from '../redux/store';
import { createTravel, updateTravel, deleteTravel } from '../redux/travelListSlice';
import { readOpenedTravelList, readOpenedPlaceList, setSelectedOpenedIdx } from '../redux/openedTravelListSlice';
import { readPlaceList, setSelectedIdx } from '../redux/travelListSlice';
import { Travel, TravelSerialized, deSerializeTravel } from '../DataType/Travel';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { GetyyyyMMdd } from './CommonFunctions';

interface PanelProps{
  exit: () => void;
}

const TravelListPanel = (props: PanelProps) => {
  const dispatch = useAppDispatch();
  const travelListRedux: TravelSerialized[] = useAppSelector((state) => state.travelList.list);
  const openedTravelListRedux: TravelSerialized[] = useAppSelector((state) => state.openedTravelList.list);
  const { userData } = useAuth();
  
  const [travelList, setTravelList] = useState<Travel[]>([]);
  const [newTravel, setNewTravel] = useState<Travel>({opened: false} as Travel);
  const [editIdx, setEditIdx] = useState(-1);
  const [tempTravel, setTempTravel] = useState<Travel>({} as Travel);
  const [openedTravelList, setOpenedTravelList] = useState<Travel[]>([]);

  useEffect(() => {
    if(userData){
      dispatch(readOpenedTravelList(userData.uid));
    }
  }, [userData]);

  useEffect(() => {
    setTravelList(travelListRedux.map(x => { return deSerializeTravel(x)}));
  }, [travelListRedux]);

  useEffect(() => {
    setOpenedTravelList(openedTravelListRedux.map(x => { return deSerializeTravel(x)}));
  }, [openedTravelListRedux]);

  useEffect(() => { //이거 useEffect로 안하면 render에러발생
    if(0 <= editIdx && editIdx < travelListRedux.length){
      setTempTravel(travelList[editIdx]);
    }    
  }, [editIdx]);

  //#region [Event Handler]
  /** travel이하 place등 상세정보 조회 위해 travel선택 */
  const onSelectTravel = (idx: number, travel: Travel) => {
    dispatch(readPlaceList(travel.id));
    dispatch(setSelectedIdx(idx));
  }

  const onSelectOpenedTravel = (idx: number, travel: Travel) => {
    dispatch(readOpenedPlaceList(travel.id));
    dispatch(setSelectedOpenedIdx(idx));
  }

  /** 신규 travel등록 */
  const addTravel = () => {
    if(!userData) return;
    if(!newTravel.name) return;
    newTravel.uid = userData.uid;
    dispatch(createTravel(newTravel));
  }

  const cancelAdd = () => {
    setNewTravel({} as Travel);
  }

  /** 기존 travel편집 */
  const editTravel = (idx: number) => {
    setEditIdx(idx);
  }

  /** travel 수정 확정 */
  const confirmEdit = () => {
    dispatch(updateTravel(tempTravel));
    setEditIdx(-1);
  }

  /** travel 수정 취소 */
  const cancelEdit = () => {
    setEditIdx(-1);
  }

  /** travel 삭제 */
  const removeTravel = (travel : Travel) => {
    if(!userData) return;
    dispatch(deleteTravel(travel.id))
  }
  //#endregion

  //#region [Conditional Render]
  const NormalRow = (idx: number, travel : Travel): JSX.Element => {
    return (
      <tr key={idx}>
        <td onClick={() => {onSelectTravel(idx, travel)}} className='text-align-left'>{travel.name}</td>
        <td onClick={() => {onSelectTravel(idx, travel)}}>{GetyyyyMMdd(travel.startDate)}</td>
        <td onClick={() => {onSelectTravel(idx, travel)}}>{GetyyyyMMdd(travel.endDate)}</td>
        <td><input type='checkbox' checked={travel.opened} disabled/></td>
        <td><EditIcon onClick={() => {editTravel(idx)}}/></td>
        <td><DeleteIcon onClick={() => {removeTravel(travel)}}/></td>
      </tr>
    )
  }

  const EditRow = (idx: number, travel : Travel): JSX.Element => {
    return (
      <tr key={idx}>
        <td>
          <input className='w-100' type='text' 
                 value={tempTravel.name} 
                 onChange={(e) => {setTempTravel(prev => ({...prev, name: e.target.value}))}}/>
        </td>
        <td>
          <DatePicker className='w-100 text-align-center'
                      dateFormat="yy.MM.dd"
                      selected={tempTravel.startDate}
                      onChange={(date) => {setTempTravel(prev => ({...prev, startDate: date}))}}/>
        </td>
        <td>
          <DatePicker className='w-100 text-align-center'
                      dateFormat="yy.MM.dd"
                      selected={tempTravel.endDate}
                      onChange={(date) => {setTempTravel(prev => ({...prev, endDate: date}))}}/>
        </td>
        <td>
          <input type='checkbox' checked={tempTravel.opened}
                  onChange={() => setTempTravel(prev => ({...prev, opened: !prev.opened}))}/>
        </td>
        <td><CheckIcon onClick={() => {confirmEdit()}}/></td>
        <td><DoDisturbIcon onClick={() => {cancelEdit()}}/></td>
      </tr>
    )
  }
  //#endregion

  return(
    <Card className="custom-card card-left">
      <Card.Header>
        <div className='d-flex flex-row justify-content-between'>
          Travels
          <CloseRoundedIcon onClick={props.exit}/>
        </div>
      </Card.Header>
      <Card.Body style={{overflowX: 'hidden', overflowY: 'auto'}} className='p-1'>
        <Card className='mb-2'>
          <Card.Header className='text-align-left'>
            User Travels
          </Card.Header>
          <Card.Body className='p-0'>
            <Table className='w-100' size="sm" striped>
              <colgroup>
                <col style={{width: '35%'}}/>
                <col style={{width: '25%'}}/>
                <col style={{width: '25%'}}/>
                <col style={{width: '5%'}}/>
                <col style={{width: '5%'}}/>
                <col style={{width: '5%'}}/>
              </colgroup>
              <thead>
                <tr>
                  <th style={{width: '20%'}}>travel</th>
                  <th>start</th>
                  <th>end</th>
                  <th>opened</th>
                  <th>edit</th>
                  <th>del</th>
                </tr>
              </thead>
              <tbody>
                {/* new Travel 용 */}
                <tr>
                  <td>
                    <input className='w-100' type='text'
                          placeholder='new Travel'
                          value={newTravel.name}
                          onChange={(e) => {setNewTravel(prev => ({...prev, name: e.target.value}))}}/>
                  </td>
                  <td>
                    <DatePicker className='w-100 text-align-center'
                                dateFormat="yy.MM.dd"
                                selected={newTravel.startDate}
                                onChange={(date) => {setNewTravel(prev => ({...prev, startDate: date}))}}/>
                  </td>
                  <td>
                    <DatePicker className='w-100 text-align-center'
                                dateFormat="yy.MM.dd"
                                selected={newTravel.endDate}
                                onChange={(date) => {setNewTravel(prev => ({...prev, endDate: date}))}}/>
                  </td>
                  <td>
                    <input type='checkbox' checked={newTravel.opened}
                          onChange={() => setNewTravel(prev => ({...prev, opened: !prev.opened}))}/>
                  </td>
                  <td><CheckIcon onClick={addTravel}/></td>
                  <td><DoDisturbIcon onClick={cancelAdd}/></td>
                </tr>
              {
                travelList.map((t, i) => {
                  return i === editIdx ? EditRow(i, t) : NormalRow(i, t)
                })
              }
              </tbody>
            </Table>
          </Card.Body>
        </Card>
        <Card>
          <Card.Header className='text-align-left'>
            Opened Travels
          </Card.Header>
          <Card.Body className='p-0'>
            <Table className='w-100' size="sm" striped>
              <colgroup>
                <col style={{width: '35%'}}/>
                <col style={{width: '25%'}}/>
                <col style={{width: '25%'}}/>
              </colgroup>
              <thead>
                <tr>
                  <th style={{width: '20%'}}>travel</th>
                  <th>start</th>
                  <th>end</th>
                </tr>
              </thead>
              <tbody>
              {
                openedTravelList.map((t, i) => {
                  return (
                    <tr key={i} onClick={() => onSelectOpenedTravel(i, t)}>
                      <td className='text-align-left'>{t.name}</td>
                      <td>{GetyyyyMMdd(t.startDate)}</td>
                      <td>{GetyyyyMMdd(t.endDate)}</td>
                    </tr>
                  )
                })
              }
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Card.Body>
    </Card>
  )
}

export default TravelListPanel;