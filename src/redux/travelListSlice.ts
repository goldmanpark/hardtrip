import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../config/firebase';
import { doc, setDoc, collection, getDocs, addDoc, QuerySnapshot } from 'firebase/firestore'
import { query, where } from 'firebase/firestore'
import { ITravel } from '../DataType/Travel';
import { IPlace } from '../DataType/Place';

const travelCollectionRef = collection(db, "travel");

export const getTravelListFromDB = createAsyncThunk(
  'travelList/getTravelListFromDB',
  async (uid: string) => {
    try {
      const qr = query(travelCollectionRef, where('uid', '==', uid));
      const docSnap = await getDocs(qr);

      if(docSnap instanceof QuerySnapshot){
        return docSnap.docs.map((doc) => {
          return { id: doc.id, ...doc.data() } as ITravel;
        });
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
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
      console.log(error);
    }
  }
)

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
      console.log(error);
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