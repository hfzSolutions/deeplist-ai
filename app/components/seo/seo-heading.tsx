import { ReactNode, createElement } from 'react';

interface SEOHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
  id?: string;
}

export function SEOHeading({
  level,
  children,
  className = '',
  id,
}: SEOHeadingProps) {
  return createElement(
    `h${level}`,
    { id, className },
    children
  );
}

interface SEOSectionProps {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function SEOSection({
  children,
  className = '',
  ariaLabel,
}: SEOSectionProps) {
  return (
    <section className={className} aria-label={ariaLabel}>
      {children}
    </section>
  );
}

interface SEOArticleProps {
  children: ReactNode;
  className?: string;
}

export function SEOArticle({ children, className = '' }: SEOArticleProps) {
  return <article className={className}>{children}</article>;
}
