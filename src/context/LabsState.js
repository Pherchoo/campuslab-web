import { createContext, useContext } from "react";
export const LabsContext = createContext(/** @type {any} */ (null));
export const useLabs = () => useContext(LabsContext);
