import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../config/firebase';
import { doc, setDoc, collection, getDocs, addDoc, QuerySnapshot } from 'firebase/firestore'
import { query, where } from 'firebase/firestore'
import { Travel } from '../DataType/Travel';
import { Place } from '../DataType/Place';

const travelCollectionRef = collection(db, "travel");
const placeCollectionRef = collection(db, "place");

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
      //doc_id자동생성
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

interface AddPlaceParam{
  travel_doc_id: string;
  place: Place;
}

export const addPlace2Travel = createAsyncThunk(
  'travelList/addPlace2Travel',
  async (param: AddPlaceParam) => {
    try{      
      const travelDocRef = doc(travelCollectionRef, param.travel_doc_id);
      const placeSubCollection = collection(travelDocRef, 'places');

      addDoc(placeSubCollection, param.place)
      .then((docRef) => {
        console.log("Place가 성공적으로 추가되었습니다. Place 문서 ID:", docRef.id);
      })
      .catch((error) => {
        console.error("Place 추가 중 오류 발생:", error);
      });
    } catch(error){
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