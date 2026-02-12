import React, { useState, useEffect } from "react";

import { User } from "../model";
import jwt_decode from "jwt-decode";

type ContextProps = {
  userId: string | null;
  userEmail: string | null;
  accessToken: string | null;
  setAccessToken: (accessToken: string) => void;
};

const UserContext = React.createContext<ContextProps>({
  userId: null,
  userEmail: null,
  accessToken: null,
  setAccessToken: () => {},
});

interface Props {
  children: React.ReactNode;
}

export const UserProvider: React.FC<Props> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);

  const setAccessToken = (accessToken: string) => {
    setToken(accessToken);
    try {
      const user: any = jwt_decode<User>(accessToken);
      console.log("Decoded JWT user:", user);
      // Set the userId from sub
      const extractedUserId = user.sub || user.username;
      setUserId(extractedUserId);
      
      // Fetch the actual email from the backend
      fetchUserEmail(accessToken);
    } catch (e) {
      console.error("Failed to decode JWT:", e);
    }
  };

  const fetchUserEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/get_user_info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched user info:", data);
        setUserEmail(data.email);
      }
    } catch (e) {
      console.error("Failed to fetch user email:", e);
    }
  };

  return (
    <UserContext.Provider value={{ userId, userEmail, accessToken, setAccessToken }}>
      {children}
    </UserContext.Provider>
  );
};

export function useUser() {
  return React.useContext(UserContext);
}
