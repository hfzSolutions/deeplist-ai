interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

// Common FAQs for Deeplist AI
export const commonFAQs: FAQItem[] = [
  {
    question: 'What is Deeplist AI?',
    answer:
      'Deeplist AI is a platform for discovering and sharing AI tools. You can browse curated AI tools, post your own AI tools, and access specialized AI tools for various tasks.',
  },
  {
    question: 'Is Deeplist AI free to use?',
    answer:
      'Deeplist AI offers free access to browse and discover AI tools. You can explore tools shared by the community and add your own tools to help others.',
  },
  {
    question: 'What AI tools are available?',
    answer:
      'Our AI tools store includes specialized tools for coding, design, research, writing, analysis, and more. You can browse curated tools or post your own AI tools to share with the community. Each tool is designed to provide the best experience for specific tasks.',
  },
  {
    question: 'Can I share my own AI tools?',
    answer:
      'Yes! Deeplist AI allows you to post and share AI tools with the community. You can add tools you find useful, categorize them, and help others discover great AI solutions.',
  },
  {
    question: 'How do I get started with Deeplist AI?',
    answer:
      'Simply visit our homepage to browse AI tools. You can explore tools shared by the community, search for specific tools, and add your own tools. No complex setup required.',
  },
];
