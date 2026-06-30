import { describe, it, expect, beforeEach } from 'vitest';
import authReducer, {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  registerStart,
  registerSuccess,
  registerFailure,
} from './authSlice';

describe('authSlice reducer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return the initial state', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    expect(state).toEqual({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  });

  it('should handle loginStart', () => {
    const state = authReducer(undefined, loginStart());
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle loginSuccess', () => {
    const user = { email: 'john@example.com', firstName: 'John', lastName: 'Doe' };
    const state = authReducer(
      undefined,
      loginSuccess({ user, token: 'fake-jwt-token' })
    );

    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
    expect(state.token).toBe('fake-jwt-token');
    expect(state.error).toBeNull();

    expect(localStorage.getItem('token')).toBe('fake-jwt-token');
    expect(JSON.parse(localStorage.getItem('user') || '{}')).toEqual(user);
  });

  it('should handle loginFailure', () => {
    const state = authReducer(undefined, loginFailure('Invalid credentials'));
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.error).toBe('Invalid credentials');
  });

  it('should handle registerStart', () => {
    const state = authReducer(undefined, registerStart());
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle registerSuccess', () => {
    const state = authReducer({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: true,
      error: 'some error',
    }, registerSuccess());
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle registerFailure', () => {
    const state = authReducer(undefined, registerFailure('Email already exists'));
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Email already exists');
  });

  it('should handle logout', () => {
    localStorage.setItem('token', 'token');
    localStorage.setItem('user', JSON.stringify({ email: 'john@example.com' }));

    const loggedInState = {
      user: { email: 'john@example.com', firstName: 'John', lastName: 'Doe' },
      token: 'token',
      isAuthenticated: true,
      loading: false,
      error: null,
    };

    const state = authReducer(loggedInState, logout());
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.loading).toBe(false);

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
