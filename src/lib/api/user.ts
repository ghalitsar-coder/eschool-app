import apiClient from './client';

// Define types for our user creation
export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  user_type: 'teacher' | 'student';
  license_number?: string;
  student_id?: string;
  grade_level?: string;
  address?: string;
}

export interface User {
  id: number;
  profile_id: number;
  name: string;
  email: string;
  // Add other user fields as needed
}

// Create a new user (teacher or student)
export const createUser = async (userData: CreateUserPayload): Promise<User> => {
  try {
    const response = await apiClient.post<User>('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};