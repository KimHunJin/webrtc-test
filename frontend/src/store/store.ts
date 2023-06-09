import socketReducer from "@/store/reducers/mainReducer";
import {configureStore} from "@reduxjs/toolkit";
import {setupListeners} from "@reduxjs/toolkit/query";

export const store = configureStore({
            reducer: {
                socketReducer,
            },
            devTools: process.env.NODE_ENV !== "production",
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware({serializableCheck: false})
        }
    )
;

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;