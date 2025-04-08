import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Extract user data from metadata
  const {
    user_metadata: {
      name,
      email,
      full_name,
      picture,
    } = {},
    phone,
    created_at,
    app_metadata: { provider } = {},
  } = user;

  // Format date for better readability
  const joinDate = new Date(created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Account Information</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={picture} alt={name || "User"} />
              <AvatarFallback>{name ? name.charAt(0).toUpperCase() : "U"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{full_name || name || "User"}</CardTitle>
              <CardDescription>Logged in with <span className="capitalize">{provider}</span></CardDescription>
            </div>
          </CardHeader>
        </Card>

        {/* Contact Information Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{email || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{phone || "Not provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">{joinDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Spotify ID</p>
                <p className="font-medium">{user.user_metadata?.provider_id || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}