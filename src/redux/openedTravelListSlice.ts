import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fireStoreDB } from '../config/firebase';
import { collection, getDocs, QuerySnapshot } from 'firebase/firestore'
import { query, where } from 'firebase/firestore'
import { TravelSerialized } from '../DataType/Travel';
import { PlaceSerialized } from '../DataType/Place';

interface State{
  list: TravelSerialized[];
  selectedIdx: number;
}

const initialState: State = {
  list: [],
  selectedIdx: -1
}

const travelCollectionRef = collection(fireStoreDB, "travel");

export const readOpenedTravelList = createAsyncThunk(
  'openedTravelList/readOpenedTravelList',
  async (uid: string) => {
    try {
      const qr = query(travelCollectionRef, where('uid', '!=', uid), where('opened', '==', true));
      const docSnap = await getDocs(qr);

      if (docSnap instanceof QuerySnapshot){
        const fsList = docSnap.docs.map(doc => ({id: doc.id, ...doc.data()}));
        const rdList = fsList.map((x: any) => ({
          ...x,
          startDate: x.startDate?.toDate().getTime(),
          endDate: x.endDate?.toDate().getTime()
        } as TravelSerialized)).sort((x, y) => x.startDate - y.startDate);
        return rdList;        
      } else {
        return [];
      }
    } catch (error) {
      console.error(error);
    }
  }
)

export const readOpenedPlaceList = createAsyncThunk(
  'travelList/readPlaceList',
  async (travelId: string) => {
    try{
      const querySnap = await getDocs(collection(fireStoreDB, "travel", travelId, 'places'));
      const fsList = querySnap.docs.map(x => ({id: x.id, ...x.data()}));
      return {
        id: travelId,
        places: fsList.map((x: any) => ({
          ...x,
          startDTTM: x.startDTTM?.toDate().getTime(),
          endDTTM: x.endDTTM?.toDate().getTime()
        } as PlaceSerialized))
      };
    } catch(error){
      console.error(error);
    }
  }
)

const openedTravelListSlice = createSlice({
  name : 'travelList',
  initialState : initialState,
  reducers : {
    setSelectedOpenedIdx: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        selectedIdx : action.payload
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(readOpenedTravelList.fulfilled, (state, action) => {
      return {
        selectedIdx: -1,
        list : action.payload
      };
    });
    builder.addCase(readOpenedPlaceList.fulfilled, (state, action) => {
      return {
        ...state,
        list : state.list.map(x => 
          x.id === action.payload.id 
            ? {...x, places: action.payload.places} 
            : x
        )
      };
    });
  },
})

export const { setSelectedOpenedIdx } = openedTravelListSlice.actions;
export default openedTravelListSlice.reducer;