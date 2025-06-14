import { configureStore } from "@reduxjs/toolkit"
import { combineReducers } from "redux"
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
import AsyncStorage from "@react-native-async-storage/async-storage"

// 导入各个模块的reducer
import authReducer from "./slices/authSlice"
import projectsReducer from "./slices/projectsSlice"
import aiModelsReducer from "./slices/aiModelsSlice"
import uiReducer from "./slices/uiSlice"
import offlineReducer from "./slices/offlineSlice"
import notificationsReducer from "./slices/notificationsSlice"

// 持久化配置
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "projects", "offline"], // 只持久化这些reducer
}

// 合并所有reducer
const rootReducer = combineReducers({
  auth: authReducer,
  projects: projectsReducer,
  aiModels: aiModelsReducer,
  ui: uiReducer,
  offline: offlineReducer,
  notifications: notificationsReducer,
})

// 创建持久化reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// 创建store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

// 创建persistor
export const persistor = persistStore(store)

// 导出类型
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
