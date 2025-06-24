import LoginForm from "@/components/auth/login-form"

export default function Home() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: "url('/images/olive-mind-branded-header.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
