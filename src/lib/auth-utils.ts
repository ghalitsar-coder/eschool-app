// Utility functions for authentication

export function clearAuthCookies() {
  // Clear all auth-related cookies
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
  // Also clear from localStorage if any
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
}

export function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }
  return null;
}

export function isTokenExpired(token: string): boolean {
  try {
    if (!token) return true;
    
    // Decode JWT token (just the payload part)
    const base64Url = token.split('.')[1];
    if (!base64Url) return true;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    const currentTime = Date.now() / 1000;
    
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
}

export function logoutUser() {
  clearAuthCookies();
  
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
