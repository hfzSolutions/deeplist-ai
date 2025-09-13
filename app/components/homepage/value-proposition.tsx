'use client';

import { Zap, ArrowRightLeft, Users, CheckCircle } from 'lucide-react';
import { useTheme } from 'next-themes';

export const VALUE_PROPOSITION = {
  main: 'Customize Your AI',
  subtitle: 'Build, switch, and personalize AI agents for your specific needs',

  benefits: [
    {
      icon: <Zap className="h-5 w-5" />,
      title: 'Build Custom AI',
      description: 'Create personalized AI agents for your specific tasks',
    },
    {
      icon: <ArrowRightLeft className="h-5 w-5" />,
      title: 'Switch Instantly',
      description: 'Change between different AI models and agents seamlessly',
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: 'Explore Community',
      description: 'Discover what others have built and get inspired',
    },
  ],

  // For use in CTAs and marketing
  cta: {
    primary: 'Login to Start',
    secondary: 'Explore AI Agents',
  },

  // For use in social proof
  socialProof: [
    'No credit card required',
    '1,000+ active users',
    'Completely free',
  ],
};

// Simple component for displaying the 3 main benefits
export function ValueProposition({ className = '' }: { className?: string }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {VALUE_PROPOSITION.main}
        </h2>
        <p className="text-muted-foreground">{VALUE_PROPOSITION.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {VALUE_PROPOSITION.benefits.map((benefit, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 p-4 rounded-lg ${
              isDark ? 'bg-gray-800' : 'bg-gray-50'
            }`}
          >
            <div className="text-blue-600">{benefit.icon}</div>
            <div>
              <h3 className="font-medium text-foreground">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Compact version for headers and sidebars
export function ValuePropositionCompact({
  className = '',
}: {
  className?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="font-semibold text-foreground">Why DeepList AI?</h3>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {VALUE_PROPOSITION.benefits.map((benefit, index) => (
          <li key={index} className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>{benefit.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
