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
import { organizationsApi, type Organization, type CreateOrganizationInput } from '@/lib/api';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export function Organizations() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  // Fetch organizations
  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await organizationsApi.getAll();
      return response.data;
    },
  });

  // Create organization
  const createMutation = useMutation({
    mutationFn: (data: CreateOrganizationInput) => organizationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setIsCreateOpen(false);
      toast.success('Organization created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create organization');
    },
  });

  // Update organization
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Organization> }) =>
      organizationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setEditingOrg(null);
      toast.success('Organization updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update organization');
    },
  });

  // Delete organization
  const deleteMutation = useMutation({
    mutationFn: (id: number) => organizationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete organization');
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      name: formData.get('name') as string,
      subdomain: formData.get('subdomain') as string || undefined,
      status: formData.get('status') as any,
      subscription_tier: formData.get('subscription_tier') as any,
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingOrg) return;
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingOrg.id,
      data: {
        name: formData.get('name') as string,
        subdomain: formData.get('subdomain') as string || undefined,
        status: formData.get('status') as any,
        subscription_tier: formData.get('subscription_tier') as any,
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
            <h2 className='text-2xl font-bold tracking-tight'>Organizations</h2>
            <p className='text-muted-foreground'>
              Manage all organizations in the platform.
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                Create Organization
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Create Organization</DialogTitle>
                  <DialogDescription>
                    Create a new organization in the platform.
                  </DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='name'>Name *</Label>
                    <Input id='name' name='name' required />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='subdomain'>Subdomain</Label>
                    <Input id='subdomain' name='subdomain' />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='status'>Status</Label>
                    <Select name='status' defaultValue='active'>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='active'>Active</SelectItem>
                        <SelectItem value='suspended'>Suspended</SelectItem>
                        <SelectItem value='cancelled'>Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='subscription_tier'>Subscription Tier</Label>
                    <Select name='subscription_tier' defaultValue='free'>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='free'>Free</SelectItem>
                        <SelectItem value='starter'>Starter</SelectItem>
                        <SelectItem value='professional'>Professional</SelectItem>
                        <SelectItem value='enterprise'>Enterprise</SelectItem>
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
                <TableHead>Subdomain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className='text-center'>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : organizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='text-center'>
                    No organizations found
                  </TableCell>
                </TableRow>
              ) : (
                organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>{org.id}</TableCell>
                    <TableCell className='font-medium'>{org.name}</TableCell>
                    <TableCell>{org.subdomain || '-'}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          org.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : org.status === 'suspended'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {org.status}
                      </span>
                    </TableCell>
                    <TableCell>{org.subscription_tier}</TableCell>
                    <TableCell>{new Date(org.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => setEditingOrg(org)}
                        >
                          <Pencil className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this organization?')) {
                              deleteMutation.mutate(org.id);
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
      {editingOrg && (
        <Dialog open={!!editingOrg} onOpenChange={(open) => !open && setEditingOrg(null)}>
          <DialogContent>
            <form onSubmit={handleUpdate}>
              <DialogHeader>
                <DialogTitle>Edit Organization</DialogTitle>
                <DialogDescription>Update organization details.</DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='edit-name'>Name *</Label>
                  <Input id='edit-name' name='name' defaultValue={editingOrg.name} required />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='edit-subdomain'>Subdomain</Label>
                  <Input
                    id='edit-subdomain'
                    name='subdomain'
                    defaultValue={editingOrg.subdomain || ''}
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='edit-status'>Status</Label>
                  <Select name='status' defaultValue={editingOrg.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='active'>Active</SelectItem>
                      <SelectItem value='suspended'>Suspended</SelectItem>
                      <SelectItem value='cancelled'>Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='edit-subscription_tier'>Subscription Tier</Label>
                  <Select name='subscription_tier' defaultValue={editingOrg.subscription_tier}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='free'>Free</SelectItem>
                      <SelectItem value='starter'>Starter</SelectItem>
                      <SelectItem value='professional'>Professional</SelectItem>
                      <SelectItem value='enterprise'>Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setEditingOrg(null)}
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

