import React, { useState } from 'react';
import { Nav, NavDropdown, ToggleButton, ToggleButtonGroup  } from 'react-bootstrap';
import Login from './Login';

interface MenuProps{
  style: React.CSSProperties;
  setShowTraffic: React.Dispatch<React.SetStateAction<boolean>>;
  setShowTransit: React.Dispatch<React.SetStateAction<boolean>>;
  setShowBicycle: React.Dispatch<React.SetStateAction<boolean>>;
}

const Menu = (props: MenuProps) => {
  return (
    <NavDropdown title="Menu" id="basic-nav-dropdown" style={props.style}>
      <NavDropdown.Item>
        <Login/>
      </NavDropdown.Item>
      <NavDropdown.Item onClick={() => {props.setShowTraffic(prev => !prev)}}>
        Traffic
      </NavDropdown.Item>
      <NavDropdown.Item onClick={() => {props.setShowTransit(prev => !prev)}}>
        Transit
      </NavDropdown.Item>
      <NavDropdown.Item onClick={() => {props.setShowBicycle(prev => !prev)}}>
        Bicycle
      </NavDropdown.Item>      
      <NavDropdown.Divider/>
    </NavDropdown>
  );
};

export default Menu;
