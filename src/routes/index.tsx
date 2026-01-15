import { useEffect, useState } from 'react'
import { Button } from '@/components/shared/button';
import { Logo } from '@/components/shared/logo';
import { createFileRoute } from '@tanstack/react-router'
import { getAuthData } from '@/lib/auth'

export const Route = createFileRoute('/')({
    component: SplashScreen,
})

function SplashScreen() {
    const navigate = Route.useNavigate()
    const [showLogin, setShowLogin] = useState(false)

    const redirectUri = import.meta.env.VITE_REDIRECT_URI;

    const encodedRedirectUri = encodeURIComponent(redirectUri);

    const posterAuthUrl = `https://joinposter.com/api/auth?application_id=4573&redirect_uri=${encodedRedirectUri}&response_type=code`;

    useEffect(() => {
        const auth = getAuthData()
        if (auth) {
            navigate({ to: '/home', replace: true })
        } else {
            setShowLogin(true)
        }
    }, [navigate])

    if (!showLogin) return null

    return (
        <div className="bg-primary min-h-screen pt-63.25 pb-24.5 flex flex-col items-center">
            <Logo variant="onboarding" className="animate-in fade-in zoom-in duration-500" />

            {/* Updated Link with the robustly constructed URL */}
            <a
                href={posterAuthUrl}
                className="mt-25 mx-auto w-[90%] max-w-125 animate-in fade-in slide-in-from-bottom-4 duration-700"
            >
                <Button variant="inverse" className="w-full">
                    Authorize with Poster
                </Button>
            </a>

            {/* Optional: Helper to debug if the ENV is correct in Production */}
            {/* <p className="text-white text-xs mt-4 opacity-50 text-center break-all px-4">
                Debug URI: {redirectUri}
            </p> */}
        </div>
    );
}