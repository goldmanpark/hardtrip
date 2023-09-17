/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Dropdown, Form, Button } from 'react-bootstrap';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { getTravelListFromDB, addTravel2DB } from '../redux/travelListSlice';
import Travel from '../DataType/Travel';

interface MenuProps{
  showTraffic: boolean;
  showTransit: boolean;
  setShowTraffic: React.Dispatch<React.SetStateAction<boolean>>;
  setShowTransit: React.Dispatch<React.SetStateAction<boolean>>;
}

const Menu = (props: MenuProps) => {
  const dispatch = useAppDispatch();
  const travelList: Travel[] = useAppSelector((state) => state.travelList);
  const { userData } = useAuth();
  const [travelName, setTravelName] = useState<string>('');
  
  useEffect(() => {
    if(userData) getTravelList(userData.uid);
  }, [userData]);

  const onClickTraffic = () => {
    props.setShowTraffic(prev => !prev);
  }

  const onClickTransit = () => {
    props.setShowTransit(prev => !prev);
  }

  const getTravelList = (uid: string) => {
    dispatch(getTravelListFromDB(uid));
  }

  const addTravel = () => {
    if(!userData) return;
    
    dispatch(addTravel2DB({ uid: userData.uid, name: travelName}))
    .then((result) => {
      if(addTravel2DB.fulfilled.match(result)){
        dispatch(getTravelListFromDB(userData.uid)); //reload
      }
    });
  }

  return (
    <Dropdown title="Menu" autoClose="outside">
      <Dropdown.Toggle className='MenuButton' >
        Menu
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Header>Layers</Dropdown.Header>
        <Dropdown.Item as="button">
          <div className="toggle-switch" onClick={onClickTraffic}>
            <input type="checkbox" className="toggle-input" id="toggleTraffic"
                   checked={props.showTraffic} onChange={onClickTraffic}/>
            <label className="toggle-label" htmlFor="toggleTraffic"></label>
            <span className="toggle-text">{props.showTraffic ? 'Traffic On' : 'Traffic Off'}</span>
          </div>
        </Dropdown.Item>
        <Dropdown.Item>
          <div className="toggle-switch" onClick={onClickTransit}>
            <input type="checkbox" className="toggle-input" id="toggleTransit"
                   checked={props.showTransit} onChange={onClickTransit}/>
            <label className="toggle-label" htmlFor="toggleTransit"></label>
            <span className="toggle-text">{props.showTransit ? 'Transit On' : 'Transit Off'}</span>
          </div>
        </Dropdown.Item>
        <Dropdown.Header>Travels</Dropdown.Header>

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
          travelList.map(t => (
            <Dropdown.Item>
              {t.name}
            </Dropdown.Item>
          ))
        }
        <Dropdown.Divider/>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default Menu;
