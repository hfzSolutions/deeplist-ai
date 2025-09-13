'use client';

import { useState, useEffect } from 'react';
import { HeroSection } from './hero-section';
import { BenefitsShowcase } from './benefits-showcase';
import { ValueProposition } from './value-proposition';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare } from 'lucide-react';

interface LandingPageProps {
  onStartChatting: () => void;
}

export function LandingPage({ onStartChatting }: LandingPageProps) {
  const [showBenefits, setShowBenefits] = useState(false);

  // Show benefits after a short delay to let users see the hero first
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBenefits(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection onStartChatting={onStartChatting} />

      {/* Benefits Showcase - appears after delay */}
      {showBenefits && (
        <div className="animate-in fade-in duration-1000">
          <BenefitsShowcase />
        </div>
      )}

      {/* Quick Start CTA */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Start chatting with AI models right now. No setup required.
          </p>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
            onClick={onStartChatting}
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            Start Chatting
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
