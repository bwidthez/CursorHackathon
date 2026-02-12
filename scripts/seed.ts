/**
 * Seed script — populates MongoDB with sample users, properties, tasks.
 *
 * Run:  npx tsx scripts/seed.ts
 */

import { MongoClient, ObjectId } from "mongodb";
import { createHash } from "crypto";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Set MONGODB_URI in .env first");
  process.exit(1);
}

function hash(pw: string) {
  return createHash("sha256").update(pw).digest("hex");
}

async function main() {
  const client = new MongoClient(uri!);
  await client.connect();
  console.log("Connected to MongoDB Atlas");

  const db = client.db("rentshield");

  // ── Clean old data ──
  const cols = ["users", "properties", "tasks", "submissions", "sessions"];
  for (const c of cols) {
    await db.collection(c).deleteMany({});
  }
  console.log("Cleared existing data");

  // ── Users ──
  const adminId = new ObjectId();
  const landlordId = new ObjectId();
  const tenantId = new ObjectId();
  const tenant2Id = new ObjectId();

  const users = [
    {
      _id: adminId,
      name: "Sarah Admin",
      email: "admin@rentshield.uk",
      passwordHash: hash("admin123"),
      role: "admin" as const,
      landlordId: null,
      status: "active" as const,
      createdAt: new Date(),
    },
    {
      _id: landlordId,
      name: "James Landlord",
      email: "landlord@rentshield.uk",
      passwordHash: hash("landlord123"),
      role: "landlord" as const,
      landlordId: null,
      status: "active" as const,
      createdAt: new Date(),
    },
    {
      _id: tenantId,
      name: "Louie Tenant",
      email: "tenant@rentshield.uk",
      passwordHash: hash("tenant123"),
      role: "tenant" as const,
      landlordId: landlordId,
      status: "active" as const,
      createdAt: new Date(),
    },
    {
      _id: tenant2Id,
      name: "Emma Tenant",
      email: "emma@rentshield.uk",
      passwordHash: hash("tenant123"),
      role: "tenant" as const,
      landlordId: landlordId,
      status: "active" as const,
      createdAt: new Date(),
    },
  ];
  await db.collection("users").insertMany(users);
  console.log(`Inserted ${users.length} users`);

  // ── Properties ──
  const propId = new ObjectId();
  const prop2Id = new ObjectId();

  const properties = [
    {
      _id: propId,
      landlordId,
      address: "14 Kettering Road, Northampton",
      postcode: "NN1 4AA",
      tenantIds: [tenantId],
      createdAt: new Date(),
    },
    {
      _id: prop2Id,
      landlordId,
      address: "28 Abington Street, Northampton",
      postcode: "NN1 2AJ",
      tenantIds: [tenant2Id],
      createdAt: new Date(),
    },
  ];
  await db.collection("properties").insertMany(properties);
  console.log(`Inserted ${properties.length} properties`);

  // ── Tasks ──
  const tasks = [
    {
      _id: new ObjectId(),
      landlordId,
      tenantId,
      propertyId: propId,
      title: "Submit meter reading",
      description: "Take a photo of the electricity and gas meters and submit the readings.",
      rewardAmount: 10,
      deadline: new Date("2026-03-01"),
      status: "open" as const,
      createdAt: new Date(),
    },
    {
      _id: new ObjectId(),
      landlordId,
      tenantId,
      propertyId: propId,
      title: "Report any maintenance issues",
      description: "Walk through the property and report any issues that need fixing: leaks, damp, broken fixtures.",
      rewardAmount: 15,
      deadline: new Date("2026-03-15"),
      status: "open" as const,
      createdAt: new Date(),
    },
    {
      _id: new ObjectId(),
      landlordId,
      tenantId: tenant2Id,
      propertyId: prop2Id,
      title: "Confirm smoke alarm works",
      description: "Test the smoke alarm and carbon monoxide detector. Submit a photo of each device showing it is working.",
      rewardAmount: 5,
      deadline: new Date("2026-02-28"),
      status: "open" as const,
      createdAt: new Date(),
    },
  ];
  await db.collection("tasks").insertMany(tasks);
  console.log(`Inserted ${tasks.length} tasks`);

  // ── Create indexes ──
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("sessions").createIndex({ token: 1 }, { unique: true });
  await db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection("tasks").createIndex({ landlordId: 1 });
  await db.collection("tasks").createIndex({ tenantId: 1 });
  await db.collection("submissions").createIndex({ taskId: 1 });
  console.log("Created indexes");

  console.log("\n════════════════════════════════════════");
  console.log("  SEED COMPLETE — Sample credentials:");
  console.log("════════════════════════════════════════");
  console.log("  Admin:    admin@rentshield.uk     / admin123");
  console.log("  Landlord: landlord@rentshield.uk  / landlord123");
  console.log("  Tenant:   tenant@rentshield.uk    / tenant123");
  console.log("  Tenant 2: emma@rentshield.uk      / tenant123");
  console.log("════════════════════════════════════════\n");

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
