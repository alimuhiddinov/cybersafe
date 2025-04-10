import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
interface Module {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  prerequisites: string[];
  tags: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ModuleState {
  modules: Module[];
  currentModule: Module | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: ModuleState = {
  modules: [],
  currentModule: null,
  loading: false,
  error: null,
};

// Async actions
export const fetchAllModules = createAsyncThunk(
  'modules/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/modules');
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch modules');
    }
  }
);

export const fetchModuleById = createAsyncThunk(
  'modules/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/modules/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch module');
    }
  }
);

// Slice
const moduleSlice = createSlice({
  name: 'modules',
  initialState,
  reducers: {
    clearCurrentModule: (state) => {
      state.currentModule = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all modules
      .addCase(fetchAllModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllModules.fulfilled, (state, action: PayloadAction<Module[]>) => {
        state.loading = false;
        state.modules = action.payload;
      })
      .addCase(fetchAllModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch module by ID
      .addCase(fetchModuleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModuleById.fulfilled, (state, action: PayloadAction<Module>) => {
        state.loading = false;
        state.currentModule = action.payload;
      })
      .addCase(fetchModuleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentModule } = moduleSlice.actions;
export const moduleReducer = moduleSlice.reducer;
