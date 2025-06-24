import { getSession, getUserDetails } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ProfileForm from "@/components/dashboard/profile-form"

export default async function ProfilePage() {
  let session = null
  try {
    session = await getSession()
  } catch (e) {
    console.error("Session error:", e)
  }

  if (!session) {
    redirect("/")
  }

  let userDetails = null
  try {
    userDetails = await getUserDetails()
  } catch (e) {
    console.error("User details error:", e)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and profile information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your profile details and personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm initialData={userDetails} />
        </CardContent>
      </Card>
    </div>
  )
}
