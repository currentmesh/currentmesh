import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ConfigDrawer } from '@/components/config-drawer';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { clientsApi, organizationsApi, type Client, type CreateClientInput } from '@/lib/api';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export function AdminClients() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Fetch organizations for dropdown
  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await organizationsApi.getAll();
      return response.data;
    },
  });

  // Fetch clients
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['admin-clients'],
    queryFn: async () => {
      const response = await clientsApi.getAll();
      return response.data;
    },
  });

  // Create client
  const createMutation = useMutation({
    mutationFn: (data: CreateClientInput) => clientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
      setIsCreateOpen(false);
      toast.success('Client created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create client');
    },
  });

  // Update client
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Client> }) =>
      clientsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
      setEditingClient(null);
      toast.success('Client updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update client');
    },
  });

  // Delete client
  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
      toast.success('Client deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete client');
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      organization_id: parseInt(formData.get('organization_id') as string),
      name: formData.get('name') as string,
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      company_name: formData.get('company_name') as string || undefined,
      status: formData.get('status') as any,
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingClient) return;
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingClient.id,
      data: {
        name: formData.get('name') as string,
        email: formData.get('email') as string || undefined,
        phone: formData.get('phone') as string || undefined,
        company_name: formData.get('company_name') as string || undefined,
        status: formData.get('status') as any,
      },
    });
  };

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Clients</h2>
            <p className='text-muted-foreground'>
              Manage all clients across all organizations.
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                Create Client
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-md'>
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Create Client</DialogTitle>
                  <DialogDescription>
                    Create a new client in an organization.
                  </DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='organization_id'>Organization *</Label>
                    <Select name='organization_id' required>
                      <SelectTrigger>
                        <SelectValue placeholder='Select organization' />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id.toString()}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='name'>Name *</Label>
                    <Input id='name' name='name' required />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='email'>Email</Label>
                    <Input id='email' name='email' type='email' />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='phone'>Phone</Label>
                    <Input id='phone' name='phone' type='tel' />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='company_name'>Company Name</Label>
                    <Input id='company_name' name='company_name' />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='status'>Status</Label>
                    <Select name='status' defaultValue='active'>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='active'>Active</SelectItem>
                        <SelectItem value='inactive'>Inactive</SelectItem>
                        <SelectItem value='archived'>Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type='button' variant='outline' onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type='submit' disabled={createMutation.isPending}>
                    Create
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className='text-center'>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className='text-center'>
                    No clients found
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.id}</TableCell>
                    <TableCell className='font-medium'>{client.name}</TableCell>
                    <TableCell>{client.email || '-'}</TableCell>
                    <TableCell>{client.phone || '-'}</TableCell>
                    <TableCell>{client.company_name || '-'}</TableCell>
                    <TableCell>{client.organization_name || client.organization_id}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          client.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : client.status === 'archived'
                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}
                      >
                        {client.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(client.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => setEditingClient(client)}
                        >
                          <Pencil className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this client?')) {
                              deleteMutation.mutate(client.id);
                            }
                          }}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Main>

      {/* Edit Dialog */}
      {editingClient && (
        <Dialog open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)}>
          <DialogContent className='max-w-md'>
            <form onSubmit={handleUpdate}>
              <DialogHeader>
                <DialogTitle>Edit Client</DialogTitle>
                <DialogDescription>Update client details.</DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='edit-name'>Name *</Label>
                  <Input id='edit-name' name='name' defaultValue={editingClient.name} required />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='edit-email'>Email</Label>
                  <Input
                    id='edit-email'
                    name='email'
                    type='email'
                    defaultValue={editingClient.email || ''}
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='edit-phone'>Phone</Label>
                  <Input
                    id='edit-phone'
                    name='phone'
                    type='tel'
                    defaultValue={editingClient.phone || ''}
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='edit-company_name'>Company Name</Label>
                  <Input
                    id='edit-company_name'
                    name='company_name'
                    defaultValue={editingClient.company_name || ''}
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='edit-status'>Status</Label>
                  <Select name='status' defaultValue={editingClient.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='active'>Active</SelectItem>
                      <SelectItem value='inactive'>Inactive</SelectItem>
                      <SelectItem value='archived'>Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setEditingClient(null)}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={updateMutation.isPending}>
                  Update
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

