import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { APP_NAME, APP_TAGLINE, BUILD_ID } from '../config/branding';
import { withAssetVersion } from '../utils/assetVersion';

export default function LandingLoginPage() {
  const { login, loginStatus, loginError } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-accent/5 to-background relative overflow-hidden">
      {/* Background texture */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url(${withAssetVersion('/assets/generated/helmar-bg.dim_1920x1080.png')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="relative z-10 w-full max-w-md px-6 space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-4">
          <img 
            src={withAssetVersion('/assets/generated/helmar-icon.dim_1024x1024.png')}
            alt={APP_NAME} 
            className="w-24 h-24 rounded-3xl shadow-2xl"
          />
          <img 
            src={withAssetVersion('/assets/generated/helmar-wordmark.dim_1200x300.png')}
            alt={APP_NAME} 
            className="h-12 w-auto"
          />
        </div>

        {/* Tagline */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{APP_TAGLINE}</h1>
          <p className="text-muted-foreground text-lg">
            Create, discover, and connect through short videos
          </p>
        </div>

        {/* Login Button */}
        <div className="space-y-4">
          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="w-full text-lg h-14 rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-accent hover:from-primary/90 hover:via-primary hover:to-accent/90 shadow-[0_8px_30px_rgb(0,0,0,0.12),0_0_20px_rgba(var(--primary-rgb,255,100,50),0.3)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.16),0_0_30px_rgba(var(--primary-rgb,255,100,50),0.5)] active:scale-[0.98] transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {isLoggingIn ? 'Connecting...' : 'Get Started'}
          </Button>

          {loginError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{loginError.message}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 pt-8">
          <div className="text-center space-y-1">
            <div className="text-2xl">📹</div>
            <p className="text-xs text-muted-foreground">Share Videos</p>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl">👥</div>
            <p className="text-xs text-muted-foreground">Follow Friends</p>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl">💬</div>
            <p className="text-xs text-muted-foreground">Chat & Connect</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-center text-sm text-muted-foreground space-y-1">
        <div>
          © 2026. Built with ❤️ using{' '}
          <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
            caffeine.ai
          </a>
        </div>
        <div className="text-xs">
          Build: <span className="font-mono">{BUILD_ID}</span>
        </div>
      </footer>
    </div>
  );
}
