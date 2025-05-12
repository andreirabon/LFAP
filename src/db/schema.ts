import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const leaveStatusEnum = pgEnum("leave_status", [
  "pending",
  "endorsed",
  "rejected",
  "returned",
  "tm_approved",
  "tm_rejected",
  "tm_returned",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  sex: text("sex").notNull(),
  department: text("department"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  vacationLeave: integer("vacation_leave").notNull().default(0),
  mandatoryLeave: integer("mandatory_leave").notNull().default(0),
  sickLeave: integer("sick_leave").notNull().default(0),
  maternityLeave: integer("maternity_leave").notNull().default(0),
  paternityLeave: integer("paternity_leave").notNull().default(0),
  specialPrivilegeLeave: integer("special_privilege_leave").notNull().default(0),
  usedVacationLeave: integer("used_vacation_leave").notNull().default(0),
  usedMandatoryLeave: integer("used_mandatory_leave").notNull().default(0),
  usedSickLeave: integer("used_sick_leave").notNull().default(0),
  usedMaternityLeave: integer("used_maternity_leave").notNull().default(0),
  usedPaternityLeave: integer("used_paternity_leave").notNull().default(0),
  usedSpecialPrivilegeLeave: integer("used_special_privilege_leave").notNull().default(0),
});

export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  reason: text("reason").notNull(),
  status: leaveStatusEnum("status").default("pending").notNull(),
  supportingDoc: varchar("supporting_doc", { length: 255 }),
  managerComments: text("manager_comments"),
  managerId: integer("manager_id").references(() => users.id),
  department: text("department"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type NewLeaveRequest = typeof leaveRequests.$inferInsert;
