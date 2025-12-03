// authApi.ts
import axios from "axios";

const BASE_URL = "http://172.20.10.4:8000/auth";
const URL = "http://172.20.10.4:8000";

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

// authApi.ts


export async function getProfileApi(userId: string) {
  try {
    const r = await axios.get(`${URL}/api/user/${userId}`);
    const userData = r.data;

    // Αν tags υπάρχει, μετατρέπουμε σε array
    if (userData.tags && typeof userData.tags === "string") {
      userData.tags = userData.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
    } else {
      userData.tags = [];
    }

    return { type: "success", user: userData }; 
  } catch (e) {
    console.log("getProfile error", e);
    return { type: "error", message: "Could not fetch profile" };
  }
}


export async function updateProfileApi(payload: any) {
  try {
    // payload.image and payload.cover are data URIs (data:image/...base64,...)
    const r = await axios.post(`${URL}/api/user/updateProfile`, payload, { headers: { "Content-Type": "application/json" }});
    return r.data; // should return { type:'success', user: {...} }
  } catch (e) {
    console.log("updateProfile error", e);
    return { type: "error", message: "Could not update profile" };
  }
}