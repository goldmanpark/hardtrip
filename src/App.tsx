import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { SignForm } from './modules/SignForm';
import Main from './modules/Main';

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

export default App;
