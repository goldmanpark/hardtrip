/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Card, Table } from 'react-bootstrap';
import DatePicker from 'react-datepicker';

import { useAppSelector, useAppDispatch } from '../redux/store';
import { readTravelList, createTravel, updateTravel, deleteTravel } from '../redux/travelListSlice';
import { readPlaceList } from '../redux/travelListSlice';
import { Travel, TravelRedux } from '../DataType/Travel';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Place, PlaceRedux } from '../DataType/Place';

interface PanelProps{
  setSelectedTravel: React.Dispatch<React.SetStateAction<Travel>>;
  exit: () => void;
}

const TravelListPanel = (props: PanelProps) => {
  const dispatch = useAppDispatch();
  const travelListRedux: TravelRedux[] = useAppSelector((state) => state.travelList);
  const { userData } = useAuth();

  const [travelList, setTravelList] = useState<Travel[]>([]);
  const [newTravel, setNewTravel] = useState<Travel>(new Travel());
  const [editIdx, setEditIdx] = useState(-1);
  const [tempTravel, setTempTravel] = useState<Travel>(new Travel());

  useEffect(() => {
    if(userData) getTravelList(userData.uid);
  }, [userData]);

  useEffect(() => {
    setTravelList(travelListRedux.map(x => (new Travel(x))));
  }, [travelListRedux]);

  useEffect(() => { //이거 useEffect로 안하면 render에러발생
    if(0 <= editIdx && editIdx < travelListRedux.length){
      setTempTravel(travelList[editIdx]);
    }    
  }, [editIdx]);


  //#region [Event Handler]
  /** 유저접속정보 기반 travel전체목록 조회 */
  const getTravelList = (uid: string) => {
    dispatch(readTravelList(uid));
    setNewTravel(new Travel());
  }

  /** travel이하 place등 상세정보 조회 위해 travel선택 */
  const onSelectTravel = (travel: Travel) => {    
    dispatch(readPlaceList(travel.id)).then((action) => {
      const p = action.payload as any;
      travel.places = p.places.map((x: PlaceRedux) => (new Place(x)));
      props.setSelectedTravel(travel);
    });
    
  }

  /** 신규 travel등록 */
  const addTravel = () => {
    if(!userData) return;
    newTravel.uid = userData.uid;
    dispatch(createTravel(newTravel.getFS()));
  }

  const cancelAdd = () => {
    setNewTravel(new Travel());
  }

  /** 기존 travel편집 */
  const editTravel = (idx: number) => {
    setEditIdx(idx);
  }

  /** travel 수정 확정 */
  const confirmEdit = () => {
    dispatch(updateTravel(tempTravel.getFS()));
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

  const NormalRow = (idx: number, travel : Travel): JSX.Element => {
    return (
      <tr key={idx}>
        <td onClick={() => {onSelectTravel(travel)}} className='text-align-left'>{travel.name}</td>
        <td onClick={() => {onSelectTravel(travel)}}>{travel.startDate?.toLocaleDateString()}</td>
        <td onClick={() => {onSelectTravel(travel)}}>{travel.endDate?.toLocaleDateString()}</td>
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
                 onChange={(e) => {
                  // setTempTravel(prev => ({
                  //   ...prev,
                  //   name : e.target.value
                  // } as Travel)
                }}/>
        </td>
        <td>
          <DatePicker className='w-100 text-align-center'
                      dateFormat="yy.MM.dd"
                      selected={tempTravel.startDate}
                      onChange={(date) => {tempTravel.startDate = date;}}/>
        </td>
        <td>
          <DatePicker className='w-100 text-align-center'
                      dateFormat="yy.MM.dd"
                      selected={tempTravel.endDate}
                      onChange={(date) => {tempTravel.endDate = date;}}/>
        </td>
        <td><CheckIcon onClick={() => {confirmEdit()}}/></td>
        <td><DoDisturbIcon onClick={() => {cancelEdit()}}/></td>
      </tr>
    )
  }

  return(
    <Card className="custom-card">
      <Card.Header>
        <div className='d-flex flex-row justify-content-end'>
          <CloseRoundedIcon onClick={props.exit}/>
        </div>
      </Card.Header>
      <Card.Body style={{overflowX: 'hidden', overflowY: 'auto'}}>
        <Table className='w-100' size="sm" striped>
          <colgroup>
            <col style={{width: '30%'}}/>
            <col style={{width: '30%'}}/>
            <col style={{width: '30%'}}/>
            <col style={{width: '5%'}}/>
            <col style={{width: '5%'}}/>
          </colgroup>
          <thead>
            <tr>
              <th style={{width: '20%'}}>travel</th>
              <th>start</th>
              <th>end</th>
              <th>edit</th>
              <th>del</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input className='w-100' type='text'
                       placeholder='new Travel'
                       value={newTravel.name}
                       onChange={(e) => {newTravel.name = e.target.value}}/>
              </td>
              <td>
                <DatePicker className='w-100 text-align-center'
                            dateFormat="yy.MM.dd"
                            selected={newTravel.startDate}
                            onChange={(date) => {newTravel.startDate = date;}}/>
              </td>
              <td>
                <DatePicker className='w-100 text-align-center'
                            dateFormat="yy.MM.dd"
                            selected={newTravel.endDate}
                            onChange={(date) => {newTravel.endDate = date;}}/>
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
  )
}

export default TravelListPanel;