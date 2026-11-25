import { createContext, useContext } from "react";
export const AuthContext = createContext(/** @type {any} */ (null));
export const useAuth = () => useContext(AuthContext);
