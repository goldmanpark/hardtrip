import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import selectedLatLngSlice from './selectedLatLngSlice';
import travelListSlice from './travelListSlice';
import openedTravelListSlice from './openedTravelListSlice';

export const store = configureStore({
  reducer: {
    selectedLatLng: selectedLatLngSlice,
    travelList: travelListSlice,
    openedTravelList: openedTravelListSlice
  },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;