import { configureStore } from "@reduxjs/toolkit";
import storageSession from "redux-persist/lib/storage/session"; // uses sessionStorage
import { persistReducer, persistStore } from "redux-persist";
import dashboardReducer from "../features/dashboard/dashboardSlice";

const persistConfig = {
  key: "dashboard",
  storage: storageSession,
};

const persistedDashboardReducer = persistReducer(
  persistConfig,
  dashboardReducer
);

export const store = configureStore({
  reducer: {
    dashboard: persistedDashboardReducer,
  },
});

export const persistor = persistStore(store);
