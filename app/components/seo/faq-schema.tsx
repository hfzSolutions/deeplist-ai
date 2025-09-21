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
      'Deeplist AI is a unified platform that provides access to multiple AI models including GPT-4, Claude, Gemini, and more in a single interface. You can switch between different AI models mid-conversation, create custom AI agents, post your own AI tools, and access specialized AI tools for various tasks.',
  },
  {
    question: 'How many AI models can I access?',
    answer:
      'Deeplist AI provides access to 10+ premium AI models including GPT-4, Claude 3, Gemini Pro, and other leading AI models. You can use any of these models in a single conversation.',
  },
  {
    question: 'Can I switch AI models during a conversation?',
    answer:
      'Yes! One of our key features is the ability to switch between different AI models mid-conversation without losing context. This allows you to compare responses and choose the best model for each specific task.',
  },
  {
    question: 'Is Deeplist AI free to use?',
    answer:
      'Deeplist AI offers free access to many AI models and tools. Some AI models are free to use, while paid features might be implemented soon to enhance the platform experience.',
  },
  {
    question: 'What AI tools are available?',
    answer:
      'Our AI tools store includes specialized tools for coding, design, research, writing, analysis, and more. You can browse curated tools or post your own AI tools to share with the community. Each tool is designed to provide the best experience for specific tasks.',
  },
  {
    question: 'Can I create custom AI agents?',
    answer:
      'Yes! Deeplist AI allows you to create custom AI agents with specific personalities, expertise, and behaviors. You can configure their system prompts, choose their preferred models, and share them with the community or keep them private.',
  },
  {
    question: 'How do I get started with Deeplist AI?',
    answer:
      'Simply visit our homepage and start chatting with any AI model. You can explore different models, try our AI tools, create custom agents, and switch between them as needed. No complex setup required.',
  },
  {
    question: 'Can I use AI for writing content?',
    answer:
      'Yes! Deeplist AI provides access to various AI models perfect for writing, including GPT-4, Claude, and Gemini. You can use AI to write articles, blogs, content, and various types of text with ease.',
  },
  {
    question: 'How do I use AI for content writing?',
    answer:
      'Choose the AI model that suits your writing needs, create clear prompts about the type of content you want to write, and AI will help generate high-quality text. You can also create custom AI agents specifically for writing with particular styles and topics.',
  },
  {
    question: 'Apakah ada AI untuk menulis di Deeplist AI?',
    answer:
      'Ya! Deeplist AI menyediakan akses ke berbagai model AI untuk menulis seperti GPT-4, Claude, dan Gemini. Anda dapat menggunakan AI untuk menulis artikel, blog, konten, dan berbagai jenis teks lainnya dengan mudah.',
  },
  {
    question: 'Adakah AI untuk menulis di Malaysia?',
    answer:
      'Ya! Deeplist AI tersedia untuk pengguna di Malaysia dan menyediakan akses ke pelbagai model AI untuk menulis. Anda boleh menggunakan AI untuk menulis artikel, blog, kandungan, dan pelbagai jenis teks lain dengan mudah.',
  },
];
