import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import Coordinate from '../DataType/Coordinate';

export const setCurrentCoordinate = createAsyncThunk(
  'selectedCoordinate/setCurrentCoordinate',
  async () => {
    return new Promise<Coordinate>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          resolve({ lat, lng });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
);

const selectedCoordinateSlice = createSlice({
  name: 'selectedCoordinate',
  initialState: { lat: 0, lng: 0 },
  reducers: {
    setSelectedCoordinate: (state: Coordinate, action: PayloadAction<Coordinate>) => {
      state.lat = action.payload.lat;
      state.lng = action.payload.lng;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setCurrentCoordinate.fulfilled, (state, action) => {
      state.lat = action.payload.lat;
      state.lng = action.payload.lng;
    });
  },
});

export const { setSelectedCoordinate } = selectedCoordinateSlice.actions;
export default selectedCoordinateSlice.reducer;
