import { Place } from "./Place";
import LocalAirportIcon from '@mui/icons-material/LocalAirport';
import MuseumIcon from '@mui/icons-material/Museum';
import ParkIcon from '@mui/icons-material/Park';
import TourIcon from '@mui/icons-material/Tour';
import SubwayIcon from '@mui/icons-material/Subway';
import PlaceIcon from '@mui/icons-material/Place';
import HotelIcon from '@mui/icons-material/Hotel';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TrainIcon from '@mui/icons-material/Train';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LandscapeIcon from '@mui/icons-material/Landscape';

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
      return <SubwayIcon/>
    case 'train_station':
    case 'transit_station':
      return <TrainIcon/>
    case 'park':
      return <ParkIcon/>    
    case 'museum':
      return <MuseumIcon/>
    case 'lodging':
      return <HotelIcon/>
    case 'restaurant':
      return <RestaurantIcon/>
    case 'shopping_mall':
    case 'department_store':
      return <ShoppingCartIcon/>
    case 'natural_feature':
      return <LandscapeIcon/>
    default:
      return <PlaceIcon/>
  }
}

export default GetPlaceIcon;