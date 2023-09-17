import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc, QuerySnapshot } from 'firebase/firestore'
import { query, where } from 'firebase/firestore'
import Travel from '../DataType/Travel';

const travelCollectionRef = collection(db, "travel");

export const getTravelListFromDB = createAsyncThunk(
  'travelList/getTravelListFromDB',
  async (uid: string) => {
    try {
      const qr = query(travelCollectionRef, where('uid', '==', uid));
      const docSnap = await getDocs(qr);

      if(docSnap instanceof QuerySnapshot){
        return docSnap.docs.map((doc) => {
          let data = doc.data();
          return new Travel(doc.id, data.uid, data.name);
        });
      } else {
        return [];
      }
    } catch (error) {
      throw error;
    }
  }
)

interface AddParam{
  uid: string;
  name: string;
}

export const addTravel2DB = createAsyncThunk(
  'travelList/addTravel2DB',
  async (param: AddParam) => {
    try {
      await addDoc(travelCollectionRef, {
        uid: param.uid,
        name: param.name
      });
      return true;
    } catch (error) {
      throw error;
    }
  }
)

const travelListSlice = createSlice({
  name : 'travelList',
  initialState : [],
  reducers : {

  },
  extraReducers: (builder) => {
    builder.addCase(getTravelListFromDB.fulfilled, (state, action) => {
      return action.payload;
    });
    builder.addCase(addTravel2DB.fulfilled, (state, action) => {
      
    });
  },
})

export default travelListSlice.reducer;