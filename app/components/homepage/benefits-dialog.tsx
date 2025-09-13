'use client';

import {
  Zap,
  ArrowRightLeft,
  Store,
  CheckCircle,
  Sparkles,
  Users,
  Clock,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const benefits = [
  {
    icon: <Zap className="h-6 w-6 text-blue-600" />,
    title: 'One Platform, All AI Models',
    subtitle: 'Access 10+ top AI models in one place',
    description:
      'No more juggling multiple subscriptions. Get GPT-4, Claude, Gemini, and more - all in one unified interface.',
    features: [
      '10+ premium AI models',
      'No multiple subscriptions needed',
      'Unified chat interface',
      'Best pricing available',
    ],
    badge: 'Most Popular',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <ArrowRightLeft className="h-6 w-6 text-purple-600" />,
    title: 'Switch AI Models Mid-Chat',
    subtitle: 'Compare responses instantly',
    description:
      'Get the best answer by switching between AI models without losing context. Compare responses side-by-side.',
    features: [
      'Switch models instantly',
      'Keep conversation context',
      'Compare AI responses',
      'Choose the best answer',
    ],
    badge: 'Unique Feature',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: <Store className="h-6 w-6 text-green-600" />,
    title: 'Curated AI Tools Marketplace',
    subtitle: 'Your personal AI toolkit',
    description:
      'Discover specialized AI tools for coding, design, research, and more. All curated and ready to use.',
    features: [
      'Specialized AI tools',
      'Curated by experts',
      'One-click access',
      'Regular updates',
    ],
    badge: 'Exclusive',
    gradient: 'from-green-500 to-emerald-500',
  },
];

const stats = [
  { label: 'AI Models', value: '10+', icon: <Sparkles className="h-4 w-4" /> },
  { label: 'Active Users', value: '1K+', icon: <Users className="h-4 w-4" /> },
  { label: 'Response Time', value: '<2s', icon: <Clock className="h-4 w-4" /> },
];

interface BenefitsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartChatting?: () => void;
}

export function BenefitsDialog({
  open,
  onOpenChange,
  onStartChatting,
}: BenefitsDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-advance through benefits
  useEffect(() => {
    if (!open) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % benefits.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [open]);

  const handleStartChatting = () => {
    onStartChatting?.();
    onOpenChange(false);
  };

  const currentBenefit = benefits[currentStep];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to DeepList AI! 🎉
              </DialogTitle>
              <DialogDescription className="text-lg text-gray-600">
                The only AI platform you need. Here's what makes us special:
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="ml-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1">
          {/* Stats */}
          <div className="flex justify-center gap-6 py-4 bg-gray-50 rounded-lg">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-gray-600"
              >
                {stat.icon}
                <span className="font-semibold">{stat.value}</span>
                <span className="text-sm">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Current Benefit Showcase */}
          <div className="relative">
            <div
              className={`bg-gradient-to-br ${currentBenefit.gradient} opacity-5 rounded-lg p-6 transition-all duration-500`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">{currentBenefit.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {currentBenefit.title}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {currentBenefit.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {currentBenefit.subtitle}
                  </p>
                  <p className="text-gray-700 mb-4">
                    {currentBenefit.description}
                  </p>
                  <ul className="space-y-1">
                    {currentBenefit.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Benefit Navigation Dots */}
          <div className="flex justify-center gap-2">
            {benefits.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* All Benefits Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                  index === currentStep
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setCurrentStep(index)}
              >
                <div className="flex items-center gap-3 mb-2">
                  {benefit.icon}
                  <h4 className="font-medium text-gray-900 text-sm">
                    {benefit.title}
                  </h4>
                </div>
                <p className="text-xs text-gray-600">{benefit.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={handleStartChatting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Start Free Trial
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Explore Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
