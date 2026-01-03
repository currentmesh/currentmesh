import { Router, Request, Response } from 'express';
import { authenticate, requireSuperAdmin } from '../middleware/auth.middleware';
import * as organizationsQueries from '../db/queries/organizations';
import * as usersQueries from '../db/queries/users';
import * as clientsQueries from '../db/queries/clients';

const router = Router();

// All admin routes require authentication and super_admin role
router.use(authenticate);
router.use(requireSuperAdmin);

// ===== Organizations Routes =====

/**
 * GET /api/admin/organizations
 * List all organizations
 */
router.get('/organizations', async (req: Request, res: Response) => {
  try {
    const organizations = await organizationsQueries.getAllOrganizations();
    res.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

/**
 * GET /api/admin/organizations/:id
 * Get organization by ID
 */
router.get('/organizations/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const organization = await organizationsQueries.getOrganizationById(id);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

/**
 * POST /api/admin/organizations
 * Create new organization
 */
router.post('/organizations', async (req: Request, res: Response) => {
  try {
    const { name, subdomain, status, subscription_tier } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Organization name is required' });
    }

    const organization = await organizationsQueries.createOrganization({
      name,
      subdomain,
      status,
      subscription_tier,
    });

    res.status(201).json(organization);
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

/**
 * PUT /api/admin/organizations/:id
 * Update organization
 */
router.put('/organizations/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const { name, subdomain, status, subscription_tier } = req.body;

    const organization = await organizationsQueries.updateOrganization(id, {
      name,
      subdomain,
      status,
      subscription_tier,
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json(organization);
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

/**
 * DELETE /api/admin/organizations/:id
 * Delete organization
 */
router.delete('/organizations/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const deleted = await organizationsQueries.deleteOrganization(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});

// ===== Users Routes =====

/**
 * GET /api/admin/users
 * List all users across all organizations
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await usersQueries.getAllUsers();
    // Remove password_hash from response
    const sanitizedUsers = users.map(({ password_hash, ...user }) => user);
    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/admin/users/:id
 * Get user by ID
 */
router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await usersQueries.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password_hash from response
    const { password_hash, ...sanitizedUser } = user;
    res.json(sanitizedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * POST /api/admin/users
 * Create new user
 */
router.post('/users', async (req: Request, res: Response) => {
  try {
    const { organization_id, email, password, first_name, last_name, role, status } = req.body;

    if (!organization_id || !email || !password) {
      return res.status(400).json({ error: 'Organization ID, email, and password are required' });
    }

    const user = await usersQueries.createUser({
      organization_id,
      email,
      password,
      first_name,
      last_name,
      role,
      status,
    });

    // Remove password_hash from response
    const { password_hash, ...sanitizedUser } = user;
    res.status(201).json(sanitizedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof Error && error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * PUT /api/admin/users/:id
 * Update user
 */
router.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const { email, password, first_name, last_name, role, status } = req.body;

    const user = await usersQueries.updateUser(id, {
      email,
      password,
      first_name,
      last_name,
      role,
      status,
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password_hash from response
    const { password_hash, ...sanitizedUser } = user;
    res.json(sanitizedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete user
 */
router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const deleted = await usersQueries.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ===== Clients Routes =====

/**
 * GET /api/admin/clients
 * List all clients across all organizations
 */
router.get('/clients', async (req: Request, res: Response) => {
  try {
    const clients = await clientsQueries.getAllClients();
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

/**
 * GET /api/admin/clients/:id
 * Get client by ID
 */
router.get('/clients/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }

    const client = await clientsQueries.getClientById(id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

/**
 * POST /api/admin/clients
 * Create new client
 */
router.post('/clients', async (req: Request, res: Response) => {
  try {
    const { organization_id, name, email, phone, company_name, status } = req.body;

    if (!organization_id || !name) {
      return res.status(400).json({ error: 'Organization ID and name are required' });
    }

    const client = await clientsQueries.createClient({
      organization_id,
      name,
      email,
      phone,
      company_name,
      status,
    });

    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

/**
 * PUT /api/admin/clients/:id
 * Update client
 */
router.put('/clients/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }

    const { name, email, phone, company_name, status } = req.body;

    const client = await clientsQueries.updateClient(id, {
      name,
      email,
      phone,
      company_name,
      status,
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

/**
 * DELETE /api/admin/clients/:id
 * Delete client
 */
router.delete('/clients/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }

    const deleted = await clientsQueries.deleteClient(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

export default router;

