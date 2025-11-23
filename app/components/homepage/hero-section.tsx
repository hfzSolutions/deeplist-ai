'use client';

import {
  Zap,
  ArrowRightLeft,
  Users,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mainBenefits = [
  {
    icon: <Zap className="h-6 w-6" />,
    text: 'Discover Tools',
  },
  {
    icon: <Users className="h-6 w-6" />,
    text: 'Explore Community',
  },
];

interface HeroSectionProps {
  onStartChatting?: () => void;
}

export function HeroSection({ onStartChatting }: HeroSectionProps = {}) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-20">
      <div className="text-center">
        {/* Badge */}
        <Badge
          variant="secondary"
          className="mb-6 bg-blue-50 text-blue-700 border-blue-200"
        >
          ✨ The Future of AI is Here
        </Badge>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Discover
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {' '}
            AI Tools
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Explore the best AI tools, discover new solutions, and find the perfect tool for your needs - all in one platform.
        </p>

        {/* Main Benefits */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {mainBenefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-sm border border-gray-200"
            >
              <div className="text-blue-600">{benefit.icon}</div>
              <span className="font-medium text-gray-900">{benefit.text}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
            onClick={() => {
              onStartChatting?.();
              window.location.href = '/auth';
            }}
          >
            Login to Start
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-4 text-lg border-gray-300"
            onClick={() => {
              window.location.href = '/store';
            }}
          >
            Explore Tools
          </Button>
        </div>

        {/* Social Proof */}
        <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>1,000+ active users</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Completely free</span>
          </div>
        </div>
      </div>
    </div>
  );
}
