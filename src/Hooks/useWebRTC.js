import { useRef, useState, useCallback, useEffect } from "react";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export default function useWebRTC(socketRef, currentUserId) {
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const endCallRef = useRef(null);

  const [callState, setCallState] = useState("idle"); // idle | calling | incoming | connected
  const [incomingCall, setIncomingCall] = useState(null); // { from, callerName, offer }
  const [remoteUserId, setRemoteUserId] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);


  const [socketReady, setSocketReady] = useState(false);

  useEffect(() => {
    // Check immediately
    if (socketRef.current) {
      setSocketReady(true);
      return;
    }

 
    const interval = setInterval(() => {
      if (socketRef.current) {
        setSocketReady(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [socketRef]);


  const getMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error("Failed to get user media:", err);
      throw err;
    }
  }, []);


  const endCall = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (remoteUserId && socketRef.current) {
      socketRef.current.emit("end_call", { to: remoteUserId });
    }

    setLocalStream(null);
    setRemoteStream(null);
    setRemoteUserId(null);
    setCallState("idle");
    setIncomingCall(null);
    setIsMuted(false);
    setIsCameraOff(false);
  }, [remoteUserId, socketRef]);

  useEffect(() => {
    endCallRef.current = endCall;
  }, [endCall]);


  const createPeerConnection = useCallback(
    (targetUserId) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

  
      pc.ontrack = (event) => {
        remoteStreamRef.current = event.streams[0];
        setRemoteStream(event.streams[0]);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("ice_candidate", {
            to: targetUserId,
            candidate: event.candidate,
          });
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (
          pc.iceConnectionState === "disconnected" ||
          pc.iceConnectionState === "failed"
        ) {
          
          if (endCallRef.current) endCallRef.current();
        }
      };

      peerConnectionRef.current = pc;
      return pc;
    },
    [socketRef],
  );


  const startCall = useCallback(
    async (targetUserId, callerName) => {
      try {
        setRemoteUserId(targetUserId);
        setCallState("calling");

        await getMedia();
        const pc = createPeerConnection(targetUserId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socketRef.current.emit("call_user", {
          to: targetUserId,
          from: currentUserId,
          callerName: callerName,
          offer: offer,
        });
      } catch (err) {
        console.error("Failed to start call:", err);
        setCallState("idle");
      }
    },
    [currentUserId, socketRef, getMedia, createPeerConnection],
  );


  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      setRemoteUserId(incomingCall.from);
      setCallState("connected");

      await getMedia();
      const pc = createPeerConnection(incomingCall.from);

      await pc.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer),
      );
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current.emit("call_accepted", {
        to: incomingCall.from,
        answer: answer,
      });

      setIncomingCall(null);
    } catch (err) {
      console.error("Failed to accept call:", err);
      setCallState("idle");
    }
  }, [incomingCall, socketRef, getMedia, createPeerConnection]);


  const rejectCall = useCallback(() => {
    if (!incomingCall) return;

    socketRef.current.emit("call_rejected", {
      to: incomingCall.from,
    });

    setIncomingCall(null);
    setCallState("idle");
  }, [incomingCall, socketRef]);


  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  }, []);


  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleIncomingCall = (data) => {
      setIncomingCall(data);
      setCallState("incoming");
    };

    const handleCallAccepted = async (data) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer),
        );
        setCallState("connected");
      }
    };

    const handleCallRejected = () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      setLocalStream(null);
      setCallState("idle");
      setRemoteUserId(null);
    };

    const handleIceCandidate = async (data) => {
      if (peerConnectionRef.current && data.candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(data.candidate),
          );
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    };

    const handleCallEnded = () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      setLocalStream(null);
      setRemoteStream(null);
      setRemoteUserId(null);
      setCallState("idle");
      setIsMuted(false);
      setIsCameraOff(false);
    };

    socket.on("incoming_call", handleIncomingCall);
    socket.on("call_accepted", handleCallAccepted);
    socket.on("call_rejected", handleCallRejected);
    socket.on("ice_candidate", handleIceCandidate);
    socket.on("call_ended", handleCallEnded);

    return () => {
      socket.off("incoming_call", handleIncomingCall);
      socket.off("call_accepted", handleCallAccepted);
      socket.off("call_rejected", handleCallRejected);
      socket.off("ice_candidate", handleIceCandidate);
      socket.off("call_ended", handleCallEnded);
    };
  }, [socketReady, socketRef]);

  return {
    callState,
    incomingCall,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
  };
}
