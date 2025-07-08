// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient('https://mhmlywpwgciwiwbwsddf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1obWx5d3B3Z2Npd2l3YndzZGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNzQwOTIsImV4cCI6MjA2NDk1MDA5Mn0.FRn-T36IhmD-Igc3eOxkJY3wlS6baqZbllcVw-EEO0U');

// Function to check authentication status
export const checkAuth = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
            // If no session, redirect to login
            const currentPath = window.location.pathname;
            // Store the current path in localStorage so we can redirect back after login
            localStorage.setItem('redirectPath', currentPath);
            window.location.href = '/login.html';
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/login.html';
        return false;
    }
};

// Function to handle redirects after login
export const handleRedirect = () => {
    const redirectPath = localStorage.getItem('redirectPath');
    if (redirectPath) {
        localStorage.removeItem('redirectPath');
        window.location.href = redirectPath;
    } else {
        window.location.href = '/index.html';
    }
};
