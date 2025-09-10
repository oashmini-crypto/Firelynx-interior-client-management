// FireLynx Comprehensive Seed Data
// Populates the database with demo content as specified in requirements

const { db, clients, users, projects, projectTeam, milestones, fileAssets, invoices, 
        approvalPackets, approvalItems, variationRequests, tickets, brandingSettings } = require('./database');

// Create predictable UUID mapping for consistent demo data relationships
const createPredictableUUID = (seed) => {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(seed).digest('hex');
  return `${hash.slice(0,8)}-${hash.slice(8,12)}-4${hash.slice(13,16)}-8${hash.slice(17,20)}-${hash.slice(20,32)}`;
};

// Predictable UUIDs for demo data consistency
const DEMO_IDS = {
  clients: {
    khan: createPredictableUUID('client_khan_family'),
    silverstone: createPredictableUUID('client_silverstone_properties'),
    techflow: createPredictableUUID('client_techflow_inc')
  },
  users: {
    michael: createPredictableUUID('user_michael_rodriguez'),
    emily: createPredictableUUID('user_emily_chen'),
    david: createPredictableUUID('user_david_park'),
    sarah: createPredictableUUID('user_sarah_johnson')
  },
  projects: {
    villa: createPredictableUUID('project_luxury_villa'),
    loft: createPredictableUUID('project_downtown_loft'),
    office: createPredictableUUID('project_corporate_office')
  },
  milestones: {
    consultation: createPredictableUUID('milestone_initial_consultation'),
    design: createPredictableUUID('milestone_design_development'), 
    materials: createPredictableUUID('milestone_material_selection'),
    planning: createPredictableUUID('milestone_space_planning')
  },
  files: {
    consultation_notes: createPredictableUUID('file_consultation_notes'),
    living_room: createPredictableUUID('file_living_room_concept'),
    kitchen: createPredictableUUID('file_kitchen_layout'),
    light_issue: createPredictableUUID('file_light_flicker_issue'),
    wood_samples: createPredictableUUID('file_wood_finish_samples'),
    cabinet_ref: createPredictableUUID('file_cabinet_reference'),
    lighting_specs: createPredictableUUID('file_smart_lighting_specs')
  },
  branding: createPredictableUUID('branding_default_settings')
};

async function seedDemoData() {
  console.log('🌱 Starting seed process...');
  
  try {
    // Clean existing data (development only)
    console.log('🗑️  Cleaning existing data...');
    await db.delete(fileAssets);
    await db.delete(approvalItems);
    await db.delete(approvalPackets);
    await db.delete(variationRequests);
    await db.delete(tickets);
    await db.delete(invoices);
    await db.delete(projectTeam);
    await db.delete(milestones);
    await db.delete(projects);
    await db.delete(users);
    await db.delete(clients);
    await db.delete(brandingSettings);
    
    console.log('👥 Seeding clients...');
    const seedClients = await db
      .insert(clients)
      .values([
        {
          id: DEMO_IDS.clients.khan,
          name: 'Khan Family',
          email: 'contact@khanfamily.com',
          phone: '+1 (555) 123-4567',
          company: null,
          address: '123 Luxury Lane, Beverly Hills, CA 90210'
        },
        {
          id: DEMO_IDS.clients.silverstone, 
          name: 'Silverstone Properties',
          email: 'projects@silverstone.com',
          phone: '+1 (555) 987-6543',
          company: 'Silverstone Properties LLC',
          address: '456 Downtown Ave, Los Angeles, CA 90015'
        },
        {
          id: DEMO_IDS.clients.techflow,
          name: 'TechFlow Inc.',
          email: 'facilities@techflow.com', 
          phone: '+1 (555) 456-7890',
          company: 'TechFlow Inc.',
          address: '789 Innovation Blvd, San Francisco, CA 94105'
        }
      ])
      .returning();
    
    console.log('🧑‍💼 Seeding users...');
    const seedUsers = await db
      .insert(users)
      .values([
        {
          id: DEMO_IDS.users.michael,
          name: 'Michael Rodriguez',
          email: 'michael@firelynx.com',
          role: 'Manager',
          phone: '+1 (555) 001-0001',
          specialization: 'Project Management',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          isOnline: true
        },
        {
          id: DEMO_IDS.users.emily,
          name: 'Emily Chen',
          email: 'emily@firelynx.com',
          role: 'Designer',
          phone: '+1 (555) 002-0002', 
          specialization: 'Interior Design',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          isOnline: false
        },
        {
          id: DEMO_IDS.users.david,
          name: 'David Park',
          email: 'david@firelynx.com',
          role: 'Designer',
          phone: '+1 (555) 003-0003',
          specialization: 'Space Planning',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          isOnline: true
        },
        {
          id: DEMO_IDS.users.sarah,
          name: 'Sarah Johnson',
          email: 'sarah@firelynx.com', 
          role: 'Manager',
          phone: '+1 (555) 004-0004',
          specialization: 'Client Relations',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          isOnline: true
        }
      ])
      .returning();
    
    console.log('🏗️  Seeding projects...');
    const seedProjects = await db
      .insert(projects)
      .values([
        {
          id: DEMO_IDS.projects.villa,
          clientId: DEMO_IDS.clients.khan,
          title: 'Luxury Villa Renovation',
          description: 'Complete renovation of a 5,000 sq ft villa including kitchen, bathrooms, living spaces, and outdoor areas. Modern design with luxury finishes.',
          status: 'In Progress',
          priority: 'High',
          budget: '150000.00',
          spent: '97500.00',
          progress: 65,
          startDate: new Date('2024-08-01'),
          targetDate: new Date('2025-03-01')
        },
        {
          id: DEMO_IDS.projects.loft,
          clientId: DEMO_IDS.clients.silverstone, 
          title: 'Modern Downtown Loft',
          description: 'Contemporary loft conversion with open-plan living, industrial elements, and smart home integration.',
          status: 'In Progress',
          priority: 'Medium',
          budget: '85000.00',
          spent: '57800.00',
          progress: 68,
          startDate: new Date('2024-09-15'),
          targetDate: new Date('2025-02-15')
        },
        {
          id: DEMO_IDS.projects.office,
          clientId: DEMO_IDS.clients.techflow,
          title: 'Corporate Office Design',
          description: 'Modern office design for tech company with collaborative spaces, phone booths, and wellness areas.',
          status: 'On Hold',
          priority: 'Medium',
          budget: '200000.00',
          spent: '90000.00',
          progress: 45,
          startDate: new Date('2024-07-01'),
          targetDate: new Date('2025-05-01')
        }
      ])
      .returning();
    
    console.log('👥 Seeding project teams...');
    await db
      .insert(projectTeam)
      .values([
        // Luxury Villa Renovation team
        { id: 'team_001', projectId: 'proj_001', userId: 'user_001', role: 'Project Manager' },
        { id: 'team_002', projectId: 'proj_001', userId: 'user_002', role: 'Lead Designer' },
        
        // Modern Downtown Loft team  
        { id: 'team_003', projectId: 'proj_002', userId: 'user_003', role: 'Lead Designer' },
        { id: 'team_004', projectId: 'proj_002', userId: 'user_004', role: 'Client Manager' }
      ]);
    
    console.log('🎯 Seeding milestones...');
    const seedMilestones = await db
      .insert(milestones)
      .values([
        // Luxury Villa Renovation milestones
        {
          id: 'milestone_001',
          projectId: 'proj_001',
          title: 'Initial Consultation',
          description: 'Client consultation, site survey, and requirements gathering',
          status: 'Completed',
          progress: 100,
          expectedDate: new Date('2024-08-15'),
          completedDate: new Date('2024-08-14')
        },
        {
          id: 'milestone_002', 
          projectId: 'proj_001',
          title: 'Design Development',
          description: 'Detailed design development including floor plans, elevations, and material selections',
          status: 'In Progress',
          progress: 85,
          expectedDate: new Date('2024-11-30')
        },
        {
          id: 'milestone_003',
          projectId: 'proj_001', 
          title: 'Material Selection',
          description: 'Final material and fixture selections with client approval',
          status: 'Pending',
          progress: 45,
          expectedDate: new Date('2024-12-31')
        },
        
        // Modern Downtown Loft milestones
        {
          id: 'milestone_004',
          projectId: 'proj_002',
          title: 'Space Planning',
          description: 'Open-plan layout design and furniture planning',
          status: 'In Progress',
          progress: 75,
          expectedDate: new Date('2024-12-15')
        }
      ])
      .returning();
    
    console.log('📁 Seeding file assets...');
    await db
      .insert(fileAssets)
      .values([
        // Luxury Villa - Initial Consultation files
        {
          id: 'file_001',
          projectId: 'proj_001',
          milestoneId: 'milestone_001',
          uploadedByUserId: 'user_001',
          filename: 'consultation_notes_2024.pdf',
          originalName: 'consultation_notes.pdf',
          url: '/uploads/consultation_notes_2024.pdf',
          contentType: 'application/pdf',
          size: 2048576,
          visibility: 'Client'
        },
        
        // Luxury Villa - Design Development files
        {
          id: 'file_002',
          projectId: 'proj_001',
          milestoneId: 'milestone_002',
          uploadedByUserId: 'user_002',
          filename: 'living_room_concept_v3.jpg',
          originalName: 'living_room_concept.jpg',
          url: '/uploads/living_room_concept_v3.jpg', 
          contentType: 'image/jpeg',
          size: 3145728,
          visibility: 'Client'
        },
        {
          id: 'file_003',
          projectId: 'proj_001',
          milestoneId: 'milestone_002', 
          uploadedByUserId: 'user_002',
          filename: 'kitchen_layout_final.jpg',
          originalName: 'kitchen_layout.jpg',
          url: '/uploads/kitchen_layout_final.jpg',
          contentType: 'image/jpeg',
          size: 2621440,
          visibility: 'Client'
        },
        
        // Ticket attachment
        {
          id: 'file_004',
          projectId: 'proj_001',
          ticketId: null, // Will be set after tickets are created
          uploadedByUserId: 'user_001',
          filename: 'light_flicker_issue.jpg',
          originalName: 'light_flicker.jpg', 
          url: '/uploads/light_flicker_issue.jpg',
          contentType: 'image/jpeg',
          size: 1572864,
          visibility: 'Internal'
        },
        
        // Variation attachments
        {
          id: 'file_005',
          projectId: 'proj_001',
          uploadedByUserId: 'user_002',
          filename: 'wood_finish_samples_2024.jpg',
          originalName: 'wood_finish_samples.jpg',
          url: '/uploads/wood_finish_samples_2024.jpg',
          contentType: 'image/jpeg',
          size: 4194304,
          visibility: 'Client'
        },
        {
          id: 'file_006', 
          projectId: 'proj_001',
          uploadedByUserId: 'user_002',
          filename: 'cabinet_reference_guide.pdf',
          originalName: 'cabinet_reference.pdf',
          url: '/uploads/cabinet_reference_guide.pdf',
          contentType: 'application/pdf',
          size: 5242880,
          visibility: 'Client'
        },
        {
          id: 'file_007',
          projectId: 'proj_001',
          uploadedByUserId: 'user_002',
          filename: 'smart_lighting_specifications.pdf',
          originalName: 'smart_lighting_specs.pdf',
          url: '/uploads/smart_lighting_specifications.pdf',
          contentType: 'application/pdf',
          size: 3670016,
          visibility: 'Client'
        }
      ]);
    
    console.log('🧾 Seeding invoices...');
    await db
      .insert(invoices)
      .values([
        // Luxury Villa Renovation invoices
        {
          id: 'inv_001',
          projectId: 'proj_001',
          number: 'INV-2025-0001',
          issueDate: new Date('2024-11-20'),
          dueDate: new Date('2024-12-20'),
          currency: 'USD',
          lineItems: [
            { description: 'Initial Design Phase', quantity: 1, rate: 15000, taxPercent: 10, amount: 15000 },
            { description: 'Material Procurement', quantity: 1, rate: 25000, taxPercent: 10, amount: 25000 }
          ],
          subtotal: '40000.00',
          taxTotal: '4000.00',
          total: '44000.00',
          status: 'Paid',
          sentAt: new Date('2024-11-20'),
          paidAt: new Date('2024-12-01')
        },
        {
          id: 'inv_002',
          projectId: 'proj_001', 
          number: 'INV-2025-0002',
          issueDate: new Date('2024-12-15'),
          dueDate: new Date('2025-01-15'),
          currency: 'USD',
          lineItems: [
            { description: 'Construction Phase 1', quantity: 1, rate: 35000, taxPercent: 10, amount: 35000 },
            { description: 'Premium Fixtures', quantity: 1, rate: 18000, taxPercent: 10, amount: 18000 },
            { description: 'Project Management', quantity: 1, rate: 7000, taxPercent: 10, amount: 7000 }
          ],
          subtotal: '60000.00',
          taxTotal: '6000.00',
          total: '66000.00', 
          status: 'Sent',
          sentAt: new Date('2024-12-15')
        },
        
        // Modern Downtown Loft invoice
        {
          id: 'inv_003',
          projectId: 'proj_002',
          number: 'INV-2025-0003',
          issueDate: new Date('2024-12-01'),
          dueDate: new Date('2025-01-01'),
          currency: 'USD',
          lineItems: [
            { description: 'Design Consultation', quantity: 1, rate: 8000, taxPercent: 10, amount: 8000 },
            { description: 'Space Planning', quantity: 1, rate: 12000, taxPercent: 10, amount: 12000 }
          ],
          subtotal: '20000.00',
          taxTotal: '2000.00',
          total: '22000.00',
          status: 'Sent',
          sentAt: new Date('2024-12-01')
        }
      ]);
    
    console.log('✅ Seeding approval packets...');
    const seedApprovals = await db
      .insert(approvalPackets)
      .values([
        {
          id: 'approval_001',
          projectId: 'proj_001',
          number: 'AP-2025-0001',
          title: 'Living Room Design Approval',
          description: 'Please review and approve the living room design concepts including furniture layout, color scheme, and material selections.',
          dueDate: new Date('2025-01-15'),
          status: 'Sent',
          sentAt: new Date('2024-12-20')
        },
        {
          id: 'approval_002', 
          projectId: 'proj_002',
          number: 'AP-2025-0002',
          title: 'Loft Layout Final Review',
          description: 'Final approval required for open-plan loft layout with industrial elements.',
          dueDate: new Date('2025-01-10'),
          status: 'Sent',
          sentAt: new Date('2024-12-18')
        }
      ])
      .returning();
    
    console.log('📋 Seeding approval items...');
    await db
      .insert(approvalItems)
      .values([
        // Living Room Design Approval items
        {
          id: 'item_001',
          packetId: 'approval_001',
          fileAssetId: 'file_002', // living_room_concept.jpg
          decision: 'Pending'
        },
        
        // Loft Layout approval items  
        {
          id: 'item_002',
          packetId: 'approval_002',
          fileAssetId: 'file_005', // wood_finish_samples.jpg
          decision: 'Pending'
        },
        {
          id: 'item_003',
          packetId: 'approval_002', 
          fileAssetId: 'file_006', // cabinet_reference.pdf
          decision: 'Pending'
        }
      ]);
    
    console.log('🔄 Seeding variation requests...');
    await db
      .insert(variationRequests)
      .values([
        // Luxury Villa variations
        {
          id: 'var_001',
          projectId: 'proj_001',
          number: 'VR-2025-0001',
          date: new Date('2024-12-10'),
          changeRequestor: 'Khan Family',
          changeReference: 'Living Room Enhancement',
          changeArea: 'Living Room',
          workTypes: JSON.stringify(['Joinery']),
          categories: JSON.stringify(['Scope', 'Quality']),
          changeDescription: 'Upgrade living room built-in entertainment unit with premium walnut finish and integrated LED lighting system.',
          reasonDescription: 'Client requested higher-end materials after seeing initial installation. Current oak finish does not match their vision for luxury aesthetic.',
          technicalChanges: 'Replace oak veneer with book-matched walnut. Add LED strip lighting with dimmer controls. Upgrade hardware to brass finish.',
          resourcesAndCosts: 'Additional materials cost: $8,500. Labor for replacement: $3,200. Timeline impact: +2 weeks.',
          status: 'Under Review',
          attachments: JSON.stringify(['file_005', 'file_006'])
        },
        {
          id: 'var_002',
          projectId: 'proj_001',
          number: 'VR-2025-0002', 
          date: new Date('2024-12-15'),
          changeRequestor: 'Michael Rodriguez',
          changeReference: 'Bathroom Lighting Upgrade',
          changeArea: 'Master Bathroom',
          workTypes: JSON.stringify(['Electrical']),
          categories: JSON.stringify(['Cost', 'Scope']),
          changeDescription: 'Install smart lighting system in master bathroom with motion sensors and color temperature adjustment.',
          reasonDescription: 'Enhance user experience with automated lighting that adjusts based on time of day and occupancy.',
          technicalChanges: 'Install Lutron Caseta smart switches, occupancy sensors, and tunable white LED fixtures.',
          resourcesAndCosts: 'Smart lighting system: $2,800. Installation labor: $1,200. Timeline impact: +1 week.',
          status: 'Pending',
          attachments: JSON.stringify(['file_007'])
        },
        
        // Downtown Loft variation (approved)
        {
          id: 'var_003',
          projectId: 'proj_002',
          number: 'VR-2025-0003',
          date: new Date('2024-11-25'),
          changeRequestor: 'Silverstone Properties',
          changeReference: 'Industrial Lighting Upgrade',
          changeArea: 'Main Living Area',
          workTypes: JSON.stringify(['Electrical', 'Lighting']),
          categories: JSON.stringify(['Design', 'Quality']),
          changeDescription: 'Upgrade to premium industrial pendant lighting fixtures and add track lighting for accent illumination.',
          reasonDescription: 'Current lighting specification lacks the industrial character desired for the loft aesthetic.',
          technicalChanges: 'Install pendant fixtures with Edison bulbs and black iron finish. Add track lighting system with adjustable spots.',
          resourcesAndCosts: 'Premium fixtures: $4,200. Installation: $800. Timeline: No impact.',
          disposition: 'Approve',
          dispositionReason: 'Approved - aligns with design vision and budget allows for upgrade.',
          status: 'Approved'
        }
      ]);
    
    console.log('🎫 Seeding tickets...');
    const seedTickets = await db
      .insert(tickets)
      .values([
        // Luxury Villa tickets
        {
          id: 'ticket_001',
          projectId: 'proj_001',
          number: 'TK-2025-0001',
          subject: 'Lighting Flickering Issue',
          description: 'Intermittent flickering observed in living room pendant lights. Issue occurs primarily in the evening hours. Client reports it started after electrical work last week.',
          category: 'Technical',
          priority: 'High',
          status: 'Open',
          requesterUserId: 'user_001',
          assigneeUserId: 'user_003',
          attachments: JSON.stringify(['file_004'])
        },
        {
          id: 'ticket_002',
          projectId: 'proj_001', 
          number: 'TK-2025-0002',
          subject: 'Site Access Hours',
          description: 'Need to coordinate with building management for extended access hours during kitchen installation phase. Current access limited to 8am-6pm.',
          category: 'Communication',
          priority: 'Medium',
          status: 'Resolved',
          requesterUserId: 'user_002',
          assigneeUserId: 'user_001'
        }
      ])
      .returning();
    
    // Update file asset with ticket ID for attachment
    await db
      .update(fileAssets)
      .set({ ticketId: 'ticket_001' })
      .where({ id: 'file_004' });
    
    console.log('🎨 Seeding branding settings...');
    await db
      .insert(brandingSettings)
      .values({
        appName: 'FireLynx',
        logoUrl: null,
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
    
    console.log('📊 Generating seed summary...');
    const summary = {
      clients: seedClients.length,
      users: seedUsers.length,
      projects: seedProjects.length,
      
      // Get counts per project
      luxuryVilla: {
        milestones: await db.select().from(milestones).where({ projectId: 'proj_001' }).then(r => r.length),
        files: await db.select().from(fileAssets).where({ projectId: 'proj_001' }).then(r => r.length),
        invoices: await db.select().from(invoices).where({ projectId: 'proj_001' }).then(r => r.length),
        variations: await db.select().from(variationRequests).where({ projectId: 'proj_001' }).then(r => r.length),
        approvals: await db.select().from(approvalPackets).where({ projectId: 'proj_001' }).then(r => r.length),
        tickets: await db.select().from(tickets).where({ projectId: 'proj_001' }).then(r => r.length),
        team: await db.select().from(projectTeam).where({ projectId: 'proj_001' }).then(r => r.length)
      },
      
      downtownLoft: {
        milestones: await db.select().from(milestones).where({ projectId: 'proj_002' }).then(r => r.length),
        files: await db.select().from(fileAssets).where({ projectId: 'proj_002' }).then(r => r.length),
        invoices: await db.select().from(invoices).where({ projectId: 'proj_002' }).then(r => r.length),
        variations: await db.select().from(variationRequests).where({ projectId: 'proj_002' }).then(r => r.length),
        approvals: await db.select().from(approvalPackets).where({ projectId: 'proj_002' }).then(r => r.length),
        tickets: await db.select().from(tickets).where({ projectId: 'proj_002' }).then(r => r.length),
        team: await db.select().from(projectTeam).where({ projectId: 'proj_002' }).then(r => r.length)
      },
      
      corporateOffice: {
        milestones: await db.select().from(milestones).where({ projectId: 'proj_003' }).then(r => r.length),
        files: await db.select().from(fileAssets).where({ projectId: 'proj_003' }).then(r => r.length),
        invoices: await db.select().from(invoices).where({ projectId: 'proj_003' }).then(r => r.length),
        variations: await db.select().from(variationRequests).where({ projectId: 'proj_003' }).then(r => r.length),
        approvals: await db.select().from(approvalPackets).where({ projectId: 'proj_003' }).then(r => r.length),
        tickets: await db.select().from(tickets).where({ projectId: 'proj_003' }).then(r => r.length),
        team: await db.select().from(projectTeam).where({ projectId: 'proj_003' }).then(r => r.length)
      }
    };
    
    // Print detailed summary
    console.log('\n=== FireLynx Seed Data Summary ===');
    
    console.log(`\nLuxury Villa Renovation (In Progress, 65%)`);
    console.log(`  Team: ${summary.luxuryVilla.team}, Milestones: ${summary.luxuryVilla.milestones}, Files: ${summary.luxuryVilla.files}`);
    console.log(`  Variations: ${summary.luxuryVilla.variations}, Approvals: ${summary.luxuryVilla.approvals}, Invoices: ${summary.luxuryVilla.invoices}, Tickets: ${summary.luxuryVilla.tickets}`);
    
    console.log(`\nModern Downtown Loft (In Progress, 68%)`);
    console.log(`  Team: ${summary.downtownLoft.team}, Milestones: ${summary.downtownLoft.milestones}, Files: ${summary.downtownLoft.files}`);
    console.log(`  Variations: ${summary.downtownLoft.variations}, Approvals: ${summary.downtownLoft.approvals}, Invoices: ${summary.downtownLoft.invoices}, Tickets: ${summary.downtownLoft.tickets}`);
    
    console.log(`\nCorporate Office Design (On Hold, 45%)`);
    console.log(`  Team: ${summary.corporateOffice.team}, Milestones: ${summary.corporateOffice.milestones}, Files: ${summary.corporateOffice.files}`);
    console.log(`  Variations: ${summary.corporateOffice.variations}, Approvals: ${summary.corporateOffice.approvals}, Invoices: ${summary.corporateOffice.invoices}, Tickets: ${summary.corporateOffice.tickets}`);
    
    console.log('\n=== End Summary ===');
    
    console.log('✅ Seed data completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

module.exports = {
  seedDemoData
};