// components/spotify-login-button.tsx
'use client';

import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/client";

export default function SpotifyLoginButton() {
  const supabase = createClient();
  
  async function signInWithSpotify() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect_to=/protected`
      }
    });
    
    if (error) {
      console.error('Error signing in with Spotify:', error);
    }
  }

  return (
    <Button 
      onClick={signInWithSpotify} 
      variant="outline" 
      className="w-full flex items-center justify-center gap-2"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM11.7 11.5C11.6 11.7 11.3 11.8 11.1 11.7C9.2 10.5 6.8 10.3 4.1 10.9C3.9 11 3.7 10.8 3.6 10.6C3.5 10.4 3.7 10.2 3.9 10.1C6.8 9.5 9.5 9.7 11.5 11C11.7 11.1 11.8 11.4 11.7 11.5ZM12.7 9.3C12.6 9.5 12.2 9.7 12 9.5C9.8 8.2 6.7 7.8 4.1 8.5C3.8 8.6 3.5 8.4 3.4 8.1C3.3 7.8 3.5 7.5 3.8 7.4C6.7 6.7 10.1 7.1 12.6 8.6C12.8 8.7 12.9 9.1 12.7 9.3ZM12.8 7.1C10.2 5.6 6 5.5 3.6 6.2C3.2 6.3 2.9 6.1 2.8 5.7C2.7 5.3 2.9 5 3.3 4.9C6.1 4.1 10.6 4.2 13.7 6C14 6.2 14.1 6.6 13.9 6.9C13.7 7.2 13.3 7.3 12.8 7.1Z" fill="#1DB954"/>
      </svg>
      Continue with Spotify
    </Button>
  );
}