'use client';

import {
  Zap,
  ArrowRightLeft,
  Users,
  CheckCircle,
  Sparkles,
  Users as UsersIcon,
  Clock,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const benefits = [
  {
    icon: <Zap className="h-8 w-8 text-blue-600" />,
    title: 'Discover AI Tools',
    subtitle: 'Find the best AI tools for your tasks',
    description:
      'Explore a curated collection of AI tools. Find specialized solutions for any task, from content creation to data analysis.',
    features: [
      'Curated tool collection',
      'Specialized solutions',
      'Easy discovery',
      'Regular updates',
    ],
    badge: 'Most Popular',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <Users className="h-8 w-8 text-green-600" />,
    title: 'Explore Community',
    subtitle: 'Discover tools shared by the community',
    description:
      'Browse AI tools shared by the community. Get inspired, learn from others, and find solutions for your needs.',
    features: [
      'Community tools',
      'Get inspired',
      'Learn from others',
      'Find solutions',
    ],
    badge: 'Community',
    gradient: 'from-green-500 to-emerald-500',
  },
];

const stats = [
  {
    label: 'AI Tools',
    value: '100+',
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    label: 'Active Users',
    value: '1K+',
    icon: <UsersIcon className="h-4 w-4" />,
  },
];

export function BenefitsShowcase() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Why Choose DeepList AI?
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover the best AI tools and explore what the community has shared - all in one place.
        </p>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-8 mb-16">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center gap-2 text-gray-600">
            {stat.icon}
            <span className="font-semibold">{stat.value}</span>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Benefits Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {benefits.map((benefit, index) => (
          <Card
            key={index}
            className="relative overflow-hidden group hover:shadow-xl transition-all duration-300"
          >
            {/* Gradient Background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
            />

            {/* Badge */}
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-white/90 text-gray-700">
                {benefit.badge}
              </Badge>
            </div>

            <CardHeader className="pb-4">
              <div className="flex items-center gap-4 mb-4">
                {benefit.icon}
                <div>
                  <CardTitle className="text-xl text-gray-900">
                    {benefit.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {benefit.subtitle}
                  </CardDescription>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {benefit.description}
              </p>
            </CardHeader>

            <CardContent>
              <ul className="space-y-2">
                {benefit.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-12">
        <h3 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to Experience the Future of AI?
        </h3>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of users who are already using DeepList AI to get more
          done with AI.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            onClick={() => {
              // Navigate to auth page
              window.location.href = '/auth';
            }}
          >
            Login to Start
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-3"
            onClick={() => {
              // Navigate to store page
              window.location.href = '/store';
            }}
          >
            Explore Tools
          </Button>
        </div>
      </div>
    </div>
  );
}
