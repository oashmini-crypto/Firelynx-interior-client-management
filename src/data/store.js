// FireLynx Data Store - Project-centric client hub
// Everything is project-centric. All entities store projectId.
// Auto-numbering resets yearly: VR/AP/INV/TK → PREFIX-YYYY-#### (zero-padded)

const currentYear = new Date().getFullYear();

// Auto-numbering counters
const documentCounters = {
  variations: 1,
  approvals: 1,
  invoices: 1,
  tickets: 1
};

// Generate auto-numbers with yearly reset
export const generateNumber = (type) => {
  const counter = documentCounters[type] || 1;
  const paddedNumber = counter.toString().padStart(4, '0');
  documentCounters[type] = counter + 1;
  
  const prefixes = {
    variations: 'VR',
    approvals: 'AP',
    invoices: 'INV',
    tickets: 'TK'
  };
  
  return `${prefixes[type]}-${currentYear}-${paddedNumber}`;
};

// Core Entities (matching specification exactly)
export const entities = {
  // Base client data
  clients: [
    {
      id: 'client_001',
      name: 'Khan Family',
      email: 'contact@khanfamily.com',
      phone: '+1 (555) 123-4567',
      company: null,
      address: '123 Luxury Lane, Beverly Hills, CA 90210',
      createdAt: '2024-08-01'
    },
    {
      id: 'client_002',
      name: 'Silverstone Properties',
      email: 'projects@silverstone.com',
      phone: '+1 (555) 987-6543',
      company: 'Silverstone Properties LLC',
      address: '456 Downtown Ave, Los Angeles, CA 90015',
      createdAt: '2024-07-15'
    },
    {
      id: 'client_003',
      name: 'TechFlow Inc.',
      email: 'facilities@techflow.com',
      phone: '+1 (555) 456-7890',
      company: 'TechFlow Inc.',
      address: '789 Innovation Blvd, San Francisco, CA 94105',
      createdAt: '2024-06-20'
    }
  ],

  // Users for team assignments
  users: [
    {
      id: 'user_001',
      name: 'Michael Rodriguez',
      email: 'michael@firelynx.com',
      role: 'Manager',
      phone: '+1 (555) 001-0001',
      specialization: 'Project Management',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isOnline: true
    },
    {
      id: 'user_002',
      name: 'Emily Chen',
      email: 'emily@firelynx.com',
      role: 'Designer',
      phone: '+1 (555) 002-0002',
      specialization: 'Interior Design',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      isOnline: false
    },
    {
      id: 'user_003',
      name: 'David Park',
      email: 'david@firelynx.com',
      role: 'Designer',
      phone: '+1 (555) 003-0003',
      specialization: '3D Visualization',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isOnline: true
    }
  ],

  // Project { id, clientId, title, description, status, progress, budget, startDate, targetDate }
  projects: [
    {
      id: '30b37a9e-55c8-4b31-aa7a-b8d4ed27a4ee',
      clientId: 'client_001',
      title: 'Luxury Villa Renovation',
      description: 'Complete renovation of a luxury villa with modern interior design and smart home integration.',
      status: 'In Progress',
      progress: 65,
      budget: 280000,
      spent: 182000,
      startDate: '2024-01-15',
      targetDate: '2025-08-30',
      createdAt: '2024-01-15',
      clientName: 'Henderson Family Trust',
      clientEmail: 'contact@hendersonfamily.com',
      clientCompany: 'Henderson Family Trust'
    },
    {
      id: '2e6f3841-75db-4816-b0f4-7d1a6d52c460',
      clientId: 'client_002',
      title: 'Modern Downtown Loft',
      description: 'Contemporary loft design with open concept living and industrial elements.',
      status: 'In Progress',
      progress: 68,
      budget: 150000,
      spent: 102000,
      startDate: '2024-03-01',
      targetDate: '2025-05-15',
      createdAt: '2024-03-01',
      clientName: 'Sarah Mitchell',
      clientEmail: 'sarah.mitchell@email.com',
      clientCompany: 'Mitchell Properties'
    },
    {
      id: 'fa7aa589-4f65-4984-a41d-754539279861',
      clientId: 'client_003',
      title: 'Corporate Office Design',
      description: 'Modern office space design for technology company with collaborative areas.',
      status: 'On Hold',
      progress: 45,
      budget: 320000,
      spent: 144000,
      startDate: '2024-02-10',
      targetDate: '2025-09-20',
      createdAt: '2024-02-10',
      clientName: 'TechFlow Solutions',
      clientEmail: 'projects@techflow.com',
      clientCompany: 'TechFlow Solutions Inc.'
    }
  ],

  // ProjectTeam { id, projectId, userId, role [Manager|Designer|Contractor|Other] }
  projectTeam: [
    { id: 'team_001', projectId: '30b37a9e-55c8-4b31-aa7a-b8d4ed27a4ee', userId: 'user_001', role: 'Manager' },
    { id: 'team_002', projectId: '30b37a9e-55c8-4b31-aa7a-b8d4ed27a4ee', userId: 'user_002', role: 'Designer' },
    { id: 'team_003', projectId: '2e6f3841-75db-4816-b0f4-7d1a6d52c460', userId: 'user_002', role: 'Manager' },
    { id: 'team_004', projectId: '2e6f3841-75db-4816-b0f4-7d1a6d52c460', userId: 'user_003', role: 'Designer' },
    { id: 'team_005', projectId: 'fa7aa589-4f65-4984-a41d-754539279861', userId: 'user_001', role: 'Manager' }
  ],

  // Milestone { id, projectId, title, description, expectedDate, progress, status }
  milestones: [
    {
      id: 'milestone_001',
      projectId: '30b37a9e-55c8-4b31-aa7a-b8d4ed27a4ee',
      title: 'Initial Consultation',
      description: 'Project kickoff, requirements gathering, and initial design concepts',
      expectedDate: '2024-11-15',
      progress: 100,
      status: 'Completed'
    },
    {
      id: 'milestone_002',
      projectId: '30b37a9e-55c8-4b31-aa7a-b8d4ed27a4ee',
      title: 'Design Development',
      description: 'Detailed floor plans, 3D renderings, and material selections',
      expectedDate: '2024-12-15',
      progress: 85,
      status: 'In Progress'
    },
    {
      id: 'milestone_003',
      projectId: '2e6f3841-75db-4816-b0f4-7d1a6d52c460',
      title: 'Space Planning',
      description: 'Layout optimization and furniture placement for loft',
      expectedDate: '2024-11-30',
      progress: 90,
      status: 'In Progress'
    },
    {
      id: 'milestone_004',
      projectId: 'fa7aa589-4f65-4984-a41d-754539279861',
      title: 'Office Layout Planning',
      description: 'Initial space assessment and collaborative area design',
      expectedDate: '2024-12-20',
      progress: 75,
      status: 'In Progress'
    }
  ],

  // FileAsset { id, projectId, milestoneId?, uploadedByUserId, filename, url, contentType, size, visibility [Client|Internal] }
  fileAssets: [
    {
      id: 'file_001',
      projectId: '30b37a9e-55c8-4b31-aa7a-b8d4ed27a4ee',
      milestoneId: 'milestone_001',
      uploadedByUserId: 'user_001',
      filename: 'consultation_notes.pdf',
      url: '/files/consultation_notes.pdf',
      contentType: 'application/pdf',
      size: 2048576, // 2MB
      visibility: 'Client',
      createdAt: '2024-11-15'
    },
    {
      id: 'file_002',
      projectId: '30b37a9e-55c8-4b31-aa7a-b8d4ed27a4ee',
      milestoneId: null,
      uploadedByUserId: 'user_002',
      filename: 'living_room_concept.jpg',
      url: '/files/living_room_concept.jpg',
      contentType: 'image/jpeg',
      size: 3145728, // 3MB
      visibility: 'Client',
      createdAt: '2024-12-01'
    },
    {
      id: 'file_003',
      projectId: '30b37a9e-55c8-4b31-aa7a-b8d4ed27a4ee',
      milestoneId: null,
      uploadedByUserId: 'user_002',
      filename: 'kitchen_layout.jpg',
      url: '/files/kitchen_layout.jpg',
      contentType: 'image/jpeg',
      size: 2621440, // 2.5MB
      visibility: 'Client',
      createdAt: '2024-12-01'
    },
    {
      id: 'file_004',
      projectId: '2e6f3841-75db-4816-b0f4-7d1a6d52c460',
      milestoneId: 'milestone_003',
      uploadedByUserId: 'user_003',
      filename: 'loft_floor_plan.jpg',
      url: '/files/loft_floor_plan.jpg',
      contentType: 'image/jpeg',
      size: 1536000, // 1.5MB
      visibility: 'Client',
      createdAt: '2024-11-20'
    },
    {
      id: 'file_005',
      projectId: 'fa7aa589-4f65-4984-a41d-754539279861',
      milestoneId: 'milestone_004',
      uploadedByUserId: 'user_001',
      filename: 'office_workspace.jpg',
      url: '/files/office_workspace.jpg',
      contentType: 'image/jpeg',
      size: 1800000, // 1.8MB
      visibility: 'Client',
      createdAt: '2024-12-10'
    }
  ],

  // VariationRequest { id, projectId, number VR-YYYY-####, projectName, date, changeRequestor, changeReference, changeArea, workTypes, categories, changeDescription, reasonDescription, technicalChanges, resourcesAndCosts, disposition, dispositionReason?, status, createdByUserId, createdAt, updatedAt }
  variationRequests: [
    {
      id: 'dd046ac7-2eec-4b59-8072-57f859defedb',
      projectId: '30b37a9e-55c8-4b31-aa7a-b8d4ed27a4ee',
      number: 'VR-2025-0001',
      date: '2024-03-15',
      changeRequestor: 'Henderson Family Trust',
      changeReference: 'Living Room Enhancement Request',
      changeArea: 'Living Room',
      workTypes: ['Joinery'],
      categories: ['Scope', 'Quality'],
      changeDescription: 'Add custom built-in entertainment center with integrated lighting',
      reasonDescription: 'Client wants enhanced entertainment experience with premium finishes',
      technicalChanges: 'Custom millwork installation, electrical updates for lighting',
      resourcesAndCosts: 'Additional $15,000 for materials and labor',
      disposition: null,
      dispositionReason: null,
      status: 'Under Review',
      currency: 'AED',
      priority: 'medium',
      priceImpact: '0.00',
      timeImpact: 0,
      createdAt: '2025-09-08',
      updatedAt: '2025-09-08'
    },
    {
      id: '2c4f8e23-56c0-4798-9954-305366005981',
      projectId: '30b37a9e-55c8-4b31-aa7a-b8d4ed27a4ee',
      number: 'VR-2025-0002',
      date: '2024-04-01',
      changeRequestor: 'Henderson Family Trust',
      changeReference: 'Bathroom Lighting Upgrade',
      changeArea: 'Master Bathroom',
      workTypes: ['Electrical', 'Lighting'],
      categories: ['Cost', 'Scope'],
      changeDescription: 'Upgrade to smart lighting system with motion sensors',
      reasonDescription: 'Enhance functionality and energy efficiency',
      technicalChanges: 'Install smart switches, motion sensors, app integration',
      resourcesAndCosts: 'Additional $3,500 for smart lighting components',
      disposition: null,
      dispositionReason: null,
      status: 'Pending',
      currency: 'AED',
      priority: 'medium',
      priceImpact: '0.00',
      timeImpact: 0,
      createdAt: '2025-09-08',
      updatedAt: '2025-09-08'
    },
    {
      id: '5ebf2dc8-0a7c-4336-9740-2ad1ebc2c553',
      projectId: '2e6f3841-75db-4816-b0f4-7d1a6d52c460',
      number: 'VR-2025-0003',
      date: '2024-03-20',
      changeRequestor: 'Sarah Mitchell',
      changeReference: 'Exposed Brick Wall Feature',
      changeArea: 'Main Living Area',
      workTypes: ['Structural', 'Demolition'],
      categories: ['Design', 'Cost'],
      changeDescription: 'Expose existing brick wall and apply protective sealant',
      reasonDescription: 'Enhance industrial aesthetic as requested by client',
      technicalChanges: 'Careful demolition, brick restoration, sealing',
      resourcesAndCosts: 'Additional $4,200 for demolition and restoration work',
      disposition: 'Approved',
      dispositionReason: 'Enhances design vision and within budget parameters',
      status: 'Approved',
      currency: 'AED',
      priority: 'medium',
      priceImpact: '0.00',
      timeImpact: 0,
      createdAt: '2025-09-08',
      updatedAt: '2025-09-08'
    }
  ],

  // VariationAttachment { id, variationRequestId, fileAssetId }
  variationAttachments: [],

  // ApprovalPacket { id, projectId, number AP-YYYY-####, title, description, dueDate, status ∈ {Draft, Sent, Approved, Declined, Expired}, sentAt?, decidedAt? }
  approvalPackets: [
    {
      id: 'approval_001',
      projectId: '30b37a9e-55c8-4b31-aa7a-b8d4ed27a4ee',
      number: 'AP-2025-0001',
      title: 'Living Room Design Approval',
      description: 'Final design layouts and color schemes for living room renovation',
      dueDate: '2024-12-15',
      status: 'Sent',
      sentAt: '2024-12-01',
      decidedAt: null
    },
    {
      id: 'approval_002',
      projectId: '2e6f3841-75db-4816-b0f4-7d1a6d52c460',
      number: 'AP-2025-0002',
      title: 'Loft Kitchen Design',
      description: 'Kitchen cabinet design and appliance selection',
      dueDate: '2024-12-20',
      status: 'Sent',
      sentAt: '2024-12-03',
      decidedAt: null
    },
    {
      id: 'approval_003',
      projectId: 'fa7aa589-4f65-4984-a41d-754539279861',
      number: 'AP-2025-0003',
      title: 'Office Space Layout',
      description: 'Collaborative workspace design and meeting room layouts',
      dueDate: '2024-12-25',
      status: 'Draft',
      sentAt: null,
      decidedAt: null
    }
  ],

  // ApprovalItem { id, packetId, fileAssetId, decision ∈ {Pending, Approved, Declined}, comment?, signatureName?, decidedAt?, decidedByClientId? }
  approvalItems: [
    {
      id: 'item_001',
      packetId: 'approval_001',
      fileAssetId: 'file_002',
      decision: 'Pending',
      comment: null,
      signatureName: null,
      decidedAt: null,
      decidedByClientId: null
    },
    {
      id: 'item_002',
      packetId: 'approval_001',
      fileAssetId: 'file_003',
      decision: 'Pending',
      comment: null,
      signatureName: null,
      decidedAt: null,
      decidedByClientId: null
    }
  ],

  // Invoice { id, projectId, number INV-YYYY-####, issueDate, dueDate, currency, lineItems JSON, subtotal, taxTotal, total, status ∈ {Draft, Sent, Paid, Overdue, Cancelled}, sentAt?, paidAt? }
  invoices: [
    {
      id: 'a49e9229-e5c0-4dd4-80ba-a643e77ad5e1',
      projectId: '30b37a9e-55c8-4b31-aa7a-b8d4ed27a4ee',
      number: 'INV-2025-0001',
      issueDate: '2024-02-01',
      dueDate: '2024-02-15',
      currency: 'USD',
      lineItems: [
        { description: 'Initial Design Consultation', quantity: 1, rate: 2500, taxPercent: 8.25, amount: 2500 },
        { description: 'Site Assessment & Measurements', quantity: 8, rate: 150, taxPercent: 8.25, amount: 1200 }
      ],
      subtotal: '3700.00',
      taxTotal: '305.25',
      total: '4005.25',
      status: 'Paid',
      sentAt: '2024-02-01',
      paidAt: '2024-02-10',
      notes: 'Initial phase payment - thank you!',
      createdAt: '2025-09-08',
      updatedAt: '2025-09-08'
    },
    {
      id: 'dc457951-4656-4a00-827e-8d251b8c1eb2',
      projectId: '2e6f3841-75db-4816-b0f4-7d1a6d52c460',
      number: 'INV-2025-0002',
      issueDate: '2024-04-01',
      dueDate: '2024-04-15',
      currency: 'USD',
      lineItems: [
        { description: 'Space Planning & Design', quantity: 1, rate: 4500, taxPercent: 8.25, amount: 4500 }
      ],
      subtotal: '4500.00',
      taxTotal: '371.25',
      total: '4871.25',
      status: 'Sent',
      sentAt: '2024-04-01',
      paidAt: null,
      notes: 'Phase 1 design work completed',
      createdAt: '2025-09-08',
      updatedAt: '2025-09-08'
    }
  ],

  // Payment { id, invoiceId, amount, date, method, reference? }
  payments: [
    {
      id: 'pay_001',
      invoiceId: 'inv_001',
      amount: 43600,
      date: '2024-12-01',
      method: 'Bank Transfer',
      reference: 'TXN-20241201-001'
    }
  ],

  // Ticket { id, projectId, number TK-YYYY-####, subject, description, category ∈ {General, Design, Site, Billing, Other}, priority ∈ {Low, Medium, High, Urgent}, status ∈ {Open, In Progress, Awaiting Client, Resolved, Closed}, requesterUserId, assigneeUserId?, createdAt, updatedAt }
  tickets: [
    {
      id: 'ticket_001',
      projectId: '30b37a9e-55c8-4b31-aa7a-b8d4ed27a4ee',
      number: 'TK-2025-0001',
      subject: 'Lighting issue',
      description: 'The new LED fixtures are flickering intermittently in the dining room',
      category: 'Site',
      priority: 'Medium',
      status: 'Open',
      requesterUserId: 'client_001',
      assigneeUserId: 'user_002',
      createdAt: '2024-12-03',
      updatedAt: '2024-12-03'
    },
    {
      id: 'ticket_002',
      projectId: '30b37a9e-55c8-4b31-aa7a-b8d4ed27a4ee',
      number: 'TK-2025-0002',
      subject: 'Access hours',
      description: 'Need to coordinate access for weekend work due to neighbor concerns',
      category: 'General',
      priority: 'Low',
      status: 'Resolved',
      requesterUserId: 'client_001',
      assigneeUserId: 'user_001',
      createdAt: '2024-11-28',
      updatedAt: '2024-12-01'
    },
    {
      id: 'ticket_003',
      projectId: '2e6f3841-75db-4816-b0f4-7d1a6d52c460',
      number: 'TK-2025-0003',
      subject: 'Material delivery delay',
      description: 'Kitchen countertops delayed by 2 weeks from supplier',
      category: 'General',
      priority: 'High',
      status: 'In Progress',
      requesterUserId: 'client_002',
      assigneeUserId: 'user_002',
      createdAt: '2024-12-01',
      updatedAt: '2024-12-02'
    }
  ],

  // TicketComment { id, ticketId, authorUserId, body, attachments[], createdAt }
  ticketComments: [
    {
      id: 'comment_001',
      ticketId: 'ticket_001',
      authorUserId: 'user_002',
      body: 'I\'ll check the electrical connections and dimmer compatibility. This might be a voltage issue.',
      attachments: [],
      createdAt: '2024-12-03'
    },
    {
      id: 'comment_002',
      ticketId: 'ticket_002',
      authorUserId: 'user_001',
      body: 'Coordinated with neighbors. Weekend work approved between 10am-4pm only.',
      attachments: [],
      createdAt: '2024-12-01'
    }
  ]
};

// Helper functions to get related data
export const getClientById = (clientId) => {
  return entities.clients.find(client => client.id === clientId);
};

export const getProjectById = (projectId) => {
  return entities.projects.find(project => project.id === projectId);
};

export const getUserById = (userId) => {
  return entities.users.find(user => user.id === userId);
};

export const getProjectsByClientId = (clientId) => {
  return entities.projects.filter(project => project.clientId === clientId);
};

export const getMilestonesByProjectId = (projectId) => {
  return entities.milestones.filter(milestone => milestone.projectId === projectId);
};

export const getTeamByProjectId = (projectId) => {
  return entities.projectTeam.filter(member => member.projectId === projectId)
    .map(member => ({
      ...member,
      user: entities.users.find(user => user.id === member.userId)
    }));
};

export const getFilesByProjectId = (projectId) => {
  return entities.fileAssets.filter(file => file.projectId === projectId);
};

export const getFilesByMilestoneId = (milestoneId) => {
  return entities.fileAssets.filter(file => file.milestoneId === milestoneId);
};

export const getVariationsByProjectId = (projectId) => {
  return entities.variationRequests.filter(variation => variation.projectId === projectId);
};

export const getApprovalsByProjectId = (projectId) => {
  return entities.approvalPackets.filter(approval => approval.projectId === projectId)
    .map(packet => ({
      ...packet,
      items: entities.approvalItems.filter(item => item.packetId === packet.id)
        .map(item => ({
          ...item,
          file: entities.fileAssets.find(file => file.id === item.fileAssetId)
        }))
    }));
};

export const getInvoicesByProjectId = (projectId) => {
  return entities.invoices.filter(invoice => invoice.projectId === projectId);
};

export const getTicketsByProjectId = (projectId) => {
  return entities.tickets.filter(ticket => ticket.projectId === projectId)
    .map(ticket => ({
      ...ticket,
      comments: entities.ticketComments.filter(comment => comment.ticketId === ticket.id)
    }));
};

// Global aggregated views
export const getAllVariations = () => {
  return entities.variationRequests.map(variation => ({
    ...variation,
    project: entities.projects.find(p => p.id === variation.projectId)
  }));
};

export const getAllTickets = () => {
  return entities.tickets.map(ticket => ({
    ...ticket,
    project: entities.projects.find(p => p.id === ticket.projectId),
    comments: entities.ticketComments.filter(comment => comment.ticketId === ticket.id)
  }));
};

export const getAllApprovals = () => {
  return entities.approvalPackets.map(packet => ({
    ...packet,
    project: entities.projects.find(p => p.id === packet.projectId)
  }));
};

// Utility functions
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Print seed summary to console
console.log('=== FireLynx Seed Data Summary ===');
entities.projects.forEach(project => {
  const milestones = getMilestonesByProjectId(project.id).length;
  const team = getTeamByProjectId(project.id).length;
  const files = getFilesByProjectId(project.id).length;
  const variations = getVariationsByProjectId(project.id).length;
  const approvals = getApprovalsByProjectId(project.id).length;
  const invoices = getInvoicesByProjectId(project.id).length;
  const tickets = getTicketsByProjectId(project.id).length;
  
  console.log(`\n${project.title} (${project.status}, ${project.progress}%)`);
  console.log(`  Team: ${team}, Milestones: ${milestones}, Files: ${files}`);
  console.log(`  Variations: ${variations}, Approvals: ${approvals}, Invoices: ${invoices}, Tickets: ${tickets}`);
});
console.log('\n=== End Summary ===');