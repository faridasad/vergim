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
            <a href={`https://joinposter.com/api/auth?application_id=4493&redirect_uri=${import.meta.env.VITE_REDIRECT_URI}&response_type=code`} className="mt-25 mx-auto w-[90%] max-w-125 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Button variant="inverse" className="w-full">
                    Authorize with Poster
                </Button>
            </a>
        </div>
    );
}