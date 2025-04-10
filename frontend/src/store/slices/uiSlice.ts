import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
interface ThemeState {
  darkMode: boolean;
}

interface LayoutState {
  sidebarOpen: boolean;
  isMobile: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  dismissed?: boolean;
  createdAt: number;
}

interface NotificationState {
  notifications: Notification[];
}

export interface UIState {
  theme: ThemeState;
  layout: LayoutState;
  notifications: NotificationState;
  isLoading: boolean;
}

// Initial state
const initialState: UIState = {
  theme: {
    darkMode: typeof window !== 'undefined' ? 
      localStorage.getItem('darkMode') === 'true' : 
      false
  },
  layout: {
    sidebarOpen: false,
    isMobile: typeof window !== 'undefined' ? 
      window.innerWidth < 768 : 
      false
  },
  notifications: {
    notifications: []
  },
  isLoading: false
};

// Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions
    toggleDarkMode: (state) => {
      state.theme.darkMode = !state.theme.darkMode;
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', state.theme.darkMode.toString());
      }
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.theme.darkMode = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', action.payload.toString());
      }
    },
    
    // Layout actions
    toggleSidebar: (state) => {
      state.layout.sidebarOpen = !state.layout.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.layout.sidebarOpen = action.payload;
    },
    setIsMobile: (state, action: PayloadAction<boolean>) => {
      state.layout.isMobile = action.payload;
    },
    
    // Notification actions
    addNotification: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'info' | 'warning';
      message: string;
    }>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: action.payload.type,
        message: action.payload.message,
        dismissed: false,
        createdAt: Date.now()
      };
      state.notifications.notifications.push(notification);
    },
    dismissNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.notifications.find(
        n => n.id === action.payload
      );
      if (notification) {
        notification.dismissed = true;
      }
    },
    clearNotifications: (state) => {
      state.notifications.notifications = [];
    },
    
    // Loading state
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    }
  }
});

export const { 
  toggleDarkMode, 
  setDarkMode, 
  toggleSidebar, 
  setSidebarOpen, 
  setIsMobile,
  addNotification,
  dismissNotification,
  clearNotifications,
  setIsLoading
} = uiSlice.actions;

export const uiReducer = uiSlice.reducer;
