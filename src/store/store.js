import {create} from 'zustand';

export const useAppStore = create((set) => ({
  username: '',
  roomId: '',
  password: '',
  localStream: null,
  socket: null,
  setUsername: (username) => set({username}),
  setRoomId: (roomId) => set({roomId}),
  setPassword: (password) => set({password}),
  setLocalStream: (localStream) => set({localStream}),
  setSocket: (socket) => set({socket}),
}));
