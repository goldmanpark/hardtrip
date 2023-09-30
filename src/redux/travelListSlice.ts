import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../config/firebase';
import { doc, setDoc, collection, getDocs, addDoc, QuerySnapshot, deleteDoc } from 'firebase/firestore'
import { query, where } from 'firebase/firestore'
import { ITravel } from '../DataType/Travel';
import { IPlace } from '../DataType/Place';

//#region [Travel CRUD]
interface TravelParam{
  id?: string;
  uid?: string;
  name?: string;
}

const travelCollectionRef = collection(db, "travel");

export const readTravelList = createAsyncThunk(
  'travelList/readTravelList',
  async (uid: string) => {
    try {
      const qr = query(travelCollectionRef, where('uid', '==', uid));
      const docSnap = await getDocs(qr);
      const travelList = [];

      if (docSnap instanceof QuerySnapshot){
        for(const doc of docSnap.docs){
          const travelData = { id: doc.id, ...doc.data() } as ITravel;
          const placesRef = collection(doc.ref, 'places');
          const placesSnap = await getDocs(placesRef);

          if (placesSnap instanceof QuerySnapshot) {
            travelData.places = placesSnap.docs.map((placeDoc) => ({
              id: placeDoc.id, ...placeDoc.data(),
            })) as IPlace[];
          } else {
            travelData.places = [];
          }
          travelList.push(travelData);
        }        
      }
      return travelList;
    } catch (error) {
      console.error(error);
    }
  }
)

export const createTravel = createAsyncThunk(
  'travelList/createTravel',
  async (param: TravelParam) => {
    try {      
      const docRef = await addDoc(travelCollectionRef, {
        uid: param.uid,
        name: param.name
      }); //doc_id자동생성

      return {
        id: docRef.id,
        uid: param.uid,
        name: param.name,
        places: []
      } as ITravel;
    } catch (error) {
      console.error(error);
    }
  }
)

export const updateTravel = createAsyncThunk(
  'travelList/updateTravel',
  async (param: ITravel) => {
    try {
      await setDoc(doc(db, 'travel', param.id), {
        name: param.name
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

interface AddPlaceParam{
  travelId: string;
  place: IPlace;
}

export const addPlace2Travel = createAsyncThunk(
  'travelList/addPlace2Travel',
  async (param: AddPlaceParam) => {
    try{
      const travelDocRef = doc(travelCollectionRef, param.travelId);
      const placeSubCollection = collection(travelDocRef, 'places');

      await addDoc(placeSubCollection, param.place)
      .then((docRef) => {
        console.log("Place가 성공적으로 추가되었습니다. Place 문서 ID:", docRef.id);
      })
      .catch((error) => {
        console.error("Place 추가 중 오류 발생:", error);
      });
    } catch(error){
      console.error(error);
    }
  }
)

const travelListSlice = createSlice({
  name : 'travelList',
  initialState : [],
  reducers : {

  },
  extraReducers: (builder) => {
    builder.addCase(readTravelList.fulfilled, (state, action) => {
      return action.payload;
    });
    builder.addCase(createTravel.fulfilled, (state, action) => {
      return [...state, action.payload];
    });
    builder.addCase(updateTravel.fulfilled, (state, action) => {
      return state.map(x => x.id === action.payload.id ? action.payload : x);
    });
    builder.addCase(deleteTravel.fulfilled, (state, action) => {
      return state.filter(x => x.id !== action.payload)
    });
  },
})

export default travelListSlice.reducer;