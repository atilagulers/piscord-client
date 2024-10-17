import axios from 'axios';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {useAppStore} from '@/store/store';
import {useNavigate} from 'react-router-dom';
import {useToast} from '@/hooks/use-toast';

const Home = () => {
  const {username, setUsername, roomId, password, setRoomId, setPassword} =
    useAppStore();
  const navigate = useNavigate();
  const {toast} = useToast();

  const api = import.meta.env.VITE_API_URL;

  const createRoom = async () => {
    const res = await axios.post(api + '/create-room', {
      password,
    });
    setRoomId(res.data.roomId);

    navigate(`/${res.data.roomId}`);

    toast({
      title: 'Room created',
      description: `Room ID: ${res.data.roomId}`,
      variant: 'success',
    });
  };

  const joinRoom = async () => {
    try {
      await axios.post(api + '/join-room', {roomId, password});

      navigate(`/${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error.response.data.message);
    }
  };

  return (
    <div className="m-auto w-[50%] h-screen p-32">
      <div className="space-y-6">
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <h2>Create or Join a Room</h2>
        <Input
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          disabled={!username}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={!username}
        />

        <Button
          variant="primary"
          onClick={joinRoom}
          className="w-full"
          disabled={!username || !roomId}
        >
          Join Room
        </Button>
        <hr />

        <Button
          variant="outline"
          onClick={createRoom}
          className="w-full"
          disabled={!username}
        >
          Create Room
        </Button>
      </div>
    </div>
  );
};

export default Home;
