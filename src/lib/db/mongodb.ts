/**
 * MongoDB connection helper.
 *
 * • If MONGODB_URI is set → connects to that cluster (e.g. Atlas).
 * • Otherwise → spins up an in-memory MongoDB via mongodb-memory-server
 *   and auto-seeds it with demo data so the app works out of the box.
 */

import { MongoClient, Db, ObjectId } from "mongodb";
import { createHash } from "crypto";

const dbName = "rentshield";

/* ── Global cache to survive Next.js dev hot-reloads ──────────────── */
const g = globalThis as unknown as {
  _mongoClient?: MongoClient;
  _mongoDb?: Db;
  _mongoMemoryServer?: unknown;
  _mongoMemoryUri?: string;
};

/** Hash helper used by seed data */
function hashPw(pw: string) {
  return createHash("sha256").update(pw).digest("hex");
}

/** Helper: generate a date N days ago */
function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 86_400_000);
}

/** Helper: generate a date N days in the future */
function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * 86_400_000);
}

/**
 * Seed the in-memory database with rich demo data:
 *   • 1 admin, 3 landlords, 6 tenants
 *   • 6 properties across Northampton
 *   • 18 tasks in various statuses
 *   • 10 submissions (pending / approved / rejected)
 *   • 5 legal-advice cases
 *   • 3 analyzed notices
 */
async function seedDatabase(database: Db): Promise<void> {
  const existingUsers = await database.collection("users").countDocuments();
  if (existingUsers > 0) return;

  console.log("[mongodb] Seeding in-memory database with demo data…");

  /* ─────────────────── Users ─────────────────── */
  const adminId = new ObjectId();

  const landlord1Id = new ObjectId();
  const landlord2Id = new ObjectId();
  const landlord3Id = new ObjectId();

  const tenant1Id = new ObjectId();
  const tenant2Id = new ObjectId();
  const tenant3Id = new ObjectId();
  const tenant4Id = new ObjectId();
  const tenant5Id = new ObjectId();
  const tenant6Id = new ObjectId();

  const users = [
    // Admin
    { _id: adminId, name: "Sarah Admin", email: "admin@rentshield.uk", passwordHash: hashPw("admin123"), role: "admin" as const, landlordId: null, status: "active" as const, createdAt: daysAgo(90) },

    // Landlords
    { _id: landlord1Id, name: "James Harrison", email: "landlord@rentshield.uk", passwordHash: hashPw("landlord123"), role: "landlord" as const, landlordId: null, status: "active" as const, createdAt: daysAgo(85) },
    { _id: landlord2Id, name: "Margaret Chen", email: "margaret@rentshield.uk", passwordHash: hashPw("landlord123"), role: "landlord" as const, landlordId: null, status: "active" as const, createdAt: daysAgo(60) },
    { _id: landlord3Id, name: "David Okonkwo", email: "david@rentshield.uk", passwordHash: hashPw("landlord123"), role: "landlord" as const, landlordId: null, status: "active" as const, createdAt: daysAgo(30) },

    // Tenants of Landlord 1
    { _id: tenant1Id, name: "Louie Tenant", email: "tenant@rentshield.uk", passwordHash: hashPw("tenant123"), role: "tenant" as const, landlordId: landlord1Id, status: "active" as const, createdAt: daysAgo(80) },
    { _id: tenant2Id, name: "Emma Watson", email: "emma@rentshield.uk", passwordHash: hashPw("tenant123"), role: "tenant" as const, landlordId: landlord1Id, status: "active" as const, createdAt: daysAgo(75) },

    // Tenants of Landlord 2
    { _id: tenant3Id, name: "Amir Patel", email: "amir@rentshield.uk", passwordHash: hashPw("tenant123"), role: "tenant" as const, landlordId: landlord2Id, status: "active" as const, createdAt: daysAgo(55) },
    { _id: tenant4Id, name: "Sophie Clarke", email: "sophie@rentshield.uk", passwordHash: hashPw("tenant123"), role: "tenant" as const, landlordId: landlord2Id, status: "active" as const, createdAt: daysAgo(50) },

    // Tenants of Landlord 3
    { _id: tenant5Id, name: "Ryan Murphy", email: "ryan@rentshield.uk", passwordHash: hashPw("tenant123"), role: "tenant" as const, landlordId: landlord3Id, status: "active" as const, createdAt: daysAgo(28) },
    { _id: tenant6Id, name: "Fatima Al-Rashid", email: "fatima@rentshield.uk", passwordHash: hashPw("tenant123"), role: "tenant" as const, landlordId: landlord3Id, status: "active" as const, createdAt: daysAgo(25) },
  ];
  await database.collection("users").insertMany(users);
  console.log(`  → ${users.length} users`);

  /* ─────────────────── Properties ─────────────────── */
  const prop1Id = new ObjectId();
  const prop2Id = new ObjectId();
  const prop3Id = new ObjectId();
  const prop4Id = new ObjectId();
  const prop5Id = new ObjectId();
  const prop6Id = new ObjectId();

  const properties = [
    // Landlord 1 properties
    { _id: prop1Id, landlordId: landlord1Id, address: "14 Kettering Road, Northampton", postcode: "NN1 4AA", tenantIds: [tenant1Id], createdAt: daysAgo(80) },
    { _id: prop2Id, landlordId: landlord1Id, address: "28 Abington Street, Northampton", postcode: "NN1 2AJ", tenantIds: [tenant2Id], createdAt: daysAgo(75) },

    // Landlord 2 properties
    { _id: prop3Id, landlordId: landlord2Id, address: "5 St Giles Terrace, Northampton", postcode: "NN1 2BN", tenantIds: [tenant3Id], createdAt: daysAgo(55) },
    { _id: prop4Id, landlordId: landlord2Id, address: "42 Wellingborough Road, Northampton", postcode: "NN1 4EA", tenantIds: [tenant4Id], createdAt: daysAgo(50) },

    // Landlord 3 properties
    { _id: prop5Id, landlordId: landlord3Id, address: "11 Billing Road, Northampton", postcode: "NN1 5AW", tenantIds: [tenant5Id], createdAt: daysAgo(28) },
    { _id: prop6Id, landlordId: landlord3Id, address: "7 Derngate, Northampton", postcode: "NN1 1UB", tenantIds: [tenant6Id], createdAt: daysAgo(25) },
  ];
  await database.collection("properties").insertMany(properties);
  console.log(`  → ${properties.length} properties`);

  /* ─────────────────── Tasks ─────────────────── */

  // Landlord 1 → Tenant 1 tasks
  const task1Id = new ObjectId();
  const task2Id = new ObjectId();
  const task3Id = new ObjectId();
  const task4Id = new ObjectId();
  const task5Id = new ObjectId();

  // Landlord 1 → Tenant 2 tasks
  const task6Id = new ObjectId();
  const task7Id = new ObjectId();
  const task8Id = new ObjectId();

  // Landlord 2 → Tenant 3 tasks
  const task9Id = new ObjectId();
  const task10Id = new ObjectId();
  const task11Id = new ObjectId();

  // Landlord 2 → Tenant 4 tasks
  const task12Id = new ObjectId();
  const task13Id = new ObjectId();

  // Landlord 3 → Tenant 5 tasks
  const task14Id = new ObjectId();
  const task15Id = new ObjectId();
  const task16Id = new ObjectId();

  // Landlord 3 → Tenant 6 tasks
  const task17Id = new ObjectId();
  const task18Id = new ObjectId();

  const tasks = [
    // ── Landlord 1 (James Harrison) → Tenant 1 (Louie) ──
    { _id: task1Id, landlordId: landlord1Id, tenantId: tenant1Id, propertyId: prop1Id,
      title: "Submit gas & electric meter readings",
      description: "Take a clear photo of both the electricity and gas meters showing the current readings. Include the meter serial numbers.",
      rewardAmount: 10, deadline: daysFromNow(14), status: "open" as const, createdAt: daysAgo(2) },

    { _id: task2Id, landlordId: landlord1Id, tenantId: tenant1Id, propertyId: prop1Id,
      title: "Report any damp or mould issues",
      description: "Check every room for signs of damp, mould, or condensation. Report any findings with photos and the affected areas.",
      rewardAmount: 15, deadline: daysFromNow(21), status: "open" as const, createdAt: daysAgo(3) },

    { _id: task3Id, landlordId: landlord1Id, tenantId: tenant1Id, propertyId: prop1Id,
      title: "Confirm boiler annual service date",
      description: "Check the boiler for its last service sticker or certificate. Submit a photo of the service record.",
      rewardAmount: 5, deadline: daysFromNow(7), status: "submitted" as const, createdAt: daysAgo(10) },

    { _id: task4Id, landlordId: landlord1Id, tenantId: tenant1Id, propertyId: prop1Id,
      title: "Test all smoke and CO alarms",
      description: "Press the test button on every smoke alarm and carbon monoxide detector in the property. Confirm all are working.",
      rewardAmount: 8, deadline: daysAgo(5), status: "approved" as const, createdAt: daysAgo(20) },

    { _id: task5Id, landlordId: landlord1Id, tenantId: tenant1Id, propertyId: prop1Id,
      title: "Photograph any broken window locks",
      description: "Inspect all windows and report any broken or missing locks. Include photos and room locations.",
      rewardAmount: 10, deadline: daysAgo(3), status: "rejected" as const, createdAt: daysAgo(15) },

    // ── Landlord 1 (James Harrison) → Tenant 2 (Emma) ──
    { _id: task6Id, landlordId: landlord1Id, tenantId: tenant2Id, propertyId: prop2Id,
      title: "Check gutters and drains are clear",
      description: "Look at the external gutters and any drain covers. Report any blockages or overflows with photos.",
      rewardAmount: 12, deadline: daysFromNow(10), status: "open" as const, createdAt: daysAgo(1) },

    { _id: task7Id, landlordId: landlord1Id, tenantId: tenant2Id, propertyId: prop2Id,
      title: "Confirm fire escape route is clear",
      description: "Walk the fire escape route from your flat to the building exit. Confirm nothing is blocking the path.",
      rewardAmount: 5, deadline: daysFromNow(5), status: "submitted" as const, createdAt: daysAgo(8) },

    { _id: task8Id, landlordId: landlord1Id, tenantId: tenant2Id, propertyId: prop2Id,
      title: "Report kitchen appliance condition",
      description: "Check all provided kitchen appliances (oven, hob, fridge, washing machine). Report any faults.",
      rewardAmount: 10, deadline: daysAgo(2), status: "approved" as const, createdAt: daysAgo(18) },

    // ── Landlord 2 (Margaret Chen) → Tenant 3 (Amir) ──
    { _id: task9Id, landlordId: landlord2Id, tenantId: tenant3Id, propertyId: prop3Id,
      title: "Submit water meter reading",
      description: "Locate the water meter (usually near the front boundary) and submit a photo of the current reading.",
      rewardAmount: 8, deadline: daysFromNow(12), status: "open" as const, createdAt: daysAgo(4) },

    { _id: task10Id, landlordId: landlord2Id, tenantId: tenant3Id, propertyId: prop3Id,
      title: "Inspect bathroom sealant condition",
      description: "Check the sealant around the bath, shower, and sink. Report any peeling, cracking or mould growth.",
      rewardAmount: 10, deadline: daysFromNow(18), status: "open" as const, createdAt: daysAgo(2) },

    { _id: task11Id, landlordId: landlord2Id, tenantId: tenant3Id, propertyId: prop3Id,
      title: "Document garden/outdoor area condition",
      description: "Take photos of the garden/outdoor area from multiple angles. Note any overgrown areas, broken fencing, or rubbish.",
      rewardAmount: 12, deadline: daysAgo(1), status: "approved" as const, createdAt: daysAgo(14) },

    // ── Landlord 2 (Margaret Chen) → Tenant 4 (Sophie) ──
    { _id: task12Id, landlordId: landlord2Id, tenantId: tenant4Id, propertyId: prop4Id,
      title: "Check extractor fans are working",
      description: "Test the extractor fans in the kitchen and bathroom. Hold a tissue near each fan to confirm airflow.",
      rewardAmount: 5, deadline: daysFromNow(8), status: "submitted" as const, createdAt: daysAgo(6) },

    { _id: task13Id, landlordId: landlord2Id, tenantId: tenant4Id, propertyId: prop4Id,
      title: "Report any pest issues",
      description: "Check for signs of pests: droppings, damage to food packaging, nests, or unusual sounds. Report with evidence.",
      rewardAmount: 15, deadline: daysFromNow(20), status: "open" as const, createdAt: daysAgo(1) },

    // ── Landlord 3 (David Okonkwo) → Tenant 5 (Ryan) ──
    { _id: task14Id, landlordId: landlord3Id, tenantId: tenant5Id, propertyId: prop5Id,
      title: "Submit entry hallway photos for inventory",
      description: "Take detailed photos of the entry hallway including floors, walls, doors, and any fixtures. These will be added to the property inventory.",
      rewardAmount: 8, deadline: daysFromNow(15), status: "open" as const, createdAt: daysAgo(3) },

    { _id: task15Id, landlordId: landlord3Id, tenantId: tenant5Id, propertyId: prop5Id,
      title: "Test door locks and deadbolts",
      description: "Test all exterior door locks and deadbolts. Confirm they open and close smoothly and keys work correctly.",
      rewardAmount: 5, deadline: daysFromNow(6), status: "open" as const, createdAt: daysAgo(5) },

    { _id: task16Id, landlordId: landlord3Id, tenantId: tenant5Id, propertyId: prop5Id,
      title: "Report radiator condition in each room",
      description: "Check each radiator in the property. Report if any are not heating evenly, leaking, or have broken valves.",
      rewardAmount: 12, deadline: daysAgo(4), status: "submitted" as const, createdAt: daysAgo(12) },

    // ── Landlord 3 (David Okonkwo) → Tenant 6 (Fatima) ──
    { _id: task17Id, landlordId: landlord3Id, tenantId: tenant6Id, propertyId: prop6Id,
      title: "Photograph current condition of carpets",
      description: "Take photos of every carpeted area in the property, noting any stains, wear, or damage for the inventory record.",
      rewardAmount: 8, deadline: daysFromNow(10), status: "open" as const, createdAt: daysAgo(2) },

    { _id: task18Id, landlordId: landlord3Id, tenantId: tenant6Id, propertyId: prop6Id,
      title: "Check and report on electrical sockets",
      description: "Test every electrical socket in the property. Report any that are cracked, loose, or not providing power.",
      rewardAmount: 10, deadline: daysFromNow(16), status: "open" as const, createdAt: daysAgo(1) },
  ];
  await database.collection("tasks").insertMany(tasks);
  console.log(`  → ${tasks.length} tasks`);

  /* ─────────────────── Submissions ─────────────────── */
  const submissions = [
    // task3 (boiler service) — submitted, pending review
    { _id: new ObjectId(), taskId: task3Id, tenantId: tenant1Id,
      comment: "Found the service sticker on the boiler — last serviced 14 Nov 2025 by British Gas. Photo attached.",
      status: "pending" as const, createdAt: daysAgo(5) },

    // task4 (smoke alarms) — approved
    { _id: new ObjectId(), taskId: task4Id, tenantId: tenant1Id,
      comment: "All 3 smoke alarms and 1 CO alarm tested — all working fine. Batteries good.",
      status: "approved" as const, reviewedBy: landlord1Id, reviewedAt: daysAgo(6), createdAt: daysAgo(8) },

    // task5 (window locks) — rejected
    { _id: new ObjectId(), taskId: task5Id, tenantId: tenant1Id,
      comment: "Windows all look fine to me.",
      status: "rejected" as const, reviewedBy: landlord1Id, reviewedAt: daysAgo(4), createdAt: daysAgo(7) },

    // task7 (fire escape) — submitted, pending review
    { _id: new ObjectId(), taskId: task7Id, tenantId: tenant2Id,
      comment: "Fire escape route is clear. Walked the entire path from flat 2B to the building exit. All fire doors close properly.",
      status: "pending" as const, createdAt: daysAgo(3) },

    // task8 (kitchen appliances) — approved
    { _id: new ObjectId(), taskId: task8Id, tenantId: tenant2Id,
      comment: "All appliances working. Oven heats to correct temperature, fridge maintaining 4°C, washing machine completes full cycle. Hob has a slow ignition on ring 3 but still works.",
      status: "approved" as const, reviewedBy: landlord1Id, reviewedAt: daysAgo(10), createdAt: daysAgo(12) },

    // task11 (garden) — approved
    { _id: new ObjectId(), taskId: task11Id, tenantId: tenant3Id,
      comment: "Garden is generally tidy. Back fence panel is slightly loose on the left side — photos show the gap. Grass was cut last week.",
      status: "approved" as const, reviewedBy: landlord2Id, reviewedAt: daysAgo(3), createdAt: daysAgo(5) },

    // task12 (extractor fans) — submitted, pending review
    { _id: new ObjectId(), taskId: task12Id, tenantId: tenant4Id,
      comment: "Kitchen extractor works well. Bathroom fan has a slight rattle but still pulls air — tissue test passed. Might need servicing soon.",
      status: "pending" as const, createdAt: daysAgo(2) },

    // task16 (radiators) — submitted, pending review
    { _id: new ObjectId(), taskId: task16Id, tenantId: tenant5Id,
      comment: "Checked all 5 radiators. Living room radiator has a cold spot at the top — probably needs bleeding. All others heat evenly. No leaks found.",
      status: "pending" as const, createdAt: daysAgo(4) },
  ];
  await database.collection("submissions").insertMany(submissions);
  console.log(`  → ${submissions.length} submissions`);

  /* ─────────────────── Cases (legal advice history) ─────────────────── */
  const cases = [
    {
      _id: new ObjectId(),
      issueType: "advice",
      situation: "My landlord is threatening to change the locks while I'm at work if I don't pay the rent arrears by Friday. Is this legal?",
      advice: "No, this is not legal. Under the Renters' Rights Act 2025 and existing UK law, your landlord cannot change the locks to evict you. This would constitute an illegal eviction under the Protection from Eviction Act 1977. Your landlord must follow the proper court procedure to regain possession. You should: 1) Not leave the property. 2) Contact West Northamptonshire Council's housing team. 3) Call Shelter on 0808 800 4444 for free advice.",
      citations: [{ title: "Illegal eviction protections", citation: "Protection from Eviction Act 1977, s.1" }],
      createdAt: daysAgo(15),
    },
    {
      _id: new ObjectId(),
      issueType: "advice",
      situation: "My boiler has been broken for 3 weeks and the landlord keeps saying they will fix it but nothing happens. It's winter and I have a young child.",
      advice: "Your landlord has a legal obligation to keep the heating and hot water in working order under Section 11 of the Landlord and Tenant Act 1985. A 3-week delay during winter, especially with a young child, is unreasonable. You should: 1) Send a written complaint via email to create a paper trail. 2) Contact West Northamptonshire Council's environmental health team to report the hazard. 3) The council can issue an improvement notice requiring urgent repair.",
      citations: [{ title: "Landlord repair obligations", citation: "Landlord and Tenant Act 1985, s.11" }, { title: "Housing health and safety", citation: "Housing Act 2004, Part 1" }],
      createdAt: daysAgo(10),
    },
    {
      _id: new ObjectId(),
      issueType: "advice",
      situation: "I want to get a cat but my tenancy agreement says no pets. Can the landlord really stop me under the new rules?",
      advice: "Under the Renters' Rights Act 2025, landlords cannot unreasonably refuse a tenant's request to keep a pet. You should make a written request to your landlord. They must respond within 42 days, and any refusal must be reasonable (for example, in a small flat with shared gardens, or where the property is unsuitable). You may be asked to take out pet insurance. If refused unreasonably, you can challenge this.",
      citations: [{ title: "Right to keep pets", citation: "Renters' Rights Act 2025, s.15" }],
      createdAt: daysAgo(6),
    },
    {
      _id: new ObjectId(),
      issueType: "emergency_eviction",
      situation: "My landlord showed up with two men and told me I have 24 hours to leave. They were aggressive and shouting.",
      advice: "This is an attempted illegal eviction. You have immediate rights: 1) DO NOT LEAVE. You are protected by law. 2) Call the police on 999 if you feel threatened. 3) Contact West Northamptonshire Council's emergency housing line. 4) Illegal eviction is a criminal offence under the Protection from Eviction Act 1977.",
      citations: [{ title: "Criminal offence of illegal eviction", citation: "Protection from Eviction Act 1977, s.1(2)" }],
      createdAt: daysAgo(3),
    },
    {
      _id: new ObjectId(),
      issueType: "advice",
      situation: "My landlord wants to increase the rent by £200/month with only 2 weeks notice. The current rent is £850. Is this allowed?",
      advice: "Under the Renters' Rights Act 2025, rent increases must follow a strict process. Your landlord must give at least 2 months' written notice using a Section 13 notice, and increases can only happen once per year. A 2-week notice period is not valid. Additionally, you can challenge the increase at the First-tier Tribunal if you believe the new rent exceeds the market rate for similar properties.",
      citations: [{ title: "Rent increase restrictions", citation: "Renters' Rights Act 2025, s.8" }, { title: "Tribunal challenge for rent", citation: "Housing Act 1988, s.14 (as amended)" }],
      createdAt: daysAgo(1),
    },
  ];
  await database.collection("cases").insertMany(cases);
  console.log(`  → ${cases.length} legal cases`);

  /* ─────────────────── Notices (analyzed) ─────────────────── */
  const notices = [
    {
      _id: new ObjectId(),
      rawText: "Dear Tenant, I am writing to inform you that I require possession of the property at 14 Kettering Road due to my intention to sell. You have 2 months to vacate. Regards, James Harrison.",
      formType: "Section 8 / Ground 1A (intention to sell)",
      grounds: ["Ground 1A — Landlord intends to sell the property"],
      validity: true,
      analysis: "This notice appears to use Ground 1A under the Renters' Rights Act 2025. The 2-month notice period meets the minimum requirement. However, the notice should be on the prescribed form and must include specific information about the tenant's right to challenge.",
      createdAt: daysAgo(12),
    },
    {
      _id: new ObjectId(),
      rawText: "You need to leave by end of this month. I want my flat back. No more excuses.",
      formType: "Invalid — no proper form used",
      grounds: [],
      validity: false,
      analysis: "This is NOT a valid notice. It does not use the prescribed form, does not cite any legal ground for possession, and the notice period is far too short (minimum 2 months required under the Renters' Rights Act 2025). This notice can be safely ignored, but the tenant should seek advice.",
      createdAt: daysAgo(8),
    },
    {
      _id: new ObjectId(),
      rawText: "NOTICE SEEKING POSSESSION — Property: 5 St Giles Terrace, NN1 2BN. Ground: Persistent rent arrears (Ground 8). The tenant has been in arrears of at least 2 months for the past 3 consecutive months. Notice period: 4 weeks from the date of this notice. Signed: Margaret Chen, 15 January 2026.",
      formType: "Section 8 / Ground 8 (persistent rent arrears)",
      grounds: ["Ground 8 — At least 2 months' rent arrears"],
      validity: true,
      analysis: "This notice cites Ground 8 (mandatory ground for persistent rent arrears). The 4-week notice period is correct for rent arrears grounds. However, the landlord must prove the arrears existed at the time of notice AND at the court hearing. The tenant should seek advice about paying off arrears to challenge this ground.",
      createdAt: daysAgo(4),
    },
  ];
  await database.collection("notices").insertMany(notices);
  console.log(`  → ${notices.length} analyzed notices`);

  /* ─────────────────── Property Reviews ─────────────────── */
  const review1Id = new ObjectId();
  const review2Id = new ObjectId();
  const review3Id = new ObjectId();
  const review4Id = new ObjectId();

  const voucher1Id = new ObjectId();

  const propertyReviews = [
    // Landlord 1 → Tenant 1 — approved with voucher
    {
      _id: review1Id,
      tenantId: tenant1Id,
      landlordId: landlord1Id,
      landlordNote: "Move-in condition check for 14 Kettering Road. Please document the condition of every room.",
      landlordPhotos: [
        { url: "/photos/landlord-review1-kitchen.jpg", uploadedAt: daysAgo(25).toISOString(), uploadedBy: landlord1Id.toString() },
        { url: "/photos/landlord-review1-bathroom.jpg", uploadedAt: daysAgo(25).toISOString(), uploadedBy: landlord1Id.toString() },
      ],
      tenantPhotos: [
        { url: "/photos/tenant-review1-kitchen.jpg", uploadedAt: daysAgo(23).toISOString(), uploadedBy: tenant1Id.toString() },
        { url: "/photos/tenant-review1-bathroom.jpg", uploadedAt: daysAgo(23).toISOString(), uploadedBy: tenant1Id.toString() },
        { url: "/photos/tenant-review1-bedroom.jpg", uploadedAt: daysAgo(23).toISOString(), uploadedBy: tenant1Id.toString() },
      ],
      status: "approved",
      adminVerdict: "thumbs_up",
      voucherId: voucher1Id,
      createdAt: daysAgo(26),
      updatedAt: daysAgo(20),
    },
    // Landlord 1 → Tenant 2 — pending admin review
    {
      _id: review2Id,
      tenantId: tenant2Id,
      landlordId: landlord1Id,
      landlordNote: "Quarterly condition check for 28 Abington Street.",
      landlordPhotos: [
        { url: "/photos/landlord-review2-living.jpg", uploadedAt: daysAgo(5).toISOString(), uploadedBy: landlord1Id.toString() },
      ],
      tenantPhotos: [
        { url: "/photos/tenant-review2-living.jpg", uploadedAt: daysAgo(3).toISOString(), uploadedBy: tenant2Id.toString() },
        { url: "/photos/tenant-review2-kitchen.jpg", uploadedAt: daysAgo(3).toISOString(), uploadedBy: tenant2Id.toString() },
      ],
      status: "pending_admin_review",
      adminVerdict: null,
      voucherId: null,
      createdAt: daysAgo(6),
      updatedAt: daysAgo(3),
    },
    // Landlord 2 → Tenant 3 — rejected
    {
      _id: review3Id,
      tenantId: tenant3Id,
      landlordId: landlord2Id,
      landlordNote: "End of tenancy inspection for 5 St Giles Terrace.",
      landlordPhotos: [
        { url: "/photos/landlord-review3-hallway.jpg", uploadedAt: daysAgo(15).toISOString(), uploadedBy: landlord2Id.toString() },
      ],
      tenantPhotos: [],
      status: "rejected",
      adminVerdict: "thumbs_down",
      voucherId: null,
      createdAt: daysAgo(16),
      updatedAt: daysAgo(12),
    },
    // Landlord 3 → Tenant 5 — pending admin review (fresh, no photos yet)
    {
      _id: review4Id,
      tenantId: tenant5Id,
      landlordId: landlord3Id,
      landlordNote: "Initial property walkthrough for 11 Billing Road.",
      landlordPhotos: [],
      tenantPhotos: [],
      status: "pending_admin_review",
      adminVerdict: null,
      voucherId: null,
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
  ];
  await database.collection("property_reviews").insertMany(propertyReviews);
  console.log(`  → ${propertyReviews.length} property reviews`);

  /* ─────────────────── Vouchers ─────────────────── */
  const vouchers = [
    {
      _id: voucher1Id,
      tenantId: tenant1Id,
      propertyReviewId: review1Id,
      voucherType: "amazon_10",
      voucherTypeLabel: "Amazon £10",
      voucherCode: "A1B2C3D4E5F6G7H8",
      issuedById: adminId,
      issuedAt: daysAgo(20),
      status: "active",
    },
  ];
  await database.collection("vouchers").insertMany(vouchers);
  console.log(`  → ${vouchers.length} vouchers`);

  /* ─────────────────── Indexes ─────────────────── */
  await database.collection("users").createIndex({ email: 1 }, { unique: true });
  await database.collection("sessions").createIndex({ token: 1 }, { unique: true });
  await database.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await database.collection("tasks").createIndex({ landlordId: 1 });
  await database.collection("tasks").createIndex({ tenantId: 1 });
  await database.collection("submissions").createIndex({ taskId: 1 });
  await database.collection("cases").createIndex({ createdAt: -1 });
  await database.collection("notices").createIndex({ createdAt: -1 });
  await database.collection("property_reviews").createIndex({ landlordId: 1 });
  await database.collection("property_reviews").createIndex({ tenantId: 1 });
  await database.collection("vouchers").createIndex({ tenantId: 1 });

  console.log("[mongodb] ✓ Demo data seeded successfully.");
  console.log("  ──────────────────────────────────────────");
  console.log("  Admin:      admin@rentshield.uk       / admin123");
  console.log("  ──────────────────────────────────────────");
  console.log("  Landlord 1: landlord@rentshield.uk     / landlord123  (James Harrison)");
  console.log("  Landlord 2: margaret@rentshield.uk     / landlord123  (Margaret Chen)");
  console.log("  Landlord 3: david@rentshield.uk        / landlord123  (David Okonkwo)");
  console.log("  ──────────────────────────────────────────");
  console.log("  Tenant 1:   tenant@rentshield.uk       / tenant123    (Louie — landlord 1)");
  console.log("  Tenant 2:   emma@rentshield.uk         / tenant123    (Emma — landlord 1)");
  console.log("  Tenant 3:   amir@rentshield.uk         / tenant123    (Amir — landlord 2)");
  console.log("  Tenant 4:   sophie@rentshield.uk       / tenant123    (Sophie — landlord 2)");
  console.log("  Tenant 5:   ryan@rentshield.uk         / tenant123    (Ryan — landlord 3)");
  console.log("  Tenant 6:   fatima@rentshield.uk       / tenant123    (Fatima — landlord 3)");
  console.log("  ──────────────────────────────────────────");
}

export async function getDb(): Promise<Db> {
  if (g._mongoDb) return g._mongoDb;

  let uri = process.env.MONGODB_URI;
  let freshMemoryServer = false;

  if (!uri) {
    // Re-use an already-running in-memory server (survives hot-reload)
    if (g._mongoMemoryUri) {
      uri = g._mongoMemoryUri;
    } else {
      console.log("[mongodb] No MONGODB_URI set — starting in-memory MongoDB…");
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      g._mongoMemoryServer = mongod;
      uri = mongod.getUri();
      g._mongoMemoryUri = uri;
      freshMemoryServer = true;
      console.log(`[mongodb] In-memory MongoDB running at ${uri}`);
    }
  }

  const client = new MongoClient(uri);
  await client.connect();
  const database = client.db(dbName);

  g._mongoClient = client;
  g._mongoDb = database;

  // Auto-seed only when a fresh in-memory server was just created
  if (freshMemoryServer) {
    await seedDatabase(database);
  }

  return database;
}

export async function closeDb(): Promise<void> {
  if (g._mongoClient) {
    await g._mongoClient.close();
    g._mongoClient = undefined;
    g._mongoDb = undefined;
  }
  if (g._mongoMemoryServer) {
    await (g._mongoMemoryServer as { stop: () => Promise<void> }).stop();
    g._mongoMemoryServer = undefined;
    g._mongoMemoryUri = undefined;
  }
}

export const COLLECTIONS = {
  users: "users",
  properties: "properties",
  tasks: "tasks",
  submissions: "submissions",
  sessions: "sessions",
  cases: "cases",
  notices: "notices",
  reports: "reports",
} as const;

/* ── Shared types ────────────────────────────────────────── */

export type Role = "admin" | "landlord" | "tenant";

export interface DbUser {
  _id?: ObjectId;
  name: string;
  email: string;
  passwordHash: string;          // simple sha-256 hash for demo
  role: Role;
  landlordId?: ObjectId | null;  // tenant belongs to landlord
  status: "active" | "suspended";
  createdAt: Date;
}

export interface DbProperty {
  _id?: ObjectId;
  landlordId: ObjectId;
  address: string;
  postcode: string;
  tenantIds: ObjectId[];
  createdAt: Date;
}

export type TaskStatus = "open" | "submitted" | "approved" | "rejected";

export interface DbTask {
  _id?: ObjectId;
  landlordId: ObjectId;
  tenantId: ObjectId;
  propertyId?: ObjectId;
  title: string;
  description: string;
  rewardAmount: number;          // pounds
  deadline: Date;
  status: TaskStatus;
  createdAt: Date;
}

export interface DbSubmission {
  _id?: ObjectId;
  taskId: ObjectId;
  tenantId: ObjectId;
  comment: string;
  evidenceUrl?: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
}

export interface DbSession {
  _id?: ObjectId;
  userId: ObjectId;
  role: Role;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}
