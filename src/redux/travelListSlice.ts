import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../config/firebase';
import { doc, setDoc, collection, getDocs, addDoc, QuerySnapshot, deleteDoc, getDoc } from 'firebase/firestore'
import { query, where } from 'firebase/firestore'
import { ITravel } from '../DataType/Travel';

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
      
      if (docSnap instanceof QuerySnapshot){
        return docSnap.docs.map(doc => ({
          id: doc.id, ...doc.data()
        } as ITravel));        
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
        return { id: docSnap.id, ...docSnap.data() } as ITravel;
      }
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
  },
})

export default travelListSlice.reducer;