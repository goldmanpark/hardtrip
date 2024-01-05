import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { firebaseAuth } from '../config/firebase';
import { Tab, Tabs, Form, Button, Card } from 'react-bootstrap';
import { ReactComponent as GoogleLogo } from '../svg/web_neutral_sq_SI.svg';

export const SignForm = () => {
  return (
    <div className='LoginOverlay'>
      <div className='LoginForm'>
        <Tabs className='mb-3' defaultActiveKey="emailLogin">
          <Tab eventKey='emailLogin' title='e-mail Login'>
            <EmailLogin/>
          </Tab>
          <Tab eventKey='googleLogin' title='Google Login'>
            <GoogleLogin/>
          </Tab>
          <Tab eventKey='emailJoin' title='e-mail Join'>
            <EmailJoin/>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

const EmailLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firebaseErr, setFirebaseErr] = useState('');

  const handleLogin = () => {
    signInWithEmailAndPassword(firebaseAuth, email, password)
      .then((data) => {
        login(data.user);
        navigate('/main');
      })
      .catch((error) => {
        setFirebaseErr(error.message);
      });
  }

  const onEnterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if(e.key === 'Enter'){
      handleLogin();
    }
  }

  return (
    <Card>
      <Card.Body>
        <Form>
          <Form.Group className='text-align-left mb-2'>
            <Form.Label>Email 주소</Form.Label>
            <Form.Control className='mb-2'
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Form.Label>비밀번호</Form.Label>
            <Form.Control
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={onEnterKeyDown}
            />
          </Form.Group>

          <h5 style={{color: 'red'}}>{firebaseErr}</h5>

          <div className='d-flex flex-row justify-content-around'>
            <Button variant="primary" type="button" onClick={handleLogin}>
              Login
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  )
}

const GoogleLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [firebaseErr, setFirebaseErr] = useState('');

  const googleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(firebaseAuth, provider)
      .then((data) => {
        login(data.user);
        navigate('/main');
      })
      .catch((error) => {
        setFirebaseErr(error.message);
      });
  }

  return (
    <Card>
      <Card.Body>
        <GoogleLogo onClick={googleLogin} className='mb-2'/>
        <h5 style={{color: 'red'}}>{firebaseErr}</h5>
        <p>만약 HardTrip계정이 없을 경우 구글 계정으로 자동생성됩니다</p>
      </Card.Body>
    </Card>
  )
}

const EmailJoin = () => {
  //https://firebase.google.com/docs/auth/web/start?hl=ko
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [showWarning1, setShowWarning1] = useState(false);
  const [showWarning2, setShowWarning2] = useState(false);
  const [firebaseErr, setFirebaseErr] = useState('');

  const handleJoin = () => {
    //1. email 양식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailResult = emailRegex.test(email);
    setShowWarning1(!emailResult);
    //2. 비밀번호 일치 여부
    const pwResult = password === verifyPassword;
    setShowWarning2(!pwResult);

    if(emailResult && pwResult){
      createUserWithEmailAndPassword(firebaseAuth, email, password)
        .then((data) => {
          navigate('/login');
          setFirebaseErr('');
        })
        .catch((error) => {
          setFirebaseErr(error.message);
        });
    }
  };

  return (
    <Card>
      <Card.Body>
        <Form>
          <Form.Group  className='text-align-left mb-2'>
            <Form.Label>Email 주소</Form.Label>
            <Form.Control className='mb-2'
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Form.Label>비밀번호</Form.Label>
            <Form.Control className='mb-2'
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Form.Label>비밀번호 확인</Form.Label>
            <Form.Control
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={verifyPassword}
              onChange={(e) => setVerifyPassword(e.target.value)}
            />
          </Form.Group>
          { showWarning1 && <h5 style={{color: 'red'}}>Invalid Email</h5> }
          { showWarning2 && <h5 style={{color: 'red'}}>Invalid Password</h5> }
          <h5 style={{color: 'red'}}>{firebaseErr}</h5>

          <Button variant="primary" type="button" onClick={handleJoin} disabled={!email || !password || !verifyPassword}>
            Sign Up
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}