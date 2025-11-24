// authApi.ts
import axios from "axios";

const BASE_URL = "http://10.232.202.179:8000/auth";

// ---------- LOGIN ----------
export async function loginApi(username: string, pwd: string) {
  try {
    const res = await axios.post(`${BASE_URL}/login`, {username, pwd});
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err.message;
  }
}

// ---------- SIGNUP ----------
export async function signupApi(
  username: string,
  pwd: string,
  email?: string
) {
  try {
    const res = await axios.post(`${BASE_URL}/signup`, {
      username,
      pwd,
      email,
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err.message;
  }
}

// ---------- FORGOT PASSWORD ----------
export async function forgotPasswordApi(email: string) {
  try {
    const res = await axios.post(`${BASE_URL}/forgotPassword/`, {
      email,
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err.message;
  }
}

// ---------- RESET PASSWORD (GET HTML PAGE) ----------
export async function resetPasswordPageApi(id: string, token: string) {
  try {
    const res = await axios.get(`${BASE_URL}/resetPassword/${id}/${token}`);
    return res.data; // HTML page
  } catch (err: any) {
    throw err.response?.data || err.message;
  }
}

// ---------- RESET PASSWORD (POST new password) ----------
export async function resetPasswordApi(
  id: string,
  token: string,
  newPassword: string
) {
  try {
    const res = await axios.post(
      `${BASE_URL}/resetPassword/${id}/${token}`,
      { password: newPassword }
    );
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err.message;
  }
}
