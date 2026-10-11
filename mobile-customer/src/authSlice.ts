import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { AppDispatch } from "./store";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "provider";
  phone: string;
}

interface Session {
  token: string;
  user: User;
}

interface AuthState {
  token: string | null;
  user: User | null;
  ready: boolean;
}

const initialState: AuthState = { token: null, user: null, ready: false };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<Session>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.ready = true;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
    noSavedSession: (state) => {
      state.ready = true;
    },
  },
});

const { login, logout, noSavedSession } = authSlice.actions;
export default authSlice.reducer;

const KEY = "session";

// SecureStore has no web support, so the browser preview falls back to localStorage.
const storage = {
  get: async () => (Platform.OS === "web" ? localStorage.getItem(KEY) : SecureStore.getItemAsync(KEY)),
  set: async (value: string) =>
    Platform.OS === "web" ? localStorage.setItem(KEY, value) : SecureStore.setItemAsync(KEY, value),
  remove: async () => (Platform.OS === "web" ? localStorage.removeItem(KEY) : SecureStore.deleteItemAsync(KEY)),
};

export const signIn = (session: Session) => async (dispatch: AppDispatch) => {
  await storage.set(JSON.stringify(session));
  dispatch(login(session));
};

export const signOut = () => async (dispatch: AppDispatch) => {
  await storage.remove();
  dispatch(logout());
};

export const restoreSession = () => async (dispatch: AppDispatch) => {
  const saved = await storage.get();
  if (saved) dispatch(login(JSON.parse(saved)));
  else dispatch(noSavedSession());
};
