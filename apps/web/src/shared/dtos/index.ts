import { z } from "zod";
import {
  UserRole,
  AgentStatus,
  Plan,
  BusinessStatus,
  TransactionType,
  Platform,
  PeriodType,
  ForecastType,
  ScenarioType,
  CashFlowType,
  FrequencyType,
} from "../enums";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginDto = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.nativeEnum(UserRole).default(UserRole.ADMIN),
});
export type RegisterDto = z.infer<typeof RegisterSchema>;

export const CreateAgentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  status: z.nativeEnum(AgentStatus).default(AgentStatus.ACTIVE),
  managerId: z.string().optional().nullable(),
});
export type CreateAgentDto = z.infer<typeof CreateAgentSchema>;

export const UpdateAgentSchema = CreateAgentSchema.partial();
export type UpdateAgentDto = z.infer<typeof UpdateAgentSchema>;

export const CreateBusinessSchema = z.object({
  name: z.string().min(2),
  owner: z.string().min(2),
  plan: z.nativeEnum(Plan).default(Plan.FREE),
  mrr: z.number().nonnegative().default(0),
  status: z.nativeEnum(BusinessStatus).default(BusinessStatus.ACTIVE),
  renewalDate: z.string().optional().nullable(),
  agentId: z.string().optional().nullable(),
  smsUsed: z.number().int().nonnegative().default(0),
  emailUsed: z.number().int().nonnegative().default(0),
});
export type CreateBusinessDto = z.infer<typeof CreateBusinessSchema>;

export const UpdateBusinessSchema = CreateBusinessSchema.partial();
export type UpdateBusinessDto = z.infer<typeof UpdateBusinessSchema>;

export const CreateTransactionSchema = z.object({
  type: z.nativeEnum(TransactionType),
  platform: z.nativeEnum(Platform),
  businessId: z.string().optional().nullable(),
  agentId: z.string().optional().nullable(),
  amount: z.number(),
  cost: z.number().default(0),
  profit: z.number().default(0),
  paymentMethod: z.string().optional().nullable(),
  referenceId: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
});
export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;

export const CreateBudgetSchema = z.object({
  periodType: z.nativeEnum(PeriodType),
  targetRevenue: z.number().nonnegative(),
  targetBusinesses: z.number().int().nonnegative(),
  targetSmsUsage: z.number().int().nonnegative(),
  targetProfit: z.number().nonnegative(),
  startDate: z.string(),
  endDate: z.string(),
  createdBy: z.string().optional().nullable(),
});
export type CreateBudgetDto = z.infer<typeof CreateBudgetSchema>;

export const CreateForecastSchema = z.object({
  forecastType: z.nativeEnum(ForecastType),
  projectedValue: z.number(),
  growthRate: z.number(),
  churnRate: z.number(),
  conversionRate: z.number(),
  period: z.string(),
  scenario: z.nativeEnum(ScenarioType),
});
export type CreateForecastDto = z.infer<typeof CreateForecastSchema>;

export const CreateCashFlowSchema = z.object({
  type: z.nativeEnum(CashFlowType),
  category: z.string(),
  amount: z.number(),
  referenceId: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
});
export type CreateCashFlowDto = z.infer<typeof CreateCashFlowSchema>;

export const CreateExpenseSchema = z.object({
  category: z.string(),
  amount: z.number().nonnegative(),
  frequency: z.nativeEnum(FrequencyType),
  date: z.string().optional().nullable(),
});
export type CreateExpenseDto = z.infer<typeof CreateExpenseSchema>;

export const CreateSmsUsageSchema = z.object({
  businessId: z.string(),
  smsCount: z.number().int().positive(),
  costPerSms: z.number().positive(),
  sellingPricePerSms: z.number().positive(),
  date: z.string().optional().nullable(),
});
export type CreateSmsUsageDto = z.infer<typeof CreateSmsUsageSchema>;

export const CreateEmailUsageSchema = z.object({
  businessId: z.string(),
  emailCount: z.number().int().positive(),
  costPerEmail: z.number().nonnegative().default(0),
  sellingPricePerEmail: z.number().nonnegative().default(0),
  date: z.string().optional().nullable(),
});
export type CreateEmailUsageDto = z.infer<typeof CreateEmailUsageSchema>;

export const CreateQrThriveFunnelSchema = z.object({
  qrScans: z.number().int().nonnegative(),
  leadsCaptured: z.number().int().nonnegative(),
  qrUsers: z.number().int().nonnegative(),
  convertedToVemtap: z.number().int().nonnegative(),
  conversionRate: z.number().nonnegative(),
  date: z.string().optional().nullable(),
});
export type CreateQrThriveFunnelDto = z.infer<
  typeof CreateQrThriveFunnelSchema
>;

export const CreateNotificationSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.string().default("INFO"),
});
export type CreateNotificationDto = z.infer<typeof CreateNotificationSchema>;

export const UpdateSettingsSchema = z.object({
  currency: z.string().default("NGN"),
  timezone: z.string().default("WAT"),
  dateFormat: z.string().default("DD/MM/YYYY"),
  theme: z.string().default("dark"),
  paystackSecretKey: z.string().default(""),
  termiiApiKey: z.string().default(""),
});
export type UpdateSettingsDto = z.infer<typeof UpdateSettingsSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;

export const InviteMemberSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.nativeEnum(UserRole).default(UserRole.ADMIN),
});
export type InviteMemberDto = z.infer<typeof InviteMemberSchema>;
