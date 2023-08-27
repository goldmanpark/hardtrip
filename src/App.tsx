import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider } from './AuthContext';
import Main from './modules/Main';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Main/>
      </AuthProvider>
    </div>
  );
}

export default App;
