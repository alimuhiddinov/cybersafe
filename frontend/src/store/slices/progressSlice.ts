import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
interface UserProgress {
  id: string;
  userId: string;
  moduleId: string;
  completed: boolean;
  score: number;
  lastAccessedAt: string;
  completedAt?: string;
}

interface UserActivity {
  id: string;
  type: 'MODULE_START' | 'MODULE_COMPLETE' | 'ASSESSMENT_START' | 'ASSESSMENT_COMPLETE' | 'BADGE_EARNED';
  timestamp: string;
  moduleId?: string;
  assessmentId?: string;
  badgeId?: string;
  score?: number;
}

interface UserStats {
  modulesCompleted: number;
  assessmentsTaken: number;
  totalScore: number;
  averageScore: number;
  badgesEarned: number;
  timeSpentMinutes: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  unlockedAt: string;
}

interface ProgressState {
  userProgress: UserProgress[];
  activities: UserActivity[];
  stats: UserStats;
  achievements: Achievement[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: ProgressState = {
  userProgress: [],
  activities: [],
  stats: {
    modulesCompleted: 0,
    assessmentsTaken: 0,
    totalScore: 0,
    averageScore: 0,
    badgesEarned: 0,
    timeSpentMinutes: 0,
  },
  achievements: [],
  loading: false,
  error: null,
};

// Async actions
export const fetchUserProgress = createAsyncThunk(
  'progress/fetchUserProgress',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/users/${userId}/progress`);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch user progress');
    }
  }
);

export const fetchUserActivities = createAsyncThunk(
  'progress/fetchUserActivities',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/users/${userId}/activities`);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch user activities');
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'progress/fetchUserStats',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/users/${userId}/stats`);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch user stats');
    }
  }
);

export const fetchUserAchievements = createAsyncThunk(
  'progress/fetchUserAchievements',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/users/${userId}/achievements`);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch user achievements');
    }
  }
);

export const updateUserProgress = createAsyncThunk(
  'progress/updateUserProgress',
  async ({ userId, moduleId, data }: { userId: string; moduleId: string; data: Partial<UserProgress> }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/users/${userId}/progress/${moduleId}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to update user progress');
    }
  }
);

// Slice
const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    resetProgress: (state) => {
      state.userProgress = [];
      state.activities = [];
      state.stats = initialState.stats;
      state.achievements = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user progress
      .addCase(fetchUserProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProgress.fulfilled, (state, action: PayloadAction<UserProgress[]>) => {
        state.loading = false;
        state.userProgress = action.payload;
      })
      .addCase(fetchUserProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch user activities
      .addCase(fetchUserActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserActivities.fulfilled, (state, action: PayloadAction<UserActivity[]>) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchUserActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch user stats
      .addCase(fetchUserStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action: PayloadAction<UserStats>) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch user achievements
      .addCase(fetchUserAchievements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAchievements.fulfilled, (state, action: PayloadAction<Achievement[]>) => {
        state.loading = false;
        state.achievements = action.payload;
      })
      .addCase(fetchUserAchievements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update user progress
      .addCase(updateUserProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProgress.fulfilled, (state, action: PayloadAction<UserProgress>) => {
        state.loading = false;
        const index = state.userProgress.findIndex(
          (progress) => progress.id === action.payload.id
        );
        if (index !== -1) {
          state.userProgress[index] = action.payload;
        } else {
          state.userProgress.push(action.payload);
        }
      })
      .addCase(updateUserProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetProgress } = progressSlice.actions;
export const progressReducer = progressSlice.reducer;
