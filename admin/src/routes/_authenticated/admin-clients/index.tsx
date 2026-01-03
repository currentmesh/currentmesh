import { createFileRoute } from '@tanstack/react-router';
import { AdminClients } from '@/features/admin-clients';

export const Route = createFileRoute('/_authenticated/admin-clients/')({
  component: AdminClients,
});
