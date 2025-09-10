// Minimal seed data to test server startup
const { db, clients, users, projects, milestones, projectTeam, invoices, brandingSettings } = require('./database');
const { v4: uuidv4 } = require('uuid');

async function seedMinimalData() {
  console.log('🌱 Creating minimal seed data...');
  
  try {
    // Clean existing data in proper order (child records first)
    await db.delete(milestones);
    await db.delete(projectTeam);
    await db.delete(invoices);
    await db.delete(projects);
    await db.delete(users);
    await db.delete(clients);
    await db.delete(brandingSettings);
    
    // Create one client
    const clientId = uuidv4();
    const [seedClient] = await db
      .insert(clients)
      .values({
        id: clientId,
        name: 'Test Client',
        email: 'test@example.com',
        phone: '+1 (555) 123-4567',
        company: 'Test Company',
        address: '123 Test Street'
      })
      .returning();
    
    // Create one user  
    const userId = uuidv4();
    const [seedUser] = await db
      .insert(users)
      .values({
        id: userId,
        name: 'Test Manager',
        email: 'manager@firelynx.com',
        role: 'Manager',
        phone: '+1 (555) 001-0001',
        specialization: 'Project Management',
        isOnline: true
      })
      .returning();
    
    // Create one project
    const projectId = uuidv4();
    const [seedProject] = await db
      .insert(projects)
      .values({
        id: projectId,
        clientId: seedClient.id,
        title: 'Test Project',
        description: 'A test project for server validation',
        status: 'In Progress',
        priority: 'Medium',
        budget: '50000.00',
        spent: '20000.00',
        progress: 40,
        startDate: new Date('2024-12-01'),
        targetDate: new Date('2025-06-01')
      })
      .returning();
    
    // Create branding settings
    const brandingId = uuidv4();
    await db
      .insert(brandingSettings)
      .values({
        id: brandingId,
        appName: 'FireLynx',
        accentColor: '#4C6FFF',
        primaryTextColor: '#0F172A',
        mutedTextColor: '#64748B',
        borderColor: '#E2E8F0',
        bgSoft: '#F8FAFC',
        fontFamily: 'Inter, system-ui, Roboto, Helvetica, Arial',
        footerLeft: 'FireLynx Interior Design Studio',
        footerRight: 'support@firelynx.com • +1 (555) 123-4567',
        watermarkEnabled: false,
        watermarkText: 'DRAFT',
        watermarkOpacity: '0.08',
        pageSize: 'A4',
        pageMargins: '24mm 18mm 22mm 18mm'
      });
    
    console.log('✅ Minimal seed data created successfully');
    console.log(`Client: ${seedClient.name} (${seedClient.id})`);
    console.log(`User: ${seedUser.name} (${seedUser.id})`);
    console.log(`Project: ${seedProject.title} (${seedProject.id})`);
    
    return { client: seedClient, user: seedUser, project: seedProject };
    
  } catch (error) {
    console.error('❌ Error creating minimal seed data:', error);
    throw error;
  }
}

module.exports = { seedMinimalData };