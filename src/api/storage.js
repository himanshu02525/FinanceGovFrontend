export const getUserId = () => {
  const stored = localStorage.getItem('userId');
  return stored ? Number(stored) : null;
};

export const getEntityId = () => {
  const stored = localStorage.getItem('entityId');
  return stored ? Number(stored) : null;
};

export const getMissingIdsMessage = () => {
  return 'Local storage must contain userId and entityId for the current session. Please set these values before using the dashboard.';
};
