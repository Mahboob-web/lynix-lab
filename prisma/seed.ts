/**
 * Seed: default sales pipeline + first admin user.
 *
 *   ADMIN_EMAIL=you@company.com ADMIN_PASSWORD='a-long-password' npm run db:seed
 *   npm run db:seed -- --demo     # also adds clearly-labelled demo records for testing
 *
 * Safe to re-run: existing pipeline and users are left untouched.
 * No credentials are hardcoded — the admin comes from environment variables.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set.");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

const STAGES = [
  { name: "Discovery", probability: 10 },
  { name: "Proposal sent", probability: 35 },
  { name: "Negotiation", probability: 60 },
  { name: "Verbal yes", probability: 85 },
  { name: "Won", probability: 100, isWon: true },
  { name: "Lost", probability: 0, isLost: true },
];

async function seedPipeline() {
  const existing = await db.pipeline.findFirst({ where: { isDefault: true } });
  if (existing) return existing;
  const pipeline = await db.pipeline.create({
    data: {
      name: "Sales",
      isDefault: true,
      stages: { create: STAGES.map((s, i) => ({ ...s, order: i + 1 })) },
    },
  });
  console.log("✓ Created default pipeline");
  return pipeline;
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Admin";
  if (!email || !password) {
    console.log("• ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user.");
    return null;
  }
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  const found = await db.user.findUnique({ where: { email } });
  if (found) {
    console.log(`• Admin ${email} already exists — left unchanged.`);
    return found;
  }
  const user = await db.user.create({
    data: { email, name, role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) },
  });
  await db.auditLog.create({ data: { action: "user.seed_admin", entityType: "User", entityId: user.id } });
  console.log(`✓ Created admin ${email}`);
  return user;
}

async function seedDemo(ownerId: string | undefined, pipelineId: string) {
  if ((await db.lead.count({ where: { email: { endsWith: "@example.com" } } })) > 0) {
    console.log("• Demo data already present.");
    return;
  }
  const stages = await db.pipelineStage.findMany({ where: { pipelineId }, orderBy: { order: "asc" } });
  const company = await db.company.create({
    data: { name: "Demo Dental Clinic", industry: "Healthcare", website: "https://example.com", ownerId },
  });
  const contact = await db.contact.create({
    data: { firstName: "Sara", lastName: "Demo", email: "sara@example.com", jobTitle: "Practice manager", companyId: company.id, ownerId },
  });
  const statuses = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEW"] as const;
  const services = ["AI Voice Agents", "Web Development", "Branding", "Chatbots", "Social Media Management"];
  for (let i = 0; i < 5; i++) {
    await db.lead.create({
      data: {
        name: `Demo Lead ${i + 1}`,
        email: `lead${i + 1}@example.com`,
        serviceInterest: services[i],
        budget: "$1,000 – $3,000",
        message: "Demo enquiry created by the seed script.",
        status: statuses[i],
        consent: true,
        ownerId: i % 2 === 0 ? ownerId : undefined,
        activities: { create: { type: "SYSTEM", content: "Demo lead created by seed script." } },
      },
    });
  }
  await db.deal.create({
    data: {
      title: "Demo Dental — after-hours voice agent",
      value: 1800,
      pipelineId,
      stageId: stages[1].id,
      companyId: company.id,
      contactId: contact.id,
      ownerId,
    },
  });
  await db.task.create({
    data: {
      title: "Follow up on voice agent proposal",
      type: "FOLLOW_UP",
      priority: "HIGH",
      dueAt: new Date(Date.now() + 2 * 86_400_000),
      assigneeId: ownerId,
      createdById: ownerId,
      companyId: company.id,
    },
  });
  console.log("✓ Added demo records (emails @example.com)");
}

async function main() {
  const pipeline = await seedPipeline();
  const admin = await seedAdmin();
  if (process.argv.includes("--demo")) await seedDemo(admin?.id, pipeline.id);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
