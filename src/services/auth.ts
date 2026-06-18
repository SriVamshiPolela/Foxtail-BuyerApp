import { AUTH_API_BASE } from '@/constants/api';

export interface AuthSession {
  token: string;
  userId: string;
  userType: 'buyer' | 'seller';
  sessionId: string;
  expiresAt: string;
}

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${AUTH_API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json() as { success: boolean; data?: T; error?: { title: string } };
  if (!json.success || !json.data) {
    throw new Error(json.error?.title ?? 'Something went wrong. Please try again.');
  }
  return json.data;
}

export const authService = {
  register(name: string, phone: string, email?: string) {
    return post<{ message: string; phone: string }>('/v1/auth/register', {
      name, phone, type: 'buyer', ...(email ? { email } : {}),
    });
  },

  registerVerify(phone: string, code: string) {
    return post<AuthSession>('/v1/auth/register/verify', { phone, code });
  },

  requestOtp(phone: string) {
    return post<{ message: string; phone: string }>('/v1/auth/otp/request', { phone });
  },

  verifyOtp(phone: string, code: string) {
    return post<AuthSession>('/v1/auth/otp/verify', { phone, code });
  },

  async logout(sessionId: string, token: string) {
    await fetch(`${AUTH_API_BASE}/v1/auth/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
