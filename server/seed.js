/**
 * FireLynx Database Seeding System
 * 
 * Creates comprehensive demo data for interior design projects with:
 * - Real Dubai business context (AED currency, UAE-specific data)
 * - Professional interior design projects and content
 * - Complete project lifecycles with milestones, tasks, files
 * - Proper foreign key relationships
 * - Idempotent operations (safe to run multiple times)
 */

const crypto = require('crypto');
const { db, clients, users, projects, projectTeam, milestones, fileAssets, 
        tickets, invoices, variations, approvals, documentCounters } = require('./database');
const { eq, and, sql } = require('drizzle-orm');

// ============================================================================
// CORE CONFIGURATION
// ============================================================================

const CURRENT_YEAR = new Date().getFullYear();
const SEED_DATA_VERSION = "2024-09-08"; // Track seeding version for updates

// Dubai-focused business data for authentic interior design context
const DUBAI_CLIENTS = [
  {
    name: "Emirates Hospitality Group",
    email: "projects@emirateshospitality.ae",
    phone: "+971-4-567-8901",
    company: "Emirates Hospitality Group",
    address: "Dubai Marina, Tower 1, Level 45, Dubai, UAE"
  },
  {
    name: "Al-Mansouri Development",
    email: "sarah.almansouri@amd.ae", 
    phone: "+971-50-234-5678",
    company: "Al-Mansouri Development LLC",
    address: "Business Bay, Executive Heights, Floor 32, Dubai, UAE"
  },
  {
    name: "Henderson Family Trust",
    email: "contact@hendersonfamily.com",
    phone: "+971-4-789-0123",
    company: "Henderson Family Trust",
    address: "Palm Jumeirah, Signature Villas, Villa 15, Dubai, UAE"
  },
  {
    name: "TechFlow Solutions",
    email: "facilities@techflow.ae",
    phone: "+971-4-345-6789", 
    company: "TechFlow Solutions DMCC",
    address: "DMCC Business Centre, Level 23, JLT, Dubai, UAE"
  }
];

const INTERIOR_DESIGN_TEAM = [
  {
    name: "Maya Al-Rashid",
    email: "maya@firelynx.ae",
    role: "Senior Interior Designer", 
    specialization: "Luxury Residential & Hospitality",
    avatar: "/files/team/maya-alrashid.jpg"
  },
  {
    name: "James Morrison", 
    email: "james@firelynx.ae",
    role: "Project Director",
    specialization: "Commercial & Office Design",
    avatar: "/files/team/james-morrison.jpg"
  },
  {
    name: "Fatima Al-Zahra",
    email: "fatima@firelynx.ae", 
    role: "Design Coordinator",
    specialization: "Space Planning & 3D Visualization", 
    avatar: "/files/team/fatima-alzahra.jpg"
  },
  {
    name: "Roberto Silva",
    email: "roberto@firelynx.ae",
    role: "Technical Lead",
    specialization: "MEP Integration & Smart Home Systems",
    avatar: "/files/team/roberto-silva.jpg"
  }
];

const INTERIOR_PROJECTS = [
  {
    title: "Emirates Marina Hotel Renovation", 
    description: "Complete renovation of 200-room luxury hotel with modern Arabian design elements, incorporating sustainable materials and smart room technology.",
    status: "In Progress",
    priority: "High",
    budget: "2850000.00", // AED 2.85M 
    spent: "1920000.00",  // AED 1.92M (67% spent)
    progress: 72,
    startDate: new Date("2024-01-15"),
    targetDate: new Date("2025-06-30"),
    clientIndex: 0 // Emirates Hospitality Group
  },
  {
    title: "Business Bay Corporate Office",
    description: "Modern open-plan office design for 150 employees with collaborative spaces, executive areas, and wellness facilities including meditation rooms and fitness area.",
    status: "In Progress", 
    priority: "High",
    budget: "980000.00",  // AED 980K
    spent: "520000.00",   // AED 520K (53% spent)
    progress: 58,
    startDate: new Date("2024-02-10"),
    targetDate: new Date("2025-01-15"),
    clientIndex: 1 // Al-Mansouri Development
  },
  {
    title: "Palm Jumeirah Luxury Villa",
    description: "Contemporary luxury villa interior with panoramic sea views, featuring custom Italian furniture, automated lighting systems, and infinity pool area design.",
    status: "Planning",
    priority: "High", 
    budget: "1750000.00", // AED 1.75M
    spent: "125000.00",   // AED 125K (7% spent) 
    progress: 15,
    startDate: new Date("2024-08-01"),
    targetDate: new Date("2025-12-01"),
    clientIndex: 2 // Henderson Family Trust
  },
  {
    title: "DMCC Innovation Hub",
    description: "Tech-forward workspace design with flexible meeting rooms, innovation labs, café areas, and rooftop terrace for 75 tech professionals.",
    status: "On Hold",
    priority: "Medium",
    budget: "650000.00",  // AED 650K
    spent: "180000.00",   // AED 180K (28% spent)
    progress: 25, 
    startDate: new Date("2024-03-01"),
    targetDate: new Date("2025-04-30"),
    clientIndex: 3 // TechFlow Solutions
  }
];

// ============================================================================
// SEEDING FUNCTIONS  
// ============================================================================

async function clearExistingData() {
  console.log('🗑️  Clearing existing data...');
  
  // Clear in reverse foreign key order to avoid constraint violations
  const tables = [
    { name: 'approvals', table: approvals },
    { name: 'variations', table: variations }, 
    { name: 'invoices', table: invoices },
    { name: 'tickets', table: tickets },
    { name: 'file_assets', table: fileAssets },
    { name: 'milestones', table: milestones },
    { name: 'project_team', table: projectTeam },
    { name: 'projects', table: projects }, 
    { name: 'users', table: users },
    { name: 'clients', table: clients }
  ];

  for (const { name, table } of tables) {
    try {
      const result = await db.delete(table);
      console.log(`   ✓ Cleared ${name}`);
    } catch (error) {
      console.log(`   ⚠️  Could not clear ${name}: ${error.message}`);
    }
  }
}

async function seedDocumentCounters() {
  console.log('📊 Setting up document counters...');
  
  // Check if counter exists for current year
  const existingCounter = await db
    .select()
    .from(documentCounters)
    .where(eq(documentCounters.year, CURRENT_YEAR))
    .limit(1);
    
  if (existingCounter.length === 0) {
    await db.insert(documentCounters).values({
      year: CURRENT_YEAR,
      invoiceCounter: 12,     // Start at 12 to show established business
      variationCounter: 8,
      approvalCounter: 15,
      ticketCounter: 45
    });
    console.log(`   ✓ Created document counter for ${CURRENT_YEAR}`);
  } else {
    console.log(`   ✓ Document counter already exists for ${CURRENT_YEAR}`);
  }
}

async function seedClients() {
  console.log('🏢 Creating clients...');
  
  const clientData = DUBAI_CLIENTS.map(client => ({
    id: crypto.randomUUID(),
    ...client,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
  
  await db.insert(clients).values(clientData);
  console.log(`   ✓ Created ${clientData.length} clients`);
  
  return clientData;
}

async function seedUsers() {
  console.log('👥 Creating team members...');
  
  const userData = INTERIOR_DESIGN_TEAM.map(user => ({
    id: crypto.randomUUID(),
    ...user,
    isOnline: Math.random() > 0.3, // 70% chance online
    createdAt: new Date(),
    updatedAt: new Date()
  }));
  
  await db.insert(users).values(userData);
  console.log(`   ✓ Created ${userData.length} team members`);
  
  return userData;
}

async function seedProjects(clientData) {
  console.log('🏗️  Creating interior design projects...');
  
  const projectData = INTERIOR_PROJECTS.map((project, index) => ({
    id: crypto.randomUUID(),
    clientId: clientData[project.clientIndex].id,
    ...project,
    createdAt: project.startDate,
    updatedAt: new Date()
  }));
  
  // Remove clientIndex since it's not a database field
  projectData.forEach(project => {
    delete project.clientIndex;
  });
  
  await db.insert(projects).values(projectData);
  console.log(`   ✓ Created ${projectData.length} projects`);
  
  return projectData;
}

async function seedProjectTeams(projectData, userData) {
  console.log('👨‍💼 Assigning team members to projects...');
  
  const teamAssignments = [];
  
  for (const project of projectData) {
    // Assign lead designer based on project type
    let leadDesignerIndex;
    if (project.title.includes('Hotel') || project.title.includes('Villa')) {
      leadDesignerIndex = 0; // Maya - Luxury specialist
    } else {
      leadDesignerIndex = 1; // James - Commercial specialist  
    }
    
    // Each project gets lead + 1-2 supporting team members
    const teamSize = Math.random() > 0.5 ? 3 : 2;
    const assignedUsers = [leadDesignerIndex];
    
    // Add supporting team members randomly
    while (assignedUsers.length < teamSize) {
      const randomIndex = Math.floor(Math.random() * userData.length);
      if (!assignedUsers.includes(randomIndex)) {
        assignedUsers.push(randomIndex);
      }
    }
    
    // Create team assignments
    for (const userIndex of assignedUsers) {
      teamAssignments.push({
        id: crypto.randomUUID(),
        projectId: project.id,
        userId: userData[userIndex].id,
        role: userIndex === leadDesignerIndex ? 'Lead Designer' : 'Supporting Designer',
        addedAt: project.createdAt
      });
    }
  }
  
  await db.insert(projectTeam).values(teamAssignments);
  console.log(`   ✓ Created ${teamAssignments.length} team assignments`);
  
  return teamAssignments;
}

async function seedMilestones(projectData) {
  console.log('🎯 Creating project milestones...');
  
  const milestoneTemplates = [
    { title: 'Design Concept Development', progress: 90, daysFromStart: 14 },
    { title: 'Client Presentation & Approval', progress: 85, daysFromStart: 21 },  
    { title: 'Detailed Design & Documentation', progress: 60, daysFromStart: 45 },
    { title: 'Procurement & Material Selection', progress: 40, daysFromStart: 60 },
    { title: 'Construction & Installation', progress: 20, daysFromStart: 90 },
    { title: 'Final Inspections & Handover', progress: 0, daysFromStart: 120 }
  ];
  
  const milestoneData = [];
  
  for (const project of projectData) {
    for (const template of milestoneTemplates) {
      const expectedDate = new Date(project.startDate);
      expectedDate.setDate(expectedDate.getDate() + template.daysFromStart);
      
      let status = 'Pending';
      let completedDate = null;
      
      if (template.progress >= 90) {
        status = 'Completed';
        completedDate = new Date(expectedDate);
        completedDate.setDate(completedDate.getDate() - 2); // Completed 2 days early
      } else if (template.progress >= 50) {
        status = 'In Progress'; 
      }
      
      milestoneData.push({
        id: crypto.randomUUID(),
        projectId: project.id,
        title: template.title,
        description: `${template.title} phase for ${project.title}`,
        status,
        progress: template.progress,
        expectedDate,
        completedDate,
        createdAt: project.startDate,
        updatedAt: new Date()
      });
    }
  }
  
  await db.insert(milestones).values(milestoneData);
  console.log(`   ✓ Created ${milestoneData.length} milestones`);
  
  return milestoneData;
}

async function seedFileAssets(projectData, userData) {
  console.log('📁 Creating file assets...');
  
  // File templates for interior design projects
  const fileTemplates = [
    { filename: 'concept-sketches.pdf', contentType: 'application/pdf', size: 2450000, visibility: 'Client' },
    { filename: '3d-renderings-living-room.jpg', contentType: 'image/jpeg', size: 890000, visibility: 'Client' },
    { filename: 'material-board-bedroom.jpg', contentType: 'image/jpeg', size: 1200000, visibility: 'Client' },
    { filename: 'floor-plan-final.dwg', contentType: 'application/octet-stream', size: 340000, visibility: 'Internal' },
    { filename: 'lighting-plan.pdf', contentType: 'application/pdf', size: 780000, visibility: 'Client' },
    { filename: 'furniture-specifications.xlsx', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 120000, visibility: 'Internal' }
  ];
  
  const fileAssetData = [];
  
  for (const project of projectData) {
    // Each project gets 3-5 files
    const fileCount = 3 + Math.floor(Math.random() * 3);
    const selectedFiles = fileTemplates.slice(0, fileCount);
    
    for (const fileTemplate of selectedFiles) {
      const fileId = crypto.randomUUID();
      const cleanFilename = fileTemplate.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      
      fileAssetData.push({
        id: fileId,
        projectId: project.id,
        milestoneId: null, // Not linking to specific milestones for now
        ticketId: null,
        uploadedByUserId: userData[Math.floor(Math.random() * userData.length)].id,
        filename: `${fileId}_${cleanFilename}`,
        originalName: fileTemplate.filename,
        url: `/files/${fileId}_${cleanFilename}`,
        contentType: fileTemplate.contentType,
        size: fileTemplate.size,
        visibility: fileTemplate.visibility,
        createdAt: new Date(project.startDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within 30 days of start
      });
    }
  }
  
  await db.insert(fileAssets).values(fileAssetData);
  console.log(`   ✓ Created ${fileAssetData.length} file assets`);
  
  return fileAssetData;
}

async function seedTickets(projectData, userData) {
  console.log('🎫 Creating support tickets...');
  
  const ticketTemplates = [
    {
      subject: 'Material Color Adjustment Request',
      description: 'Client requested to change living room accent wall from navy blue to sage green to better match existing artwork.',
      category: 'Change Request',
      priority: 'Medium',
      status: 'Open'
    },
    {
      subject: 'Lighting Fixture Installation Issue',
      description: 'Chandelier in dining room cannot be installed as planned due to unexpected beam structure. Need alternative mounting solution.',
      category: 'Technical Issue', 
      priority: 'High',
      status: 'In Progress'
    },
    {
      subject: 'Budget Approval for Upgraded Flooring',
      description: 'Client wants to upgrade from standard hardwood to premium European oak flooring. Additional cost: AED 25,000.',
      category: 'Budget Request',
      priority: 'Low',
      status: 'Pending Client'
    },
    {
      subject: 'Delivery Delay Notification',
      description: 'Custom furniture from Italian supplier delayed by 3 weeks. Impact on project timeline needs assessment.',
      category: 'Schedule Update',
      priority: 'High', 
      status: 'Resolved'
    }
  ];
  
  const ticketData = [];
  
  for (const project of projectData) {
    // Each project gets 1-3 tickets
    const ticketCount = 1 + Math.floor(Math.random() * 3);
    const selectedTickets = ticketTemplates.slice(0, ticketCount);
    
    for (let i = 0; i < selectedTickets.length; i++) {
      const template = selectedTickets[i];
      const requesterUser = userData[Math.floor(Math.random() * userData.length)];
      const assigneeUser = userData[Math.floor(Math.random() * userData.length)];
      
      ticketData.push({
        id: crypto.randomUUID(),
        projectId: project.id,
        number: `TK-${CURRENT_YEAR}-${String(ticketData.length + 1).padStart(4, '0')}`,
        subject: template.subject,
        description: template.description,
        category: template.category,
        priority: template.priority,
        status: template.status,
        requesterUserId: requesterUser.id,
        assigneeUserId: assigneeUser.id,
        attachments: JSON.stringify([]),
        createdAt: new Date(project.startDate.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000), // Random within 60 days
        updatedAt: new Date()
      });
    }
  }
  
  await db.insert(tickets).values(ticketData);
  console.log(`   ✓ Created ${ticketData.length} support tickets`);
  
  return ticketData;
}

async function seedInvoices(projectData) {
  console.log('💰 Creating invoices...');
  
  const invoiceData = [];
  
  for (const project of projectData) {
    // Each project gets 1-2 invoices based on progress
    const invoiceCount = project.progress > 50 ? 2 : 1;
    
    for (let i = 0; i < invoiceCount; i++) {
      const isFirstInvoice = i === 0;
      const amount = isFirstInvoice 
        ? Math.round(parseFloat(project.budget) * 0.3) // 30% upfront
        : Math.round(parseFloat(project.budget) * 0.4); // 40% progress payment
      
      const status = isFirstInvoice ? 'Paid' : project.progress > 70 ? 'Paid' : 'Sent';
      
      invoiceData.push({
        id: crypto.randomUUID(),
        projectId: project.id,
        number: `INV-${CURRENT_YEAR}-${String(invoiceData.length + 1).padStart(4, '0')}`,
        description: isFirstInvoice 
          ? `Initial design payment - ${project.title}`
          : `Progress payment (${project.progress}% completion) - ${project.title}`,
        amount: amount.toString(),
        currency: 'AED',
        status,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        paidDate: status === 'Paid' ? new Date() : null,
        notes: 'Payment as per agreed milestone schedule',
        createdAt: new Date(project.startDate.getTime() + (i * 45 * 24 * 60 * 60 * 1000)), // 45 days apart
        updatedAt: new Date()
      });
    }
  }
  
  await db.insert(invoices).values(invoiceData);
  console.log(`   ✓ Created ${invoiceData.length} invoices`);
  
  return invoiceData;
}

// ============================================================================
// MAIN SEEDING EXECUTION
// ============================================================================

async function runSeed() {
  try {
    console.log('🌱 Starting FireLynx Database Seeding...');
    console.log(`📅 Seeding version: ${SEED_DATA_VERSION}`);
    console.log(`🗓️  Target year: ${CURRENT_YEAR}`);
    
    // Clear existing data for clean slate
    await clearExistingData();
    
    // Seed core data in dependency order
    await seedDocumentCounters();
    const clientData = await seedClients();
    const userData = await seedUsers(); 
    const projectData = await seedProjects(clientData);
    const teamData = await seedProjectTeams(projectData, userData);
    const milestoneData = await seedMilestones(projectData);
    const fileData = await seedFileAssets(projectData, userData);
    const ticketData = await seedTickets(projectData, userData);
    const invoiceData = await seedInvoices(projectData);
    
    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📊 SUMMARY:');
    console.log(`   • Clients: ${clientData.length}`);
    console.log(`   • Team members: ${userData.length}`); 
    console.log(`   • Projects: ${projectData.length}`);
    console.log(`   • Team assignments: ${teamData.length}`);
    console.log(`   • Milestones: ${milestoneData.length}`);
    console.log(`   • File assets: ${fileData.length}`);
    console.log(`   • Support tickets: ${ticketData.length}`);
    console.log(`   • Invoices: ${invoiceData.length}`);
    console.log('\n🎯 Database is ready with comprehensive demo data!');
    
    // Return summary for API use
    return {
      success: true,
      message: 'Database seeded successfully',
      counts: {
        clients: clientData.length,
        users: userData.length,
        projects: projectData.length,
        teamAssignments: teamData.length,
        milestones: milestoneData.length,
        fileAssets: fileData.length,
        tickets: ticketData.length,
        invoices: invoiceData.length
      },
      version: SEED_DATA_VERSION
    };
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Allow running directly with node or requiring as module
if (require.main === module) {
  runSeed()
    .then(() => {
      console.log('🏁 Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = { runSeed };