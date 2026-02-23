import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type RenderLayer = {
  id: string;
  sourceNodeId: string;
  url: string;
  order: number;
  y: number;
};

type LayersState = { layers: RenderLayer[] };

const initialState: LayersState = { layers: [] };

const layersSlice = createSlice({
  name: 'layers',
  initialState,
  reducers: {
    setLayers(state, action: PayloadAction<RenderLayer[]>) {
      state.layers = action.payload;
    },
    clearLayers(state) {
      state.layers = [];
    }
  }
});

export const { setLayers, clearLayers } = layersSlice.actions;
export default layersSlice.reducer;
