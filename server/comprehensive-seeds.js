// Comprehensive Demo Data for Projects A, B, C as per Global Audit Plan

const { db, clients, users, projects, milestones, milestoneFiles, fileAssets, invoices, variationRequests, tickets, approvalPackets, approvalItems, projectTeam, documentCounters } = require('./database');
const { eq } = require('drizzle-orm');
const crypto = require('crypto');

// Helper function to generate consistent IDs
function generateId() {
  return crypto.randomUUID();
}

// Generate auto-numbers
let invoiceCounter = 1;
let variationCounter = 1;
let ticketCounter = 1;
let approvalCounter = 1;

function getNextInvoiceNumber() {
  return `INV-2025-${invoiceCounter.toString().padStart(4, '0')}`;
}

function getNextVariationNumber() {
  return `VR-2025-${variationCounter.toString().padStart(4, '0')}`;
}

function getNextTicketNumber() {
  return `TK-2025-${ticketCounter.toString().padStart(4, '0')}`;
}

function getNextApprovalNumber() {
  return `AP-2025-${approvalCounter.toString().padStart(4, '0')}`;
}

async function seedComprehensiveData() {
  try {
    console.log('🌱 Creating comprehensive demo data (Projects A, B, C)...');

    // Clear existing data in proper order (respecting foreign keys)
    await db.delete(projectTeam).execute();
    await db.delete(approvalItems).execute();
    await db.delete(approvalPackets).execute();
    await db.delete(tickets).execute();
    await db.delete(variationRequests).execute();
    await db.delete(invoices).execute();
    await db.delete(fileAssets).execute();
    await db.delete(milestoneFiles).execute();  // Must delete milestone_files BEFORE milestones
    await db.delete(milestones).execute();
    await db.delete(projects).execute();
    await db.delete(users).execute();
    await db.delete(clients).execute();

    // Clear and initialize document counters for current year
    await db.delete(documentCounters);
    const currentYear = new Date().getFullYear();
    await db.insert(documentCounters).values({
      year: currentYear,
      invoiceCounter: 0,
      variationCounter: 0,
      approvalCounter: 0,
      ticketCounter: 0
    });

    // Create Clients
    const clientA = generateId();
    const clientB = generateId();
    const clientC = generateId();

    await db.insert(clients).values([
      {
        id: clientA,
        name: 'Henderson Family Trust',
        email: 'contact@hendersonfamily.com',
        phone: '+1 (555) 123-4567',
        company: 'Henderson Family Trust',
        address: '123 Luxury Lane, Beverly Hills, CA 90210'
      },
      {
        id: clientB,
        name: 'Sarah Mitchell',
        email: 'sarah.mitchell@email.com',
        phone: '+1 (555) 234-5678',
        company: 'Mitchell Properties',
        address: '456 Downtown Ave, New York, NY 10001'
      },
      {
        id: clientC,
        name: 'TechFlow Solutions',
        email: 'projects@techflow.com',
        phone: '+1 (555) 345-6789',
        company: 'TechFlow Solutions Inc.',
        address: '789 Innovation Dr, San Francisco, CA 94105'
      }
    ]);

    // Create Users (Team Members)
    const designerAlice = generateId();
    const managerBob = generateId();
    const architectCarol = generateId();

    await db.insert(users).values([
      {
        id: designerAlice,
        name: 'Alice Cooper',
        email: 'alice@firelynx.com',
        role: 'Lead Designer',
        phone: '+1 (555) 111-2222'
      },
      {
        id: managerBob,
        name: 'Bob Wilson',
        email: 'bob@firelynx.com',
        role: 'Project Manager',
        phone: '+1 (555) 333-4444'
      },
      {
        id: architectCarol,
        name: 'Carol Davis',
        email: 'carol@firelynx.com',
        role: 'Senior Architect',
        phone: '+1 (555) 555-6666'
      }
    ]);

    // Create Projects
    const projectA = generateId();
    const projectB = generateId();
    const projectC = generateId();

    await db.insert(projects).values([
      {
        id: projectA,
        clientId: clientA,
        title: 'Luxury Villa Renovation',
        description: 'Complete renovation of a luxury villa with modern interior design and smart home integration.',
        status: 'In Progress',
        priority: 'High',
        budget: '280000.00',
        spent: '182000.00',
        progress: 65,
        startDate: new Date('2024-01-15'),
        targetDate: new Date('2025-08-30'),
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      },
      {
        id: projectB,
        clientId: clientB,
        title: 'Modern Downtown Loft',
        description: 'Contemporary loft design with open concept living and industrial elements.',
        status: 'In Progress',
        priority: 'Medium',
        budget: '150000.00',
        spent: '102000.00',
        progress: 68,
        startDate: new Date('2024-03-01'),
        targetDate: new Date('2025-05-15'),
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date()
      },
      {
        id: projectC,
        clientId: clientC,
        title: 'Corporate Office Design',
        description: 'Modern office space design for technology company with collaborative areas.',
        status: 'On Hold',
        priority: 'Medium',
        budget: '320000.00',
        spent: '144000.00',
        progress: 45,
        startDate: new Date('2024-02-10'),
        targetDate: new Date('2025-09-20'),
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date()
      }
    ]);

    // Create Team Members for Projects
    await db.insert(projectTeam).values([
      // Project A team
      {
        id: generateId(),
        projectId: projectA,
        userId: designerAlice,
        role: 'Lead Designer'
      },
      {
        id: generateId(),
        projectId: projectA,
        userId: managerBob,
        role: 'Project Manager'
      },
      // Project B team
      {
        id: generateId(),
        projectId: projectB,
        userId: architectCarol,
        role: 'Senior Architect'
      },
      {
        id: generateId(),
        projectId: projectB,
        userId: designerAlice,
        role: 'Designer'
      }
    ]);

    // Create Milestones for Project A
    const milestoneA1 = generateId();
    const milestoneA2 = generateId();
    const milestoneA3 = generateId();

    await db.insert(milestones).values([
      {
        id: milestoneA1,
        projectId: projectA,
        title: 'Initial Consultation',
        description: 'Client meeting, requirements gathering, site assessment',
        status: 'Completed',
        progress: 100,
        expectedDate: new Date('2024-01-30'),
        completedDate: new Date('2024-01-28'),
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-28')
      },
      {
        id: milestoneA2,
        projectId: projectA,
        title: 'Design Development',
        description: 'Detailed design drawings and material specifications',
        status: 'In Progress',
        progress: 85,
        expectedDate: new Date('2024-04-15'),
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      },
      {
        id: milestoneA3,
        projectId: projectA,
        title: 'Material Selection',
        description: 'Finalize all materials, fixtures, and furnishings',
        status: 'Pending',
        progress: 45,
        expectedDate: new Date('2024-06-01'),
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      }
    ]);

    // Create Milestone for Project B
    const milestoneB1 = generateId();

    await db.insert(milestones).values([
      {
        id: milestoneB1,
        projectId: projectB,
        title: 'Space Planning',
        description: 'Layout optimization and space utilization planning',
        status: 'In Progress',
        progress: 70,
        expectedDate: new Date('2024-05-01'),
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date()
      }
    ]);

    // Create File Assets
    const fileA1 = generateId();
    const fileA2 = generateId();
    const fileA3 = generateId();

    await db.insert(fileAssets).values([
      {
        id: fileA1,
        projectId: projectA,
        milestoneId: milestoneA1,
        uploadedByUserId: managerBob,
        filename: 'consultation_notes.pdf',
        originalName: 'Initial Consultation Notes.pdf',
        url: '/uploads/consultation_notes.pdf',
        contentType: 'application/pdf',
        size: 245600,
        visibility: 'Client'
      },
      {
        id: fileA2,
        projectId: projectA,
        milestoneId: milestoneA2,
        uploadedByUserId: designerAlice,
        filename: 'living_room_concept.jpg',
        originalName: 'Living Room Concept Design.jpg',
        url: '/uploads/living_room_concept.jpg',
        contentType: 'image/jpeg',
        size: 1024000,
        visibility: 'Client'
      },
      {
        id: fileA3,
        projectId: projectA,
        milestoneId: milestoneA2,
        uploadedByUserId: designerAlice,
        filename: 'kitchen_layout.jpg',
        originalName: 'Kitchen Layout Design.jpg',
        url: '/uploads/kitchen_layout.jpg',
        contentType: 'image/jpeg',
        size: 856000,
        visibility: 'Client'
      }
    ]);

    // Update counters and create Invoices
    await db.update(documentCounters)
      .set({ invoiceCounter: 1, updatedAt: new Date() })
      .where(eq(documentCounters.year, currentYear));
    invoiceCounter = 2;

    const invoiceA1 = generateId();
    const invoiceB1 = generateId();

    await db.insert(invoices).values([
      {
        id: invoiceA1,
        projectId: projectA,
        number: 'INV-2025-0001',
        issueDate: new Date('2024-02-01'),
        dueDate: new Date('2024-02-15'),
        currency: 'USD',
        lineItems: JSON.stringify([
          {
            description: 'Initial Design Consultation',
            quantity: 1,
            rate: 2500.00,
            taxPercent: 8.25,
            amount: 2500.00
          },
          {
            description: 'Site Assessment & Measurements',
            quantity: 8,
            rate: 150.00,
            taxPercent: 8.25,
            amount: 1200.00
          }
        ]),
        subtotal: '3700.00',
        taxTotal: '305.25',
        total: '4005.25',
        status: 'Paid',
        sentAt: new Date('2024-02-01'),
        paidAt: new Date('2024-02-10'),
        notes: 'Initial phase payment - thank you!'
      },
      {
        id: invoiceB1,
        projectId: projectB,
        number: 'INV-2025-0002',
        issueDate: new Date('2024-04-01'),
        dueDate: new Date('2024-04-15'),
        currency: 'USD',
        lineItems: JSON.stringify([
          {
            description: 'Space Planning & Design',
            quantity: 1,
            rate: 4500.00,
            taxPercent: 8.25,
            amount: 4500.00
          }
        ]),
        subtotal: '4500.00',
        taxTotal: '371.25',
        total: '4871.25',
        status: 'Sent',
        sentAt: new Date('2024-04-01'),
        notes: 'Phase 1 design work completed'
      }
    ]);

    // Update counters and create Variations
    await db.update(documentCounters)
      .set({ variationCounter: 2, updatedAt: new Date() })
      .where(eq(documentCounters.year, currentYear));
    variationCounter = 3;

    const variationA1 = generateId();
    const variationA2 = generateId();
    const variationB1 = generateId();

    await db.insert(variationRequests).values([
      {
        id: variationA1,
        projectId: projectA,
        number: 'VR-2025-0001',
        date: new Date('2024-03-15'),
        changeRequestor: 'Henderson Family Trust',
        changeReference: 'Living Room Enhancement Request',
        changeArea: 'Living Room',
        workTypes: JSON.stringify(['Joinery']),
        categories: JSON.stringify(['Scope', 'Quality']),
        changeDescription: 'Add custom built-in entertainment center with integrated lighting',
        reasonDescription: 'Client wants enhanced entertainment experience with premium finishes',
        technicalChanges: 'Custom millwork installation, electrical updates for lighting',
        resourcesAndCosts: 'Additional $15,000 for materials and labor',
        status: 'Under Review',
        attachments: JSON.stringify([])
      },
      {
        id: variationA2,
        projectId: projectA,
        number: 'VR-2025-0002',
        date: new Date('2024-04-01'),
        changeRequestor: 'Henderson Family Trust',
        changeReference: 'Bathroom Lighting Upgrade',
        changeArea: 'Master Bathroom',
        workTypes: JSON.stringify(['Electrical', 'Lighting']),
        categories: JSON.stringify(['Cost', 'Scope']),
        changeDescription: 'Upgrade to smart lighting system with motion sensors',
        reasonDescription: 'Enhance functionality and energy efficiency',
        technicalChanges: 'Install smart switches, motion sensors, app integration',
        resourcesAndCosts: 'Additional $3,500 for smart lighting components',
        status: 'Pending',
        attachments: JSON.stringify([])
      },
      {
        id: variationB1,
        projectId: projectB,
        number: 'VR-2025-0003',
        date: new Date('2024-03-20'),
        changeRequestor: 'Sarah Mitchell',
        changeReference: 'Exposed Brick Wall Feature',
        changeArea: 'Main Living Area',
        workTypes: JSON.stringify(['Structural', 'Demolition']),
        categories: JSON.stringify(['Design', 'Cost']),
        changeDescription: 'Expose existing brick wall and apply protective sealant',
        reasonDescription: 'Enhance industrial aesthetic as requested by client',
        technicalChanges: 'Careful demolition, brick restoration, sealing',
        resourcesAndCosts: 'Additional $4,200 for demolition and restoration work',
        status: 'Approved',
        disposition: 'Approved',
        dispositionReason: 'Enhances design vision and within budget parameters',
        attachments: JSON.stringify([])
      }
    ]);

    // Update counters and create Tickets
    await db.update(documentCounters)
      .set({ ticketCounter: 2, updatedAt: new Date() })
      .where(eq(documentCounters.year, currentYear));
    ticketCounter = 3;

    const ticketA1 = generateId();
    const ticketA2 = generateId();

    await db.insert(tickets).values([
      {
        id: ticketA1,
        projectId: projectA,
        number: 'TK-2025-0001',
        subject: 'Lighting issue in dining area',
        description: 'The pendant lights over the dining table are flickering intermittently. Appears to be an electrical connection issue.',
        category: 'Electrical',
        priority: 'High',
        status: 'Open',
        assigneeUserId: architectCarol,
        requesterUserId: managerBob,
        attachments: JSON.stringify([])
      },
      {
        id: ticketA2,
        projectId: projectA,
        number: 'TK-2025-0002',
        subject: 'Site access hours clarification',
        description: 'Need to confirm building access hours for weekend work. Security mentioned restrictions.',
        category: 'General',
        priority: 'Medium',
        status: 'Resolved',
        assigneeUserId: managerBob,
        requesterUserId: designerAlice,
        attachments: JSON.stringify([])
      }
    ]);

    // Update counters and create Approval Packets
    await db.update(documentCounters)
      .set({ approvalCounter: 1, updatedAt: new Date() })
      .where(eq(documentCounters.year, currentYear));

    const approvalB1 = generateId();

    await db.insert(approvalPackets).values([
      {
        id: approvalB1,
        projectId: projectB,
        number: 'AP-2025-0001',
        title: 'Living Area Design Approval',
        description: 'Final design concepts for main living area including furniture layouts and material selections',
        dueDate: new Date('2024-05-01'),
        status: 'Sent',
        sentAt: new Date('2024-04-15')
      }
    ]);

    // Create mock approval files and items
    const approvalFileB1 = generateId();
    const approvalFileB2 = generateId();

    await db.insert(fileAssets).values([
      {
        id: approvalFileB1,
        projectId: projectB,
        uploadedByUserId: designerAlice,
        filename: 'living_area_layout.jpg',
        originalName: 'Living Area Layout Design.jpg',
        url: '/uploads/living_area_layout.jpg',
        contentType: 'image/jpeg',
        size: 950000,
        visibility: 'Client'
      },
      {
        id: approvalFileB2,
        projectId: projectB,
        uploadedByUserId: designerAlice,
        filename: 'material_selections.pdf',
        originalName: 'Material Selections Board.pdf',
        url: '/uploads/material_selections.pdf',
        contentType: 'application/pdf',
        size: 1240000,
        visibility: 'Client'
      }
    ]);

    await db.insert(approvalItems).values([
      {
        id: generateId(),
        packetId: approvalB1,
        fileAssetId: approvalFileB1,
        decision: 'Pending'
      },
      {
        id: generateId(),
        packetId: approvalB1,
        fileAssetId: approvalFileB2,
        decision: 'Pending'
      }
    ]);

    console.log('✅ Comprehensive demo data created successfully!');
    console.log('\n=== Demo Data Summary ===');
    console.log('Project A — Luxury Villa Renovation (In Progress, 65%)');
    console.log('  Team: 2, Milestones: 3, Files: 3');
    console.log('  Variations: 2, Approvals: 0, Invoices: 1 (Paid), Tickets: 2');
    console.log('\nProject B — Modern Downtown Loft (In Progress, 68%)');
    console.log('  Team: 2, Milestones: 1, Files: 2');
    console.log('  Variations: 1 (Approved), Approvals: 1 (Sent), Invoices: 1 (Sent), Tickets: 0');
    console.log('\nProject C — Corporate Office Design (On Hold, 45%)');
    console.log('  Team: 0, Milestones: 0, Files: 0');
    console.log('  Variations: 0, Approvals: 0, Invoices: 0, Tickets: 0');
    console.log('\n=== Document Numbers Generated ===');
    console.log('INV-2025-0001 (Paid), INV-2025-0002 (Sent)');
    console.log('VR-2025-0001 (Under Review), VR-2025-0002 (Pending), VR-2025-0003 (Approved)');
    console.log('TK-2025-0001 (Open), TK-2025-0002 (Resolved)');
    console.log('AP-2025-0001 (Sent with 2 files)');
    console.log('=== End Summary ===\n');

  } catch (error) {
    console.error('❌ Error creating comprehensive demo data:', error);
    throw error;
  }
}

module.exports = { seedComprehensiveData };