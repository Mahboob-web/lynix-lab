"use server";

/**
 * CRM server actions. Every action:
 *  1. checks the caller's permission (requirePermission),
 *  2. validates input with zod,
 *  3. enforces row-level scope for SALES users (they can only touch records they own),
 *  4. writes an Activity (business timeline) and an AuditLog entry (security trail),
 *  5. revalidates the affected pages.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { audit } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/guards";
import { can, ownerScope, taskScope, type AuthUser } from "@/lib/auth/permissions";
import { hashPassword } from "@/lib/auth/password";
import { revokeUserSessions } from "@/lib/auth/session";
import { passwordRule } from "@/lib/validation/password";
import { LeadSource, LeadStatus, Priority, Role, TaskStatus, TaskType } from "@/generated/prisma/enums";
import { formObject, runAction, UserFacingError, zId, zOptDate, zOptEmail, zOptText, type ActionState } from "./action-utils";

const NOT_FOUND = "That record doesn't exist or you don't have access to it.";

/** Owner to store on a new record: assignable roles may pick anyone, SALES always own what they create. */
async function resolveOwner(user: AuthUser, requested?: string) {
  if (!requested || !can(user, "crm:assign")) return user.id;
  const exists = await getDb().user.findFirst({ where: { id: requested, isActive: true }, select: { id: true } });
  if (!exists) throw new UserFacingError("Choose an active team member as the owner.");
  return requested;
}

// ───────────────────────────── Leads ─────────────────────────────

const leadSchema = z.object({
  name: z.string().min(2, "Enter the lead's name.").max(100),
  email: z.string().email("Enter a valid email address.").max(200).transform((v) => v.toLowerCase()),
  phone: zOptText(30),
  companyName: zOptText(120),
  serviceInterest: zOptText(80),
  budget: zOptText(60),
  source: z.nativeEnum(LeadSource).default("OTHER"),
  message: zOptText(4000),
  ownerId: zOptText(40),
});

export async function createLeadAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  let id = "";
  const res = await runAction(async () => {
    const user = await requirePermission("crm:write");
    const data = leadSchema.parse(formObject(fd));
    const ownerId = await resolveOwner(user, data.ownerId);
    const lead = await getDb().lead.create({
      data: { ...data, ownerId, consent: false, activities: { create: { type: "SYSTEM", content: `Lead added manually by ${user.name}.`, actorId: user.id } } },
    });
    id = lead.id;
    await audit("lead.create", { actorId: user.id, entityType: "Lead", entityId: lead.id });
  });
  if (res?.ok && id) redirect(`/crm/leads/${id}`);
  return res;
}

export async function updateLeadStatusAction(leadId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const user = await requirePermission("crm:write");
    const { status } = z.object({ status: z.nativeEnum(LeadStatus) }).parse(formObject(fd));
    const db = getDb();
    const lead = await db.lead.findFirst({ where: { id: leadId, ...ownerScope(user) } });
    if (!lead) throw new UserFacingError(NOT_FOUND);
    if (lead.status === status) return { ok: true, message: "Status unchanged." };
    await db.lead.update({
      where: { id: lead.id },
      data: { status, activities: { create: { type: "STATUS_CHANGE", content: `Status changed from ${lead.status} to ${status}.`, actorId: user.id } } },
    });
    await audit("lead.status_change", { actorId: user.id, entityType: "Lead", entityId: lead.id, metadata: { from: lead.status, to: status } });
    revalidatePath(`/crm/leads/${lead.id}`);
    revalidatePath("/crm/leads");
    return { ok: true, message: "Status updated." };
  });
}

export async function assignLeadAction(leadId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const user = await requirePermission("crm:assign");
    const { ownerId } = z.object({ ownerId: zOptText(40) }).parse(formObject(fd));
    const db = getDb();
    const owner = ownerId ? await db.user.findFirst({ where: { id: ownerId, isActive: true } }) : null;
    if (ownerId && !owner) throw new UserFacingError("Choose an active team member.");
    await db.lead.update({
      where: { id: leadId },
      data: { ownerId: owner?.id ?? null, activities: { create: { type: "SYSTEM", content: owner ? `Assigned to ${owner.name}.` : "Owner removed.", actorId: user.id } } },
    });
    await audit("lead.assign", { actorId: user.id, entityType: "Lead", entityId: leadId, metadata: { ownerId: owner?.id ?? null } });
    revalidatePath(`/crm/leads/${leadId}`);
    return { ok: true, message: owner ? `Assigned to ${owner.name}.` : "Owner removed." };
  });
}

/** Lead → Contact (+ Company) + Deal in the default pipeline's first stage. */
export async function convertLeadAction(leadId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  let dealCreated = false;
  const res = await runAction(async () => {
    const user = await requirePermission("crm:write");
    const { dealTitle, dealValue } = z
      .object({ dealTitle: z.string().min(2, "Give the deal a title.").max(160), dealValue: z.coerce.number().min(0, "Deal value can't be negative.").max(1e10).default(0) })
      .parse(formObject(fd));
    const db = getDb();
    const lead = await db.lead.findFirst({ where: { id: leadId, ...ownerScope(user) } });
    if (!lead) throw new UserFacingError(NOT_FOUND);
    if (lead.convertedAt) throw new UserFacingError("This lead has already been converted.");
    const pipeline = await db.pipeline.findFirst({ where: { isDefault: true }, include: { stages: { orderBy: { order: "asc" }, take: 1 } } });
    if (!pipeline?.stages[0]) throw new UserFacingError("No sales pipeline is set up. Run the database seed first.");
    const ownerId = lead.ownerId ?? user.id;

    await db.$transaction(async (tx) => {
      const company = lead.companyName
        ? (await tx.company.findFirst({ where: { name: { equals: lead.companyName, mode: "insensitive" } } })) ??
          (await tx.company.create({ data: { name: lead.companyName, ownerId } }))
        : null;
      const [firstName, ...rest] = lead.name.split(" ");
      const contact = await tx.contact.create({
        data: { firstName, lastName: rest.join(" ") || undefined, email: lead.email, phone: lead.phone, companyId: company?.id, ownerId },
      });
      const deal = await tx.deal.create({
        data: { title: dealTitle, value: dealValue, pipelineId: pipeline.id, stageId: pipeline.stages[0].id, companyId: company?.id, contactId: contact.id, leadId: lead.id, ownerId },
      });
      await tx.lead.update({
        where: { id: lead.id },
        data: {
          status: lead.status === "NEW" || lead.status === "CONTACTED" ? "QUALIFIED" : lead.status,
          contactId: contact.id,
          convertedAt: new Date(),
          activities: { create: { type: "SYSTEM", content: `Converted to contact and deal "${deal.title}".`, actorId: user.id, dealId: deal.id } },
        },
      });
    });
    dealCreated = true;
    await audit("lead.convert", { actorId: user.id, entityType: "Lead", entityId: lead.id });
  });
  if (res?.ok && dealCreated) redirect("/crm/pipeline");
  return res;
}

export async function deleteLeadAction(leadId: string): Promise<ActionState> {
  const res = await runAction(async () => {
    const user = await requirePermission("crm:delete");
    await getDb().lead.delete({ where: { id: leadId } });
    await audit("lead.delete", { actorId: user.id, entityType: "Lead", entityId: leadId });
  });
  if (res?.ok) redirect("/crm/leads");
  return res;
}

// ───────────────────────────── Notes / activity ─────────────────────────────

const noteSchema = z.object({
  type: z.enum(["NOTE", "CALL", "EMAIL", "MEETING"]).default("NOTE"),
  content: z.string().min(2, "Write a note first.").max(5000),
});

export async function addLeadNoteAction(leadId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const user = await requirePermission("crm:write");
    const data = noteSchema.parse(formObject(fd));
    const db = getDb();
    const lead = await db.lead.findFirst({ where: { id: leadId, ...ownerScope(user) }, select: { id: true } });
    if (!lead) throw new UserFacingError(NOT_FOUND);
    await db.activity.create({ data: { ...data, leadId, actorId: user.id } });
    if (data.type !== "NOTE") await db.lead.updateMany({ where: { id: leadId, status: "NEW" }, data: { status: "CONTACTED" } });
    await audit("activity.create", { actorId: user.id, entityType: "Lead", entityId: leadId, metadata: { type: data.type } });
    revalidatePath(`/crm/leads/${leadId}`);
    return { ok: true, message: "Added to the timeline." };
  });
}

// ───────────────────────────── Tasks & follow-ups ─────────────────────────────

const taskSchema = z.object({
  title: z.string().min(2, "Give the task a title.").max(200),
  description: zOptText(2000),
  type: z.nativeEnum(TaskType).default("TODO"),
  priority: z.nativeEnum(Priority).default("MEDIUM"),
  dueAt: zOptDate,
  assigneeId: zOptText(40),
  leadId: zOptText(40),
  dealId: zOptText(40),
  contactId: zOptText(40),
  companyId: zOptText(40),
});

export async function createTaskAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const user = await requirePermission("crm:write");
    const data = taskSchema.parse(formObject(fd));
    const db = getDb();
    // Related record must be visible to the caller.
    if (data.leadId && !(await db.lead.findFirst({ where: { id: data.leadId, ...ownerScope(user) }, select: { id: true } }))) throw new UserFacingError(NOT_FOUND);
    if (data.dealId && !(await db.deal.findFirst({ where: { id: data.dealId, ...ownerScope(user) }, select: { id: true } }))) throw new UserFacingError(NOT_FOUND);
    const assigneeId = await resolveOwner(user, data.assigneeId);
    const task = await db.task.create({ data: { ...data, assigneeId, createdById: user.id } });
    if (data.leadId) await db.activity.create({ data: { type: "SYSTEM", content: `Follow-up scheduled: ${task.title}.`, leadId: data.leadId, actorId: user.id } });
    await audit("task.create", { actorId: user.id, entityType: "Task", entityId: task.id });
    revalidatePath("/crm/tasks");
    revalidatePath("/crm");
    if (data.leadId) revalidatePath(`/crm/leads/${data.leadId}`);
    return { ok: true, message: "Task added." };
  });
}

export async function setTaskStatusAction(taskId: string, status: TaskStatus): Promise<ActionState> {
  return runAction(async () => {
    const user = await requirePermission("crm:write");
    z.nativeEnum(TaskStatus).parse(status);
    const db = getDb();
    const task = await db.task.findFirst({ where: { id: taskId, ...taskScope(user) } });
    if (!task) throw new UserFacingError(NOT_FOUND);
    await db.task.update({ where: { id: taskId }, data: { status, completedAt: status === "DONE" ? new Date() : null } });
    await audit("task.status_change", { actorId: user.id, entityType: "Task", entityId: taskId, metadata: { status } });
    revalidatePath("/crm/tasks");
    revalidatePath("/crm");
    if (task.leadId) revalidatePath(`/crm/leads/${task.leadId}`);
  });
}

// ───────────────────────────── Deals & pipeline ─────────────────────────────

const dealSchema = z.object({
  title: z.string().min(2, "Give the deal a title.").max(160),
  value: z.coerce.number().min(0).max(1e10).default(0),
  currency: z.string().length(3).toUpperCase().default("USD"),
  stageId: zId,
  companyId: zOptText(40),
  contactId: zOptText(40),
  ownerId: zOptText(40),
  expectedCloseDate: zOptDate,
});

export async function createDealAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const user = await requirePermission("crm:write");
    const data = dealSchema.parse(formObject(fd));
    const db = getDb();
    const stage = await db.pipelineStage.findUnique({ where: { id: data.stageId } });
    if (!stage) throw new UserFacingError("Choose a pipeline stage.");
    const ownerId = await resolveOwner(user, data.ownerId);
    const deal = await db.deal.create({
      data: {
        ...data,
        ownerId,
        pipelineId: stage.pipelineId,
        status: stage.isWon ? "WON" : stage.isLost ? "LOST" : "OPEN",
        activities: { create: { type: "SYSTEM", content: `Deal created in ${stage.name}.`, actorId: user.id } },
      },
    });
    await audit("deal.create", { actorId: user.id, entityType: "Deal", entityId: deal.id });
    revalidatePath("/crm/pipeline");
    return { ok: true, message: "Deal added." };
  });
}

export async function moveDealAction(dealId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const user = await requirePermission("crm:write");
    const { stageId } = z.object({ stageId: zId }).parse(formObject(fd));
    const db = getDb();
    const deal = await db.deal.findFirst({ where: { id: dealId, ...ownerScope(user) }, include: { stage: true } });
    if (!deal) throw new UserFacingError(NOT_FOUND);
    const stage = await db.pipelineStage.findFirst({ where: { id: stageId, pipelineId: deal.pipelineId } });
    if (!stage) throw new UserFacingError("Choose a stage from this pipeline.");
    if (stage.id === deal.stageId) return { ok: true };
    const status = stage.isWon ? "WON" : stage.isLost ? "LOST" : "OPEN";
    await db.deal.update({
      where: { id: deal.id },
      data: {
        stageId: stage.id,
        status,
        closedAt: status === "OPEN" ? null : new Date(),
        activities: { create: { type: "STATUS_CHANGE", content: `Moved from ${deal.stage.name} to ${stage.name}.`, actorId: user.id } },
      },
    });
    if (status === "WON" && deal.leadId) await db.lead.update({ where: { id: deal.leadId }, data: { status: "WON" } });
    if (status === "LOST" && deal.leadId) await db.lead.update({ where: { id: deal.leadId }, data: { status: "LOST" } });
    await audit("deal.stage_change", { actorId: user.id, entityType: "Deal", entityId: deal.id, metadata: { from: deal.stage.name, to: stage.name } });
    revalidatePath("/crm/pipeline");
    revalidatePath("/crm");
    return { ok: true, message: `Moved to ${stage.name}.` };
  });
}

// ───────────────────────────── Contacts & companies ─────────────────────────────

const contactSchema = z.object({
  firstName: z.string().min(1, "Enter a first name.").max(80),
  lastName: zOptText(80),
  email: zOptEmail,
  phone: zOptText(30),
  jobTitle: zOptText(120),
  companyId: zOptText(40),
  notes: zOptText(4000),
});

export async function createContactAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const user = await requirePermission("crm:write");
    const data = contactSchema.parse(formObject(fd));
    const contact = await getDb().contact.create({ data: { ...data, ownerId: user.id } });
    await audit("contact.create", { actorId: user.id, entityType: "Contact", entityId: contact.id });
    revalidatePath("/crm/contacts");
    return { ok: true, message: "Contact added." };
  });
}

const companySchema = z.object({
  name: z.string().min(1, "Enter the company name.").max(160),
  website: z.string().url("Enter a full URL, like https://example.com.").max(300).optional(),
  industry: zOptText(120),
  phone: zOptText(30),
  notes: zOptText(4000),
});

export async function createCompanyAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const user = await requirePermission("crm:write");
    const data = companySchema.parse(formObject(fd));
    const company = await getDb().company.create({ data: { ...data, ownerId: user.id } });
    await audit("company.create", { actorId: user.id, entityType: "Company", entityId: company.id });
    revalidatePath("/crm/companies");
    return { ok: true, message: "Company added." };
  });
}

// ───────────────────────────── Users (admin) ─────────────────────────────

const newUserSchema = z.object({
  name: z.string().min(2, "Enter the person's name.").max(100),
  email: z.string().email("Enter a valid email address.").max(200).transform((v) => v.toLowerCase()),
  role: z.nativeEnum(Role),
  password: passwordRule,
});

export async function createUserAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const admin = await requirePermission("users:manage");
    const data = newUserSchema.parse(formObject(fd));
    const db = getDb();
    if (await db.user.findUnique({ where: { email: data.email } })) throw new UserFacingError("A user with that email already exists.");
    const user = await db.user.create({ data: { name: data.name, email: data.email, role: data.role, passwordHash: await hashPassword(data.password) } });
    await audit("user.create", { actorId: admin.id, entityType: "User", entityId: user.id, metadata: { role: data.role } });
    revalidatePath("/crm/users");
    return { ok: true, message: `${user.name} can now sign in. Share the temporary password securely and ask them to change it.` };
  });
}

export async function updateUserAction(userId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const admin = await requirePermission("users:manage");
    const data = z.object({ role: z.nativeEnum(Role), isActive: z.enum(["true", "false"]).transform((v) => v === "true") }).parse(formObject(fd));
    if (userId === admin.id && (data.role !== "ADMIN" || !data.isActive)) {
      throw new UserFacingError("You can't remove your own admin access. Ask another admin.");
    }
    const db = getDb();
    const before = await db.user.findUnique({ where: { id: userId } });
    if (!before) throw new UserFacingError(NOT_FOUND);
    await db.user.update({ where: { id: userId }, data: { role: data.role, isActive: data.isActive } });
    // Permission changes take effect immediately: end the user's existing sessions.
    if (before.role !== data.role || before.isActive !== data.isActive) await revokeUserSessions(userId);
    await audit("user.update", { actorId: admin.id, entityType: "User", entityId: userId, metadata: { role: [before.role, data.role], isActive: [before.isActive, data.isActive] } });
    revalidatePath("/crm/users");
    return { ok: true, message: "User updated." };
  });
}

export async function resetUserPasswordAction(userId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  return runAction(async () => {
    const admin = await requirePermission("users:manage");
    const { password } = z.object({ password: passwordRule }).parse(formObject(fd));
    await getDb().user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(password), failedLoginCount: 0, lockedUntil: null } });
    await revokeUserSessions(userId);
    await audit("user.password_reset", { actorId: admin.id, entityType: "User", entityId: userId });
    return { ok: true, message: "Password reset and the user's sessions were signed out." };
  });
}
