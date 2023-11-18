import { Place } from "./Place";
import LocalAirportIcon from '@mui/icons-material/LocalAirport';
import MuseumIcon from '@mui/icons-material/Museum';
import ParkIcon from '@mui/icons-material/Park';
import TourIcon from '@mui/icons-material/Tour';
import DirectionsSubwayIcon from '@mui/icons-material/DirectionsSubway';
import PlaceIcon from '@mui/icons-material/Place';
import HotelIcon from '@mui/icons-material/Hotel';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const GetPlaceIcon = (place: Place) => {
  switch(place.type){
    case 'airport':
      return <LocalAirportIcon/>
    case 'landmark':
    case 'tourist_attraction':
    case 'point_of_interest':
    case 'place_of_worship':
      return <TourIcon/>
    case 'subway_station':
      return <DirectionsSubwayIcon/>
    case 'park':
      return <ParkIcon/>    
    case 'museum':
      return <MuseumIcon/>
    case 'lodging':
      return <HotelIcon/>
    case 'restaurant':
      return <RestaurantIcon/>
    default:
      return <PlaceIcon/>
  }
}

export default GetPlaceIcon;