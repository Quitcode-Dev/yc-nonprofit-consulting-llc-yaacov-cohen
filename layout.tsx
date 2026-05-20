import { ReactNode } from 'react';

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
