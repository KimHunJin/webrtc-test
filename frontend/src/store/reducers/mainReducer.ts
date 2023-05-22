import {createSlice, PayloadAction} from "@reduxjs/toolkit";
type stateType = {
    userStream: MediaStream | null
    rtcConnector: RTCPeerConnection | null
}
const initialState: stateType = {
    userStream: null,
    rtcConnector: null
};

export const socketStore = createSlice({
    name: "socketStore",
    initialState,
    reducers: {
        setUserStream: (state, action: PayloadAction<MediaStream>) => {
            state.userStream = action.payload
        },
        setRtcConnector: (state, action: PayloadAction<RTCPeerConnection>) => {
            state.rtcConnector = action.payload
        }
    },
})

export const { setUserStream, setRtcConnector } = socketStore.actions
export default socketStore.reducer;