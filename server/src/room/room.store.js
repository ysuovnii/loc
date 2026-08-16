let activeRoom = null;

export const createRoom = (broadCasterCode, viewerCode) => {
  activeRoom = {
    broadCasterCode,
    viewerCode,
    broadCasterSocketId: null,
    viewers: new Set(),
    currentLocation: null,
    createdAt: Date.now()
  }

  return activeRoom;
}

export const getRoom = () => {
  return activeRoom;
}

export const clearRoom = () => {
  activeRoom = null;
}
