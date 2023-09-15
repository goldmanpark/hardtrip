import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

//geolocation기능으로 현재 위치 추적
export const setCurrentLatLng = createAsyncThunk(
  'selectedCoordinate/setCurrentCoordinate',
  async () => {
    return new Promise<google.maps.LatLng>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          resolve(new google.maps.LatLng(lat, lng));
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
);

const selectedLatLngSlice = createSlice({
  name: 'selectedLatLng',
  initialState: { lat: 0, lng: 0 },
  reducers: {
    //외부 컴포넌트에서 직접 LatLng지정
    setSelectedLatLng: (state, action: PayloadAction<google.maps.LatLng>) => {
      state.lat = action.payload.lat();
      state.lng = action.payload.lng();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setCurrentLatLng.fulfilled, (state, action) => {
      state.lat = action.payload.lat();
      state.lng = action.payload.lng();
    });
  },
});

export const { setSelectedLatLng } = selectedLatLngSlice.actions;
export default selectedLatLngSlice.reducer;
