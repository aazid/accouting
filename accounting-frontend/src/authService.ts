import api from './api';

export interface User {
    id: string;
    email: string;
    username: string;
    role?: string;
}

export interface AuthResponse {
    access: string;
    refresh: string;
    user: User;
}

const authService = {
    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await api.post('token/', { username: email, password });
        const { access, refresh } = response.data;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        
        // Fetch user data after login
        const userResponse = await api.get('users/me/');
        const user = userResponse.data;
        localStorage.setItem('user', JSON.stringify(user));
        
        return { access, refresh, user };
    },

    async register(email: string, password: string, username: string): Promise<any> {
        const response = await api.post('users/register/', { email, password, username });
        return response.data;
    },

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('arthik_demo_mode');
        window.location.href = '/auth';
    },

    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('access_token');
    }
};

export default authService;
