import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
interface Feedback {
  id: string;
  userId: string;
  content: string;
  category: 'BUG' | 'FEATURE_REQUEST' | 'CONTENT_ISSUE' | 'GENERAL';
  rating?: number;
  moduleId?: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
}

interface FeedbackAnalytics {
  totalFeedbacks: number;
  averageRating: number;
  categoryCounts: {
    BUG: number;
    FEATURE_REQUEST: number;
    CONTENT_ISSUE: number;
    GENERAL: number;
  };
  statusCounts: {
    PENDING: number;
    REVIEWED: number;
    RESOLVED: number;
  };
}

interface FeedbackState {
  feedbacks: Feedback[];
  currentFeedback: Feedback | null;
  analytics: FeedbackAnalytics | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: FeedbackState = {
  feedbacks: [],
  currentFeedback: null,
  analytics: null,
  loading: false,
  error: null,
};

// Async actions
export const fetchFeedbacks = createAsyncThunk(
  'feedback/fetchFeedbacks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/feedbacks');
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch feedbacks');
    }
  }
);

export const fetchFeedbackById = createAsyncThunk(
  'feedback/fetchFeedbackById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/feedbacks/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch feedback');
    }
  }
);

export const submitFeedback = createAsyncThunk(
  'feedback/submitFeedback',
  async (data: Omit<Feedback, 'id' | 'status' | 'createdAt' | 'resolvedAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/feedbacks', data);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to submit feedback');
    }
  }
);

export const updateFeedbackStatus = createAsyncThunk(
  'feedback/updateFeedbackStatus',
  async ({ id, status }: { id: string; status: 'REVIEWED' | 'RESOLVED' }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/feedbacks/${id}`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to update feedback status');
    }
  }
);

export const fetchFeedbackAnalytics = createAsyncThunk(
  'feedback/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/feedbacks/analytics');
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch feedback analytics');
    }
  }
);

// Slice
const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    clearCurrentFeedback: (state) => {
      state.currentFeedback = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch feedbacks
      .addCase(fetchFeedbacks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbacks.fulfilled, (state, action: PayloadAction<Feedback[]>) => {
        state.loading = false;
        state.feedbacks = action.payload;
      })
      .addCase(fetchFeedbacks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch feedback by ID
      .addCase(fetchFeedbackById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbackById.fulfilled, (state, action: PayloadAction<Feedback>) => {
        state.loading = false;
        state.currentFeedback = action.payload;
      })
      .addCase(fetchFeedbackById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Submit feedback
      .addCase(submitFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitFeedback.fulfilled, (state, action: PayloadAction<Feedback>) => {
        state.loading = false;
        state.feedbacks.push(action.payload);
        state.currentFeedback = action.payload;
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update feedback status
      .addCase(updateFeedbackStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFeedbackStatus.fulfilled, (state, action: PayloadAction<Feedback>) => {
        state.loading = false;
        const index = state.feedbacks.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) {
          state.feedbacks[index] = action.payload;
        }
        if (state.currentFeedback?.id === action.payload.id) {
          state.currentFeedback = action.payload;
        }
      })
      .addCase(updateFeedbackStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch feedback analytics
      .addCase(fetchFeedbackAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbackAnalytics.fulfilled, (state, action: PayloadAction<FeedbackAnalytics>) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchFeedbackAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentFeedback } = feedbackSlice.actions;
export const feedbackReducer = feedbackSlice.reducer;
