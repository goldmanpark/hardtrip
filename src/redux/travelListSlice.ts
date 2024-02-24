import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fireStoreDB } from '../config/firebase';
import { doc, setDoc, collection, getDocs, addDoc, QuerySnapshot, deleteDoc, getDoc, updateDoc } from 'firebase/firestore'
import { query, where } from 'firebase/firestore'
import { Travel, TravelSerialized, serializeTravel } from '../DataType/Travel';
import { Place, PlaceSerialized, serializePlace } from '../DataType/Place';

interface PlaceParam{
  travelId: string;
  place: Place;
}

interface PlaceParamList{
  travelId: string;
  placeList: Place[];
}

interface State{
  list: TravelSerialized[];
  selectedIdx: number;
}

const initialState: State = {
  list: [],
  selectedIdx: -1
}

//#region [Travel CRUD]
const travelCollectionRef = collection(fireStoreDB, "travel");

export const readTravelList = createAsyncThunk(
  'travelList/readTravelList',
  async (uid: string) => {
    try {
      const qr = query(travelCollectionRef, where('uid', '==', uid));
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

export const createTravel = createAsyncThunk(
  'travelList/createTravel',
  async (param: Travel) => {
    try {
      const docRef = await addDoc(travelCollectionRef, {
        uid: param.uid,
        name: param.name,
        opened: param.opened,
        ...(param.startDate && { startDate: param.startDate }),
        ...(param.endDate && { endDate: param.endDate })
      }); //doc_id자동생성

      const ser = serializeTravel(param);
      ser.id = docRef.id;
      return ser;
    } catch (error) {
      console.error(error);
    }
  }
)

export const updateTravel = createAsyncThunk(
  'travelList/updateTravel',
  async (param: Travel) => {
    try {
      await updateDoc(doc(fireStoreDB, 'travel', param.id), {
        name: param.name,
        opened: param.opened,
        startDate: param.startDate,
        endDate: param.endDate
      });

      return serializeTravel(param);
    } catch (error) {
      console.error(error);
    }
  }
)

export const deleteTravel = createAsyncThunk(
  'travelList/deleteTravel',
  async (id: string) => {
    try {
      await deleteDoc(doc(fireStoreDB, 'travel', id));
      return id;
    } catch (error) {
      console.error(error);
    }
  }
)
//#endregion

//#region [Place CRUD]
export const readPlaceList = createAsyncThunk(
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

export const createPlace = createAsyncThunk(
  'travelList/createPlace',
  async (param: PlaceParam) => {
    try{
      const travelDocRef = doc(travelCollectionRef, param.travelId);
      const placeSubCollection = collection(travelDocRef, 'places');
      const placeDocRef = await addDoc(placeSubCollection, param.place);
      const ser = serializePlace(param.place);
      ser.id = placeDocRef.id;

      return { id: param.travelId, place: ser };
    } catch(error){
      console.error(error);
    }
  }
)

export const updatePlaceList = createAsyncThunk(
  'travelList/updatePlaceList',
  async (param: PlaceParamList) => {
    try{
      const travelDocRef = doc(travelCollectionRef, param.travelId);
      const placeSubCollection = collection(travelDocRef, 'places');

      for(const place of param.placeList){
        console.log(place)
        const placeDocRef = doc(placeSubCollection, place.id);
        await setDoc(placeDocRef, {
          place_id: place.place_id,
          name: place.name,
          latLng: place.latLng,
          type: place.type,
          ...(typeof(place.day) === 'number' && { day: place.day }),
          ...(place.startDTTM && { startDTTM: place.startDTTM }),
          ...(place.endDTTM && { endDTTM: place.endDTTM })
        });
      }

      return {
        travelId: param.travelId,
        updateIdList: param.placeList.map(x => (serializePlace(x)))
      };
    } catch(error){
      console.error(error);
    }
  }
)

export const deletePlaceList = createAsyncThunk(
  'travelList/deletePlaceList',
  async (param: PlaceParamList) => {
    try{
      const travelDocRef = doc(travelCollectionRef, param.travelId);
      const placeSubCollection = collection(travelDocRef, 'places');

      for(const place of param.placeList){
        const placeDocRef = doc(placeSubCollection, place.id);
        await deleteDoc(placeDocRef);
      }

      return {
        travelId: param.travelId,
        deletedIdList: param.placeList.map(x => x.id)
      };
    } catch(error){
      console.error(error);
    }
  }
)
//#endregion

const travelListSlice = createSlice({
  name : 'travelList',
  initialState : initialState,
  reducers : {
    setSelectedIdx: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        selectedIdx : action.payload
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(readTravelList.fulfilled, (state, action) => {
      return {
        ...state,
        list : action.payload
      };
    });
    builder.addCase(createTravel.fulfilled, (state, action) => {
      return {
        ...state,
        list : [...state.list, action.payload]
      };
    });
    builder.addCase(updateTravel.fulfilled, (state, action) => {
      return {
        ...state,
        list : state.list.map(x => x.id === action.payload.id ? action.payload : x)
      };
    });
    builder.addCase(deleteTravel.fulfilled, (state, action) => {
      return {
        ...state,
        list : state.list.filter(x => x.id !== action.payload)
      };
    });
    builder.addCase(readPlaceList.fulfilled, (state, action) => {
      return {
        ...state,
        list : state.list.map(x => 
          x.id === action.payload.id 
            ? {...x, places: action.payload.places} 
            : x
        )
      };
    });
    builder.addCase(createPlace.fulfilled, (state, action) => {
      return {
        ...state,
        list : state.list.map(x => {
          if(x.id !== action.payload.id){
            return x;
          } else {
            return {
              ...x,
              places: [...(x.places || []), action.payload.place]
            };
          }
        })
      };
    });
    builder.addCase(updatePlaceList.fulfilled, (state, action) => {
      const item = action.payload;
      return {
        ...state,
        list : state.list.map(x => {
          if(x.id !== item.travelId){
            return x;
          } else {
            return {
              ...x,
              places: x.places.map(y => {
                const updated = item.updateIdList.find(z => z.id === y.id);
                return updated || y;
              })
            };
          }
        })
      };
    });
    builder.addCase(deletePlaceList.fulfilled, (state, action) => {
      const item = action.payload;
      return {
        ...state,
        list : state.list.map(x => {
          if(x.id !== item.travelId){
            return x;
          } else {
            return {
              ...x,
              places: x.places.filter(y => !item.deletedIdList.some(z => z === y.id))
            };
          }
        })
      };
    });
  },
})

export const { setSelectedIdx } = travelListSlice.actions;
export default travelListSlice.reducer;