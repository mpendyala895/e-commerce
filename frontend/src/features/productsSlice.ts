import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../types';

interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedCategory: string;
  sortBy: string;
}

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
  searchTerm: '',
  selectedCategory: '',
  sortBy: '',
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    fetchStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchSuccess(state, action: PayloadAction<Product[]>) {
      state.loading = false;
      state.items = action.payload;
      state.error = null;
    },
    fetchFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },
    setSelectedCategory(state, action: PayloadAction<string>) {
      state.selectedCategory = action.payload;
    },
    setSortBy(state, action: PayloadAction<string>) {
      state.sortBy = action.payload;
    },
    resetFilters(state) {
      state.searchTerm = '';
      state.selectedCategory = '';
      state.sortBy = '';
    },
  },
});

export const {
  fetchStart,
  fetchSuccess,
  fetchFailure,
  setSearchTerm,
  setSelectedCategory,
  setSortBy,
  resetFilters,
} = productsSlice.actions;

export default productsSlice.reducer;
