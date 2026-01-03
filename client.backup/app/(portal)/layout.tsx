import { redirect } from 'next/navigation';
import { isClientAuthenticated } from '@/lib/auth';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Note: This is a server component check
  // For client-side auth, we'll handle redirects in page components
  // This is a placeholder for future server-side auth checks

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">CurrentMesh</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/dashboard"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </a>
              <a
                href="/logout"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}

