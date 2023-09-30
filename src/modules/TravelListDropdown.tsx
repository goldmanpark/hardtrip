/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Dropdown, Form, Button } from 'react-bootstrap';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { readTravelList, createTravel } from '../redux/travelListSlice';
import { ITravel, Travel } from '../DataType/Travel';

interface MenuProps{
  selectedTravel: Travel;
  setSelectedTravel: React.Dispatch<React.SetStateAction<Travel>>;
}

const TravelListDropdown = (props: MenuProps) => {
  const dispatch = useAppDispatch();
  const travelListRedux: ITravel[] = useAppSelector((state) => state.travelList);
  const { userData } = useAuth();
  const [travelName, setTravelName] = useState<string>('');
  const [travelList, setTravelList] = useState<Travel[]>([]);

  useEffect(() => {
    if(userData) getTravelList(userData.uid);
  }, [userData]);

  useEffect(() => {
    setTravelList(travelListRedux.map(x => {
      return new Travel(x);
    }));
  }, [travelListRedux]);

  useEffect(() => {
    console.log(travelList)
    if(props.selectedTravel){
      let item = travelList.find(x => x.id === props.selectedTravel.id);
      props.setSelectedTravel(item ?? null);
    }
  }, [travelList]);

  const getTravelList = (uid: string) => {
    dispatch(readTravelList(uid));
  }

  const onSelectTravel = (travel: Travel) => {
    console.log(travel)
    props.setSelectedTravel(travel);
  }

  const addTravel = () => {
    if(!userData) return;
    
    dispatch(createTravel({ uid: userData.uid, name: travelName}))
    .then((result) => {
      if(createTravel.fulfilled.match(result)){
        dispatch(readTravelList(userData.uid)); //reload
      }
    });
  }

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
            <Dropdown.Item key={i} onClick={() => {onSelectTravel(t)}}>
              {t.name}
            </Dropdown.Item>
          ))
        }
        <Dropdown.Divider/>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default TravelListDropdown;
