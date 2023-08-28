/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Dropdown, Form, Button, Card } from 'react-bootstrap';

import { db } from '../config/firebase';
import { collection, getDocs, addDoc, QuerySnapshot } from 'firebase/firestore'
import { query, where } from 'firebase/firestore'
import { Travel } from '../DataType/Travel';

interface MenuProps{
  showTraffic: boolean;
  showTransit: boolean;
  setShowTraffic: React.Dispatch<React.SetStateAction<boolean>>;
  setShowTransit: React.Dispatch<React.SetStateAction<boolean>>;
}

const Menu = (props: MenuProps) => {
  const { userData } = useAuth();
  const travelCollectionRef = collection(db, "travel");
  const [travelName, setTravelName] = useState<string>('');
  const [travelList, setTravelList] = useState<Travel[]>([]);

  useEffect(() => {
    if(userData) getTravelList(userData.uid);
    else setTravelList([]);
  }, [userData]);

  const onClickTraffic = () => {
    props.setShowTraffic(prev => !prev);
  }

  const onClickTransit = () => {
    props.setShowTransit(prev => !prev);
  }

  const getTravelList = async (uid: string) => {
    try {
      const qr = query(travelCollectionRef, where('uid', '==', uid));
      const docSnap = await getDocs(qr);
      
      if(docSnap instanceof QuerySnapshot){
        setTravelList(docSnap.docs.map((doc) => {
          let data = doc.data();
          return new Travel(doc.id, data.uid, data.name);
        }))
      } else {
        setTravelList([]);
      }     
    } catch (error) {
      console.error(error);
    }
  }

  const addTravel = async () => {
    console.log("success")
    if(!userData) return;
    try {
      await addDoc(travelCollectionRef, {
        uid: userData.uid,
        name: travelName
      });
      await getTravelList(userData.uid);
      setTravelName('');
    } catch (error) {
      console.error(error);
    }
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
