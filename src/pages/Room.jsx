import {useEffect, useState, useRef} from 'react';
import {useAppStore} from '@/store/store';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {useToast} from '@/hooks/use-toast';
import {useNavigate} from 'react-router-dom';
import {TbHeadphonesOff, TbHeadphonesFilled} from 'react-icons/tb';
import {FaMicrophone, FaMicrophoneSlash} from 'react-icons/fa';

const Room = () => {
  const {toast} = useToast();
  const navigate = useNavigate();
  const {roomId, username, socket, localStream, setLocalStream} = useAppStore();

  const [roomData, setRoomData] = useState(null);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(true);
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const [dummyUsers, setDummyUsers] = useState([
    {id: 1, username: 'user1'},
    {id: 2, username: 'user2'},
    {id: 3, username: 'user3'},
    {id: 4, username: 'user4'},
    {id: 5, username: 'user5'},
    {id: 6, username: 'user6'},
    {id: 7, username: 'user7'},
    {id: 8, username: 'user8'},
    {id: 9, username: 'user9'},
    {id: 10, username: 'user10'},
  ]);

  useEffect(() => {
    socket.on('error', ({message}) => {
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });

      navigate('/');
    });

    socket.emit('joinRoom', {roomId, username});

    socket.on('roomData', (data) => {
      setRoomData(data);
    });

    startAudio();

    return () => {
      socket.off('roomUsers');
    };
  }, [roomId, username, socket, toast, navigate]);

  const toggleMicrophone = () => {
    const audioTrack = localStream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;

    setIsMicrophoneOn(audioTrack.enabled);
  };

  const toggleSpeaker = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !remoteAudioRef.current.muted;

      setIsSpeakerOn(!remoteAudioRef.current.muted);
    }
  };

  // WebRTC bağlantısını başlatma
  const startAudio = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({audio: true});

    console.log('Local stream:', stream);
    setLocalStream(stream);

    const peerConnection = new RTCPeerConnection();
    peerConnectionRef.current = peerConnection;

    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {candidate: event.candidate, roomId});
      }
    };

    peerConnection.ontrack = (event) => {
      remoteAudioRef.current.srcObject = event.streams[0];
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', {offer, roomId});

    socket.on('offer', async (offer) => {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit('answer', {answer, roomId});
    });

    socket.on('answer', async (answer) => {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socket.on('ice-candidate', async (candidate) => {
      if (candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
  };

  return (
    <div className="h-screen mx-4">
      <h1 className="py-3 text-lg">Room ID: {roomId}</h1>

      <ul className="grid grid-cols-4 gap-4 ">
        {roomData &&
          roomData?.users.map((user) => (
            <li className="bg-gray-600" key={user.id}>
              <div className="flex justify-center items-center h-32">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
              <div className="p-3">{user.username}</div>
            </li>
          ))}
      </ul>

      {/* Mikrofon ve Hoparlör Kontrolleri */}
      <div className="pt-4 flex gap-4">
        <div onClick={toggleMicrophone}>
          {isMicrophoneOn ? (
            <FaMicrophone size={32} />
          ) : (
            <FaMicrophoneSlash size={32} />
          )}
        </div>

        <div onClick={toggleSpeaker}>
          {isSpeakerOn ? (
            <TbHeadphonesFilled size={32} />
          ) : (
            <TbHeadphonesOff size={32} />
          )}
        </div>
      </div>

      {/* Remote Audio Player */}
      <audio ref={remoteAudioRef} autoPlay />
    </div>
  );
};

export default Room;
