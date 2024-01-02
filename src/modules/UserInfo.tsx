/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Form } from 'react-bootstrap';
import { getAuth, updateProfile } from "firebase/auth";
import { useAuth } from '../AuthContext';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface UserInfoProps{
  onClose: () => void;
}

const UserInfo = (props: UserInfoProps) => {
  const { userData } = useAuth();
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    setDisplayName(userData.displayName);
  }, [userData])

  const editProfile = () => {
    updateProfile(userData, {
      displayName: displayName,
      photoURL: "https://example.com/jane-q-user/profile.jpg"
    }).then(() => {
      // Profile updated!
      // ...
    }).catch((error) => {
      // An error occurred
      // ...
    });
  }

  return (
    <Card className='custom-card card-right'>
      <Card.Header className='d-flex flex-row justify-content-between align-items-center'>
        <h4 className='m-0'>UserInfo</h4>
        <CloseRoundedIcon onClick={() => {props.onClose()}}/>
      </Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className='text-align-left'>
            <Form.Label>e-mail</Form.Label>
            <Form.Control className='mb-2'
              type="email"
              value={userData.email}
              disabled
            />
            <Form.Label>nickname</Form.Label>
            <Form.Control className='mb-2'
              type="text"
              placeholder="닉네임을 입력하세요"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Card.Body>
    </Card>
  )
}

export default UserInfo;