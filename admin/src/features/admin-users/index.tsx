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
import { usersApi, organizationsApi, type User, type CreateUserInput } from '@/lib/api';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export function AdminUsers() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Fetch organizations for dropdown
  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await organizationsApi.getAll();
      return response.data;
    },
  });

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await usersApi.getAll();
      return response.data;
    },
  });

  // Create user
  const createMutation = useMutation({
    mutationFn: (data: CreateUserInput) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsCreateOpen(false);
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create user');
    },
  });

  // Update user
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingUser(null);
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update user');
    },
  });

  // Delete user
  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      organization_id: parseInt(formData.get('organization_id') as string),
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      first_name: formData.get('first_name') as string || undefined,
      last_name: formData.get('last_name') as string || undefined,
      role: formData.get('role') as any,
      status: formData.get('status') as any,
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    const formData = new FormData(e.currentTarget);
    const updateData: any = {};
    if (formData.get('email')) updateData.email = formData.get('email') as string;
    if (formData.get('password')) updateData.password = formData.get('password') as string;
    if (formData.get('first_name')) updateData.first_name = formData.get('first_name') as string;
    if (formData.get('last_name')) updateData.last_name = formData.get('last_name') as string;
    if (formData.get('role')) updateData.role = formData.get('role') as any;
    if (formData.get('status')) updateData.status = formData.get('status') as any;

    updateMutation.mutate({ id: editingUser.id, data: updateData });
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
            <h2 className='text-2xl font-bold tracking-tight'>Users</h2>
            <p className='text-muted-foreground'>
              Manage all users across all organizations.
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-md'>
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Create User</DialogTitle>
                  <DialogDescription>
                    Create a new user in an organization.
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
                    <Label htmlFor='email'>Email *</Label>
                    <Input id='email' name='email' type='email' required />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='password'>Password *</Label>
                    <Input id='password' name='password' type='password' required />
                  </div>
                  <div className='grid grid-cols-2 gap-2'>
                    <div className='grid gap-2'>
                      <Label htmlFor='first_name'>First Name</Label>
                      <Input id='first_name' name='first_name' />
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='last_name'>Last Name</Label>
                      <Input id='last_name' name='last_name' />
                    </div>
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='role'>Role</Label>
                    <Select name='role' defaultValue='user'>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='user'>User</SelectItem>
                        <SelectItem value='admin'>Admin</SelectItem>
                        <SelectItem value='super_admin'>Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <SelectItem value='suspended'>Suspended</SelectItem>
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
                <TableHead>Organization</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className='text-center'>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className='text-center'>
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell className='font-medium'>
                      {user.first_name || user.last_name
                        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                        : '-'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.organization_name || user.organization_id}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : user.status === 'suspended'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}
                      >
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => setEditingUser(user)}
                        >
                          <Pencil className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this user?')) {
                              deleteMutation.mutate(user.id);
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
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent className='max-w-md'>
            <form onSubmit={handleUpdate}>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>Update user details.</DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='edit-email'>Email</Label>
                  <Input id='edit-email' name='email' defaultValue={editingUser.email} />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='edit-password'>New Password (leave blank to keep current)</Label>
                  <Input id='edit-password' name='password' type='password' />
                </div>
                <div className='grid grid-cols-2 gap-2'>
                  <div className='grid gap-2'>
                    <Label htmlFor='edit-first_name'>First Name</Label>
                    <Input
                      id='edit-first_name'
                      name='first_name'
                      defaultValue={editingUser.first_name || ''}
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='edit-last_name'>Last Name</Label>
                    <Input
                      id='edit-last_name'
                      name='last_name'
                      defaultValue={editingUser.last_name || ''}
                    />
                  </div>
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='edit-role'>Role</Label>
                  <Select name='role' defaultValue={editingUser.role}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='user'>User</SelectItem>
                      <SelectItem value='admin'>Admin</SelectItem>
                      <SelectItem value='super_admin'>Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='edit-status'>Status</Label>
                  <Select name='status' defaultValue={editingUser.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='active'>Active</SelectItem>
                      <SelectItem value='inactive'>Inactive</SelectItem>
                      <SelectItem value='suspended'>Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setEditingUser(null)}
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

