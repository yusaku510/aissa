import { pgTable, text, serial, timestamp, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const travelRequests = pgTable("travel_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  departmentCode: varchar("department_code", { length: 50 }).notNull(),
  purpose: text("purpose").notNull(),
  numberOfTravelers: integer("number_of_travelers").notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: varchar("status", { length: 20 }).notNull().default('pending'),
});

export const travelers = pgTable("travelers", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").references(() => travelRequests.id),
  name: varchar("name", { length: 100 }).notNull(),
  employeeId: varchar("employee_id", { length: 50 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
});

export const transportation = pgTable("transportation", {
  id: serial("id").primaryKey(),
  travelerId: integer("traveler_id").references(() => travelers.id),
  departure: varchar("departure", { length: 100 }).notNull(),
  destination: varchar("destination", { length: 100 }).notNull(),
  arrivalTime: timestamp("arrival_time").notNull(),
  transportationType: varchar("transportation_type", { length: 50 }).notNull(),
  amount: integer("amount").notNull(),
  excessReason: text("excess_reason"),
});

export const accommodation = pgTable("accommodation", {
  id: serial("id").primaryKey(),
  travelerId: integer("traveler_id").references(() => travelers.id),
  numberOfNights: integer("number_of_nights").notNull(),
  location: varchar("location", { length: 100 }).notNull(),
  amount: integer("amount").notNull(),
  excessReason: text("excess_reason"),
  hasPreStay: boolean("has_pre_stay").notNull().default(false),
  preStayReason: text("pre_stay_reason"),
  hasPostStay: boolean("has_post_stay").notNull().default(false),
  postStayReason: text("post_stay_reason"),
});

// Schema for creating new travel request
export const insertTravelRequestSchema = createInsertSchema(travelRequests)
  .omit({ id: true, userId: true, status: true });

// Schema for creating new traveler
export const insertTravelerSchema = createInsertSchema(travelers)
  .omit({ id: true });

// Schema for creating new transportation
export const insertTransportationSchema = createInsertSchema(transportation)
  .omit({ id: true });

// Schema for creating new accommodation
export const insertAccommodationSchema = createInsertSchema(accommodation)
  .omit({ id: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type TravelRequest = typeof travelRequests.$inferSelect;
export type InsertTravelRequest = z.infer<typeof insertTravelRequestSchema>;

export type Traveler = typeof travelers.$inferSelect;
export type InsertTraveler = z.infer<typeof insertTravelerSchema>;

export type Transportation = typeof transportation.$inferSelect;
export type InsertTransportation = z.infer<typeof insertTransportationSchema>;

export type Accommodation = typeof accommodation.$inferSelect;
export type InsertAccommodation = z.infer<typeof insertAccommodationSchema>;

export type TravelRequestStatus = 'pending' | 'approved' | 'rejected';