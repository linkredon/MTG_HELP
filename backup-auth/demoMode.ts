// Mock implementation for backup file compatibility
export const isDemoMode = () => false;
export const getDemoUser = () => null;
export const authenticateDemoUser = async (email?: string, password?: string): Promise<any> => ({
  success: false,
  error: 'Demo mode is not active'
});
export const registerDemoUser = async (email?: string, password?: string, name?: string): Promise<any> => ({
  success: false,
  error: 'Demo mode is not active'
});
