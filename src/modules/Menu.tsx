import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Nav, NavDropdown, ToggleButton, ToggleButtonGroup  } from 'react-bootstrap';

interface MenuProps{
  setShowTraffic: React.Dispatch<React.SetStateAction<boolean>>;
  setShowTransit: React.Dispatch<React.SetStateAction<boolean>>;
  setShowBicycle: React.Dispatch<React.SetStateAction<boolean>>;
}

const Menu = (props: MenuProps) => {
  const { userData } = useAuth();

  return (
    <NavDropdown title="Menu" id="basic-nav-dropdown" className='MenuButton'>
      <NavDropdown.Item onClick={() => {props.setShowTraffic(prev => !prev)}}>
        Traffic
      </NavDropdown.Item>
      <NavDropdown.Item onClick={() => {props.setShowTransit(prev => !prev)}}>
        Transit
      </NavDropdown.Item>
      <NavDropdown.Item onClick={() => {props.setShowBicycle(prev => !prev)}}>
        Bicycle
      </NavDropdown.Item>
      {
        userData 
          ? <React.Fragment>
              <NavDropdown.Divider/>
              <NavDropdown.Item>
                Add Travel
              </NavDropdown.Item>
          </React.Fragment>
          : <></>
      }   
      
    </NavDropdown>
  );
};

export default Menu;
