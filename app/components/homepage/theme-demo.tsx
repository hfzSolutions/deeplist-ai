'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WelcomeDialog } from './welcome-dialog';
import { SidebarBenefits } from './sidebar-benefits';
import { BenefitsBanner } from './benefits-banner';
import { QuickBenefits } from './quick-benefits';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeDemo() {
  const [showDialog, setShowDialog] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleStartChatting = () => {
    console.log('Login to start clicked');
    setShowDialog(false);
    // Navigate to auth page
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen bg-background p-8 space-y-8">
      {/* Theme Controls */}
      <div className="flex justify-center gap-4 mb-8">
        <Button
          variant={theme === 'light' ? 'default' : 'outline'}
          onClick={() => setTheme('light')}
        >
          <Sun className="h-4 w-4 mr-2" />
          Light
        </Button>
        <Button
          variant={theme === 'dark' ? 'default' : 'outline'}
          onClick={() => setTheme('dark')}
        >
          <Moon className="h-4 w-4 mr-2" />
          Dark
        </Button>
        <Button
          variant={theme === 'system' ? 'default' : 'outline'}
          onClick={() => setTheme('system')}
        >
          <Monitor className="h-4 w-4 mr-2" />
          System
        </Button>
      </div>

      {/* Demo Components */}
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-foreground mb-8">
          DeepList AI Benefits Components - Theme Demo
        </h1>

        {/* Welcome Dialog Trigger */}
        <div className="text-center">
          <Button onClick={() => setShowDialog(true)} size="lg">
            Open Welcome Dialog
          </Button>
        </div>

        {/* Benefits Banner */}
        <BenefitsBanner onStartChatting={handleStartChatting} />

        {/* Sidebar Benefits */}
        <div className="grid md:grid-cols-2 gap-6">
          <SidebarBenefits onStartChatting={handleStartChatting} />
          <QuickBenefits onStartChatting={handleStartChatting} />
        </div>

        {/* Value Proposition */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Value Proposition Component
          </h2>
          <div className="text-sm text-muted-foreground mb-4">
            This shows how the benefits are displayed in a compact format:
          </div>
          <div className="max-w-2xl">
            <SidebarBenefits onStartChatting={handleStartChatting} />
          </div>
        </div>
      </div>

      {/* Welcome Dialog */}
      <WelcomeDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onStartChatting={handleStartChatting}
      />
    </div>
  );
}
