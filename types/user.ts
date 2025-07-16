export interface User {
  id?: string;
  name: string;
  email: string;
  nickname?: string;
  avatar?: string;
  bio?: string;
  theme?: 'dark' | 'light' | 'blue' | 'green' | 'red';
  collectionsCount?: number;
  totalCards?: number;
  role?: 'user' | 'admin';
}

export interface UserUpdateData {
  name: string;
  nickname?: string;
  avatar?: string;
  bio?: string;
  theme?: string;
}
