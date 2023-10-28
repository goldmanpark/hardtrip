/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Dropdown, Form, Button } from 'react-bootstrap';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { readTravelList, createTravel, updateTravel, deleteTravel } from '../redux/travelListSlice';
import { readPlaceList } from '../redux/travelListSlice';
import { ITravel } from '../DataType/Travel';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';

interface MenuProps{
  selectedTravel: ITravel;
  setSelectedTravel: React.Dispatch<React.SetStateAction<ITravel>>;
}

interface TravelAug extends ITravel{
  isEdit: boolean;
}

const TravelListDropdown = (props: MenuProps) => {
  const dispatch = useAppDispatch();
  const travelListRedux: ITravel[] = useAppSelector((state) => state.travelList);
  const { userData } = useAuth();
  const [travelName, setTravelName] = useState<string>('');
  const [travelList, setTravelList] = useState<TravelAug[]>([]);
  const [tempName, setTempName] = useState<string>('');

  useEffect(() => {
    if(userData) getTravelList(userData.uid);
  }, [userData]);

  useEffect(() => {
    setTravelList(travelListRedux.map(x => ({...x, isEdit: false} as TravelAug)));
    if(props.selectedTravel){
      let item = travelListRedux.find(x => x.id === props.selectedTravel.id);
      props.setSelectedTravel(item ?? null);
    }
  }, [travelListRedux]);

  //#region [Event Handler]
  /** 유저접속정보 기반 travel전체목록 조회 */
  const getTravelList = (uid: string) => {
    dispatch(readTravelList(uid));
  }

  /** travel이하 place등 상세정보 조회 위해 travel선택 */
  const onSelectTravel = (travel: ITravel) => {
    props.setSelectedTravel(travel);
    dispatch(readPlaceList(travel.id));
  }

  /** 신규 travel등록 */
  const addTravel = () => {
    if(!userData) return;
    //dispatch(createTravel({ uid: userData.uid, name: travelName }));
  }

  /** 기존 travel편집 */
  const editTravel = (travel : TravelAug) => {
    setTravelList(prev => prev.map(x => x.id === travel.id
      ? {...x, isEdit: true}
      : x)
    );
  }

  /** travel 수정 확정 */
  const confirmEdit = (travel : TravelAug) => {
    travel.name = tempName;
    dispatch(updateTravel(travel));
  }

  /** travel 수정 취소 */
  const cancelEdit = (travel : TravelAug) => {
    setTravelList(prev => prev.map(x => x.id === travel.id ? {...x, isEdit: false} : x));
  }

  /** travel 삭제 */
  const removeTravel = (travel : TravelAug) => {
    if(!userData) return;
    dispatch(deleteTravel(travel.id))
  }
  //#endregion

  return (
    <Dropdown autoClose="outside">
      <Dropdown.Toggle className='MenuButton'>
        Travels
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item>
          {
            userData
              ? <Form className='d-flex flex-row gap-1' style={{ width: '15rem' }}>
                  <Form.Group className="mr-1">
                    <Form.Control id="travelName" placeholder='Travel name here..' value={travelName}
                                  onChange={(e) => {setTravelName(e.target.value)}}/>
                  </Form.Group>
                  <Button type="submit" size="sm" onClick={addTravel}>Add</Button>
                </Form>
              : <span>Please login to create Travel</span>
          }
        </Dropdown.Item>
        {
          travelList.map((t, i) => (
            <Dropdown.Item key={i} className='d-flex flex-row justify-content-between'>
              {
                t.isEdit
                  ? (
                    <React.Fragment>
                      <input type='text' value={tempName} onChange={(e) => setTempName(e.target.value)}/>
                      <span>
                        <CheckIcon onClick={() => {confirmEdit(t)}}/>
                        <DoDisturbIcon onClick={() => {cancelEdit(t)}}/>
                      </span>
                    </React.Fragment>)
                  : (
                    <React.Fragment>
                      <span onClick={() => {onSelectTravel(t)}}>
                        {t.name}
                      </span>
                      <span>
                        <EditIcon onClick={() => {editTravel(t)}}/>
                        <DeleteIcon onClick={() => {removeTravel(t)}}/>
                      </span>
                    </React.Fragment>)
              }
            </Dropdown.Item>
          ))
        }
        <Dropdown.Divider/>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default TravelListDropdown;
