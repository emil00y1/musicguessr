import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { createClient } from "@/utils/supabase/server";

export async function middleware(request: NextRequest) {
  // First, update the session as before
  const response = await updateSession(request);
  
  // Check if the path is /play - if not, just return the response from updateSession
  if (!request.nextUrl.pathname.startsWith('/play')) {
    return response;
  }
  
  // For /play routes, perform additional checks
  const supabase = await createClient();
  
  // Use getUser() instead of getting user from session
  const { data: { user }, error } = await supabase.auth.getUser();

  // If user is not logged in, redirect to sign-in page
  if (error || !user) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Get session to check for provider token
  const { data: { session } } = await supabase.auth.getSession();
  
  // Check if we have a provider token (Spotify)
  if (!session?.provider_token) {
    console.warn('No provider token available, might need to reauthenticate with Spotify');
    // Optionally redirect to refresh auth
    // return NextResponse.redirect(new URL('/refresh-spotify-auth', request.url));
  }
  
  // Return the original response if all checks pass
  return response;
}

// Keep your existing matchers
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};