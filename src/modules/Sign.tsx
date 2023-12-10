import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { Form, Button, Card } from 'react-bootstrap';

export const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
  };

  return (
    <div className='LoginOverlay'>
      <Card className='LoginForm'>
        <Card.Header>
          Welcome to HardTrip
        </Card.Header>
        <Card.Body>
          <Form>
            <Form.Group controlId="formBasicEmail" className='text-align-left mb-2'>
              <Form.Label>Email 주소</Form.Label>
              <Form.Control
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword" className='text-align-left'>
              <Form.Label>비밀번호</Form.Label>
              <Form.Control
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" type="button" onClick={handleLogin}>
              Sign In
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export const SignUp = () => {
  //https://firebase.google.com/docs/auth/web/start?hl=ko
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
  };

  return (
    <div className='LoginOverlay'>
      <Card className='LoginForm'>
        <Card.Header>
          Welcome to HardTrip
        </Card.Header>
        <Card.Body>
          <Form>
            <Form.Group controlId="formBasicEmail" className='text-align-left mb-2'>
              <Form.Label>Email 주소</Form.Label>
              <Form.Control
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword" className='text-align-left'>
              <Form.Label>비밀번호</Form.Label>
              <Form.Control
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" type="button" onClick={handleLogin}>
              Sign Up
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}