import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './slices/authSlice';
import { moduleReducer } from './slices/moduleSlice';
import { progressReducer } from './slices/progressSlice';
import { feedbackReducer } from './slices/feedbackSlice';
import { uiReducer } from './slices/uiSlice';

// Configure the store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    modules: moduleReducer,
    progress: progressReducer,
    feedback: feedbackReducer,
    ui: uiReducer
  }
});

// Define RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
