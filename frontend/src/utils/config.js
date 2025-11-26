// Get backend base URL (without /api)
export const getBackendURL = () => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  // Remove /api from the end if present
  return apiUrl.replace('/api', '');
};

// Get full image URL
export const getImageURL = (imagePath) => {
  if (!imagePath) return null;
  // If imagePath already starts with http, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  // Otherwise, prepend backend URL
  return `${getBackendURL()}${imagePath}`;
};

