import {Routes, Route, BrowserRouter} from 'react-router-dom';
import io from 'socket.io-client';
import {Toaster} from '@/components/ui/toaster';
import {useAppStore} from './store/store';

import Home from './pages/Home';
import Room from './pages/Room';
import {useEffect} from 'react';

function App() {
  const {setSocket} = useAppStore();

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);
    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, [setSocket]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:roomId" element={<Room />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
