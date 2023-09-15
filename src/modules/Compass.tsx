import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompass } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch } from '../redux/store';
import { setCurrentLatLng } from '../redux/selectedLatLngSlice';

const Compass = () => {
  const dispatch = useAppDispatch();

  const getCurrentPos = () => {
    dispatch(setCurrentLatLng());
  }

  return (    
    <button className='CompassButton' onClick={getCurrentPos}>
      <FontAwesomeIcon icon={faCompass} size={window.innerWidth <= 768 ? 'lg' : '2xl'} style={{color: '#2196F3'}}/>
    </button>
  )
}

export default Compass;