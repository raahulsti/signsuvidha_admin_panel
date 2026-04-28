import { createSlice } from '@reduxjs/toolkit';

const loadUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch { return null; }
};

const isSuperAdmin = (user) => {
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  return roles.includes('super_admin');
};

const bootstrapAuth = () => {
  const user = loadUser();
  const token = localStorage.getItem('accessToken');
  const isAuthenticated = Boolean(token && isSuperAdmin(user));
  if (!isAuthenticated && (token || user)) {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
  return { user: isAuthenticated ? user : null, token: isAuthenticated ? token : null, isAuthenticated };
};

const initialState = bootstrapAuth();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      if (!isSuperAdmin(user) || !accessToken) {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return;
      }
      state.user = user;
      state.token = accessToken;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
