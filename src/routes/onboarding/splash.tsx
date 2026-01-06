import { Button } from '@/components/shared/button';
import { Logo } from '@/components/shared/logo';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/onboarding/splash')({
  component: SplashScreen,
})

function SplashScreen() {
  return (
    <div className="bg-primary min-h-screen pt-63.25 pb-24.5 flex flex-col items-center">

      <Logo variant="onboarding" className="animate-in fade-in zoom-in duration-500" />

      <a href="https://joinposter.com/api/auth?application_id=4493&redirect_uri=http://localhost:3000/auth-callback&response_type=code" className="mt-25 mx-auto w-[90%] max-w-125">
        <Button variant="inverse" className="w-full">
          Authorize with Poster
        </Button>
      </a>
    </div>
  );
}