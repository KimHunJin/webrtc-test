import {io} from "socket.io-client"
import {RefObject, useEffect, useMemo, useState} from "react";
import {iceServerList} from "@/utils/iceServerList";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {setRtcConnector, setUserStream} from "@/store/reducers/mainReducer";

export const useWebrtc = (userVideoRef: RefObject<HTMLVideoElement>, peerVideoRef: RefObject<HTMLVideoElement>) => {
    // @ts-ignore
    const socket = useMemo(() => io('http://localhost:3001', {cors: {origin: '*'}}), [])
    const [room, setRoom] = useState('')

    const dispatch = useAppDispatch()

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {width: 1280, height: 720}
        }).then((stream) => {
            dispatch(setUserStream(stream))
            rtcConnect(stream)
        })
    }, [])

    const mainStore = useAppSelector((state) => state.socketReducer)
    const userStream = mainStore.userStream
    const rtcPeerConnection = mainStore.rtcConnector

    const [creator, setCreator] = useState(false)

    socket.on('created', async () => {
        setCreator(true)
        try {
            videoPlay()
        } catch (e) {
            console.error('create error - Could not access user media', e)
        }
    });

    socket.on('joined', async () => {
        setCreator(false)
        console.log('creator', creator, 'room', room)
        try {
            videoPlay()
            socket.emit('ready', room);
        } catch (e) {
            console.error('create error - Could not access user media', e)
        }
    })

    socket.on('ready', async () => {
        if (creator) {
            if (!rtcPeerConnection) {
                console.error('rtc peer connection is not connected in ready')
                return
            }
            try {
                rtcConnect(userStream)
                const offer = await rtcPeerConnection.createOffer()
                await rtcPeerConnection.setLocalDescription(offer)
                socket.emit('offer', offer, room)
            } catch (e) {
                console.error('rtc offer create error')
            }
        }
    });

    socket.on("offer", async (offer) => {
        if (!creator) {
            if (!rtcPeerConnection) {
                console.error('rtc peer connection is not connected in offer')
                return
            }
            try {
                rtcConnect(userStream)
                await rtcPeerConnection.setRemoteDescription(offer);
                const answer = await rtcPeerConnection.createAnswer()
                await rtcPeerConnection.setLocalDescription(answer)
                socket.emit('answer', answer, room)
            } catch (e) {
                console.error('rtc offer error')
            }
        }
    });

    socket.on('candidate', (candidate) => {
        if (!rtcPeerConnection) {
            console.error('rtc peer connection is not connected in candidate')
            return
        }
        const icecandidate = new RTCIceCandidate(candidate);
        rtcPeerConnection.addIceCandidate(icecandidate);
    });

    socket.on('answer', function (answer) {
        if (!rtcPeerConnection) {
            console.error('rtc peer connection is not connected in answer')
            return
        }
        rtcPeerConnection.setRemoteDescription(answer);
    });

    socket.on('full', function () {
        console.log('room is full')
    });

    const videoPlay = () => {
        if (!userStream) {
            console.error('user stream is not created')
            return
        }
        if (!userVideoRef || !userVideoRef.current) {
            console.error('video ref is not defined')
            return
        }
        const video = userVideoRef.current
        video.srcObject = userStream
        video.onloadedmetadata = () => {
            video.play()
        }
    }

    const rtcConnect = (userStream: MediaStream | null) => {
        if (!userStream) {
            console.error('rtc connect error user stream is not defined')
            return
        }
        const _rtcPeerConnection = new RTCPeerConnection({iceServers: iceServerList});
        _rtcPeerConnection.onicecandidate = onIceCandidate;
        _rtcPeerConnection.ontrack = onTrackFunction;
        _rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
        _rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream);
        dispatch(setRtcConnector(_rtcPeerConnection))
    }

    const onIceCandidate = (e: RTCPeerConnectionIceEvent) => {
        console.log("Candidate");
        if (e.candidate) {
            socket.emit("candidate", e.candidate, room);
        }
    }

    const onTrackFunction = (e: RTCTrackEvent) => {
        console.log('on track function')
        if (!peerVideoRef || !peerVideoRef.current) {
            console.error('peer video is not defined')
            return
        }
        const peerVideo = peerVideoRef.current
        peerVideo.srcObject = e.streams[0];
        peerVideo.onloadedmetadata = () => {
            peerVideo.play();
        };
    }

    const joinRoom = (roomName: string) => {
        if (roomName === '') {
            console.error('room name is empty')
            return
        }
        socket.emit('join', roomName)
    }

    return {
        joinRoom,
        setRoom,
        room
    }
}