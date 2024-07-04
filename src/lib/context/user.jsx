import { createContext, useContext, useEffect, useState } from "react";
import { account } from "../appwrite";

const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider(props) {
  const [user, setUser] = useState(null);

  async function login(email, password) {
    try {
      await account.createEmailSession(email, password);
      const loggedInUser = await account.get();
      setUser(loggedInUser);
      alert("Login successful");
    } catch (error) {
      alert(`Login failed: ${error.message}`);
    }
  }

  async function logout() {
    try {
      await account.deleteSession("current");
      setUser(null);
      alert("Logged out");
    } catch (error) {
      alert(`Logout failed: ${error.message}`);
    }
  }

  async function register(email, password) {
    try {
      await account.create(email, password);
      await login(email, password);
    } catch (error) {
      alert(`Registration failed: ${error.message}`);
    }
  }

  async function init() {
    try {
      const loggedInUser = await account.get();
      setUser(loggedInUser);
    } catch (error) {
      setUser(null);
    }
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <UserContext.Provider value={{ current: user, login, logout, register }}>
      {props.children}
    </UserContext.Provider>
  );
}
