'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { clientAuthApi } from '@/lib/api';
import { storeClientSession } from '@/lib/auth';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('No verification token provided');
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await clientAuthApi.verifyToken(token);
        
        if (response.success && response.token) {
          storeClientSession({
            token: response.token,
            client: response.client,
          });
          router.push('/dashboard');
        } else {
          setError('Invalid or expired token');
        }
      } catch (err: any) {
        setError(err.message || 'Verification failed');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your token...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md text-center">
          <div className="text-red-600">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}


