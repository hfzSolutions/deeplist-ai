import { TestForm } from '@/app/components/test-form';

export default function TestFormPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Form Testing Page</h1>
        <TestForm />
      </div>
    </div>
  );
}
