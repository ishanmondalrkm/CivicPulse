import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:8001";

async function parseApiResponse(
  response,
  fallbackMessage
) {
  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    return {
      success: false,
      error:
        data.detail ||
        data.message ||
        fallbackMessage,
    };
  }

  return {
    success: true,
    ...data,
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(
      "civicpulse_token"
    );

    const savedUser = localStorage.getItem(
      "civicpulse_user"
    );

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(
          "civicpulse_user"
        );
      }
    }

    setLoading(false);
  }, []);

  // --------------------------------------------------
  // SAVE LOGIN SESSION
  // --------------------------------------------------

  const saveSession = (data) => {
    const token =
      data.access_token ||
      data.user?.access_token ||
      data.user?.token;

    if (token) {
      localStorage.setItem(
        "civicpulse_token",
        token
      );
    }

    if (data.user) {
      const cleanUser = {
        ...data.user,
      };

      // Don't need to keep token duplicated
      // inside the user object.
      delete cleanUser.access_token;
      delete cleanUser.token;

      localStorage.setItem(
        "civicpulse_user",
        JSON.stringify(cleanUser)
      );

      setUser(cleanUser);
    }
  };

  // --------------------------------------------------
  // AUTH HEADERS
  // --------------------------------------------------

  const authHeaders = () => {
    const token = localStorage.getItem(
      "civicpulse_token"
    );

    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // --------------------------------------------------
  // LOGIN
  // MOBILE OR EMAIL
  // --------------------------------------------------

  const login = async (
    identifier,
    password
  ) => {
    try {
      const cleanIdentifier =
        identifier.trim();

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            identifier: cleanIdentifier,
            password,
          }),
        }
      );

      const result = await parseApiResponse(
        response,
        "Invalid mobile number/email or password."
      );

      if (result.success) {
        saveSession(result);
      }

      return result;
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      return {
        success: false,
        error:
          "Unable to connect to the server.",
      };
    }
  };

  // --------------------------------------------------
  // FORGOT PASSWORD - SEND OTP
  // --------------------------------------------------

  const sendForgotPasswordOTP = async (
    email
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: email
              .trim()
              .toLowerCase(),
          }),
        }
      );

      return await parseApiResponse(
        response,
        "Could not send verification email."
      );
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      return {
        success: false,
        error:
          "Unable to connect to the server.",
      };
    }
  };

  // --------------------------------------------------
  // FORGOT PASSWORD - VERIFY OTP
  // --------------------------------------------------

  const verifyForgotPasswordOTP = async (
    email,
    otp,
    newPassword
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: email
              .trim()
              .toLowerCase(),
            otp: otp.trim(),
            new_password: newPassword,
          }),
        }
      );

      return await parseApiResponse(
        response,
        "Invalid OTP or password."
      );
    } catch (error) {
      console.error(
        "Password reset error:",
        error
      );

      return {
        success: false,
        error:
          "Unable to connect to the server.",
      };
    }
  };

  // --------------------------------------------------
  // REGISTER
  // --------------------------------------------------

  const register = async (
    userData
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...userData,
            email: userData.email
              .trim()
              .toLowerCase(),
            mobile: userData.mobile.trim(),
          }),
        }
      );

      return await parseApiResponse(
        response,
        "Registration failed."
      );
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      return {
        success: false,
        error:
          "Unable to connect to the server.",
      };
    }
  };

  // --------------------------------------------------
  // VERIFY REGISTRATION OTP
  // --------------------------------------------------

  const verifyRegistrationOTP = async (
    email,
    otp
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/verify-register`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: email
              .trim()
              .toLowerCase(),
            otp: otp.trim(),
          }),
        }
      );

      const result =
        await parseApiResponse(
          response,
          "Invalid verification code."
        );

      if (result.success) {
        saveSession(result);
      }

      return result;
    } catch (error) {
      console.error(
        "Registration verification error:",
        error
      );

      return {
        success: false,
        error:
          "Unable to connect to the server.",
      };
    }
  };

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const logout = () => {
    localStorage.removeItem(
      "civicpulse_token"
    );

    localStorage.removeItem(
      "civicpulse_user"
    );

    setUser(null);
  };

  // --------------------------------------------------
  // PROVIDER
  // --------------------------------------------------

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,

        // API URL is now available to dashboard
        API_URL,

        // Authentication
        login,
        authHeaders,

        // Password reset
        sendForgotPasswordOTP,
        verifyForgotPasswordOTP,

        // Registration
        register,
        verifyRegistrationOTP,

        // Session
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(
    AuthContext
  );

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};