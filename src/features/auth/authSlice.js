import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuth: false,
  profileDetails: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload;
      state.isAuth = true;
    },
    logOut: (state) => {
      state.user = null;
      state.isAuth = false;
      state.profileDetails = null;
    },
    userProfile: (state, action) => {
      state.profileDetails = action.payload;
    },
  },
});

export const { setCredentials, logOut, userProfile } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuth = (state) => state.auth.isAuth;
export const selectProfile = (state) => state.auth.profileDetails;
