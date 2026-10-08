import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
  firstName?: string;
  lastName?: string;
  nickname?: string;
  avatar: string;
  coverPhoto?: string;
  bio?: string;
  headline?: string;
  website?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  country?: string;
  city?: string;
  address?: string;
  state?: string;
  postalCode?: string;
  nationality?: string;
  nationalId?: string;
  education?: {
    highestDegree?: string;
    institution?: string;
    fieldOfStudy?: string;
    graduationYear?: string;
  };
  experience?: {
    currentRole?: string;
    company?: string;
    industry?: string;
    yearsOfExperience?: string;
    skills?: string;
  };
  social?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  learningGoals?: string;
  preferredLanguage?: string;
  timeZone?: string;
  staffId?: string;
  department?: string;
  permissions?: string[];
  studentProfile?: {
    learningGoals?: string;
    preferredLanguage?: string;
    timeZone?: string;
    interests?: string[];
    bookmarkedCourses?: string[];
  };
  mentorProfile?: {
    headline?: string;
    bio?: string;
    website?: string;
    hrdcAccredited?: boolean;
    hrdcTrainerId?: string;
    courseCategories?: string[];
    yearsOfExperience?: string;
    hourlyRate?: number;
    skills?: string[];
    ratingAvg?: number;
    ratingCount?: number;
    bankAccount?: {
      bankName?: string;
      accountNo?: string;
      accountHolder?: string;
    };
  };
  adminProfile?: {
    staffId?: string;
    department?: string;
    permissions?: string[];
  };
  isActive?: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const getInitialState = (): AuthState => {
  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('fin2u_token');
      const userStr = localStorage.getItem('fin2u_user');
      if (token && userStr) {
        const user = JSON.parse(userStr);
        if (user && !user._id && user.id) user._id = user.id;
        return { user, token, isAuthenticated: true };
      }
    } catch { /* ignore */ }
  }
  return { user: null, token: null, isAuthenticated: false };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      const user = action.payload.user ? { ...action.payload.user } : action.payload.user;
      if (user && !user._id && (user as any).id) {
        user._id = (user as any).id;
      }
      state.user = user;
      state.token = action.payload.token;
      state.isAuthenticated = !!(user && action.payload.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('fin2u_token', action.payload.token);
        localStorage.setItem('fin2u_user', JSON.stringify(user));
      }
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fin2u_token');
        localStorage.removeItem('fin2u_user');
      }
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        const payloadData = (action.payload as any)?.data ? (action.payload as any).data : action.payload;
        state.user = { ...state.user, ...payloadData };
        if (state.user && !state.user._id && (state.user as any).id) {
          state.user._id = (state.user as any).id;
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('fin2u_user', JSON.stringify(state.user));
        }
      }
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
