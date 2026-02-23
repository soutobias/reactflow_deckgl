import { configureStore } from "@reduxjs/toolkit";
import layersReducer from "./layersSlice";

export const store = configureStore({
  reducer: { layers: layersReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
