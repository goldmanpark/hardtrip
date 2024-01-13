import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './modules/css/custom_button.css'
import './modules/css/custom_place.css'
import './modules/css/custom_etc.css';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { SignForm } from './modules/SignForm';
import { Suspense, lazy } from 'react';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <AppRoutes/>
      </AuthProvider>
    </div>
  );
}

function AppRoutes() {
  const { userData } = useAuth();  

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={userData ? <Navigate to='/main'/> : <Navigate to='/login'/>}/>
        <Route path="/login" element={<SignForm/>}/>
        <Route path="/main" element={userData ? <Main/> : <Navigate to='/login'/>} />
      </Routes>
    </BrowserRouter>
  )
}

function Main() {
  const MainComponent = window.innerWidth <= 768
    ? lazy(() => import('./modules/MainMobile'))
    : lazy(() => import('./modules/MainDesktop'))
  
  return(
    <Suspense>
      <MainComponent/>
    </Suspense>
  )
}

export default App;
