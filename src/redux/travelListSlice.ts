import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../config/firebase';
import { doc, setDoc, collection, getDocs, addDoc, QuerySnapshot, deleteDoc, getDoc, updateDoc } from 'firebase/firestore'
import { query, where } from 'firebase/firestore'
import { TravelFireStore, TravelRedux, TravelFS2Redux, Travel } from '../DataType/Travel';
import { PlaceFireStore, PlaceRedux, PlaceFS2Redux, PlaceRedux2FS, Place } from '../DataType/Place';

interface PlaceParam{
  travelId: string;
  place: PlaceRedux;
}

interface PlaceParamList{
  travelId: string;
  placeList: Place[];
}

//#region [Travel CRUD]
const travelCollectionRef = collection(db, "travel");

export const readTravelList = createAsyncThunk(
  'travelList/readTravelList',
  async (uid: string) => {
    try {
      const qr = query(travelCollectionRef, where('uid', '==', uid));
      const docSnap = await getDocs(qr);

      if (docSnap instanceof QuerySnapshot){
        //TravelFireStore -> TravelRedux 변환
        const fsList = docSnap.docs.map(doc => ({id: doc.id, ...doc.data()} as TravelFireStore));
        const rdList = fsList.map(x => (TravelFS2Redux(x))).sort((x, y) => x.startDateSeconds - y.startDateSeconds);
        return rdList;        
      } else {
        return [];
      }
    } catch (error) {
      console.error(error);
    }
  }
)

export const readTravel = createAsyncThunk(
  'travelList/readTravel',
  async (id: string) => {
    try {
      const docSnap = await getDoc(doc(db, 'travel', id));
      if(docSnap.exists()){
        const fs = { id: docSnap.id, ...docSnap.data() } as TravelFireStore;
        return TravelFS2Redux(fs);
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
        startDate: param.startDate, //Timestamp 자동변환
        endDate: param.endDate
      }); //doc_id자동생성

      const redux: TravelRedux = param.getRedux();
      redux.id = docRef.id;
      return redux;
    } catch (error) {
      console.error(error);
    }
  }
)

export const updateTravel = createAsyncThunk(
  'travelList/updateTravel',
  async (param: Travel) => {
    try {
      await updateDoc(doc(db, 'travel', param.id), {
        name: param.name,
        startDate: param.startDate,
        endDate: param.endDate
      });
      return param;
    } catch (error) {
      console.error(error);
    }
  }
)

export const deleteTravel = createAsyncThunk(
  'travelList/deleteTravel',
  async (id: string) => {
    try {
      await deleteDoc(doc(db, 'travel', id));
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
      const querySnap = await getDocs(collection(db, "travel", travelId, 'places'));
      const fsList = querySnap.docs.map(x => ({id: x.id, ...x.data()} as TravelFireStore));
      return {
        id: travelId,
        places: fsList.map(x => (TravelFS2Redux(x)))
      }
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
      const placeDocRef = await addDoc(placeSubCollection, PlaceRedux2FS(param.place));
      return {
        id: param.travelId,
        place: {...param.place, id: placeDocRef.id} as PlaceRedux
      };
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
        const placeDocRef = doc(placeSubCollection, place.id);
        await setDoc(placeDocRef, place as unknown as PlaceFireStore);
      }

      return {
        travelId: param.travelId,
        updateIdList: param.placeList.map(x => (x.getRedux()))
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
  initialState : [],
  reducers : {},
  extraReducers: (builder) => {
    builder.addCase(readTravelList.fulfilled, (state, action) => {
      return action.payload;
    });
    builder.addCase(createTravel.fulfilled, (state, action) => {
      return [...state, action.payload];
    });
    builder.addCase(readTravel.fulfilled, (state, action) => {
      return state.map(x => x.id === action.payload.id ? action.payload : x);
    });
    builder.addCase(updateTravel.fulfilled, (state, action) => {
      return state.map(x => x.id === action.payload.id ? action.payload : x);
    });
    builder.addCase(deleteTravel.fulfilled, (state, action) => {
      return state.filter(x => x.id !== action.payload)
    });
    builder.addCase(readPlaceList.fulfilled, (state, action) => {
      return state.map(x => x.id === action.payload.id ? {...x, places: action.payload.places} : x);
    });
    builder.addCase(createPlace.fulfilled, (state, action) => {
      return state.map((x: TravelRedux) => {
        if(x.id !== action.payload.id){
          return x;
        } else {
          return {
            ...x,
            places: [...(x.places || []), action.payload.place]
          } as TravelRedux;
        }
      });
    });
    builder.addCase(updatePlaceList.fulfilled, (state, action) => {
      const item = action.payload;
      return state.map((x: TravelRedux) => {
        if(x.id !== item.travelId){
          return x;
        } else {
          return {
            ...x,
            places: x.places.map(y => {
              const updated = item.updateIdList.find(z => z.id === y.id);
              return updated || y;
            })
          } as TravelRedux;
        }
      });
    });
    builder.addCase(deletePlaceList.fulfilled, (state, action) => {
      const item = action.payload;
      return state.map((x: TravelRedux) => {
        if(x.id !== item.travelId){
          return x;
        } else {
          return {
            ...x,
            places: x.places.filter(y => !item.deletedIdList.some(z => z === y.id))
          } as TravelRedux;
        }
      });
    });
  },
})

export default travelListSlice.reducer;