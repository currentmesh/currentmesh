'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isClientAuthenticated, getClientSession } from '@/lib/auth';
import { clientPortalApi } from '@/lib/api';
import type { Request } from '@/types/portal';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    if (!isClientAuthenticated()) {
      router.push('/login');
      return;
    }

    const session = getClientSession();
    if (session) {
      setClient(session.client);
    }

    // Load requests
    const loadRequests = async () => {
      try {
        const data = await clientPortalApi.getRequests();
        setRequests(data);
      } catch (error) {
        console.error('Failed to load requests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
          {client && (
            <p className="mt-2 text-gray-600">
              Welcome, {client.name} ({client.email})
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Requests</h2>
          
          {requests.length === 0 ? (
            <p className="text-gray-500">No requests found.</p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.title}</h3>
                      {request.description && (
                        <p className="mt-1 text-sm text-gray-600">{request.description}</p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : request.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


