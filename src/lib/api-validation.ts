import { z } from "zod";
import { NextResponse } from "next/server";

/**
 * Zod API Validation Utilities
 *
 * Use these schemas and helpers for type-safe API validation
 *
 * @example
 * import { validateBody, schemas } from '@/lib/api-validation';
 *
 * export async function POST(req: Request) {
 *   const validation = await validateBody(req, schemas.buyOrder);
 *   if (!validation.success) {
 *     return validation.error; // NextResponse with 400 error
 *   }
 *   const { symbol, amount, price } = validation.data;
 *   // ... rest of handler
 * }
 */

// Common field schemas
const emailSchema = z
  .string()
  .email("Invalid email address")
  .toLowerCase()
  .trim();
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");
const amountSchema = z.number().positive("Amount must be positive");
const symbolSchema = z.string().min(1, "Symbol is required").toUpperCase();
const uuidSchema = z.string().uuid("Invalid ID format");

// Auth schemas
export const schemas = {
  // Sign up
  signUp: z
    .object({
      name: z.string().min(2, "Name must be at least 2 characters").max(100),
      email: emailSchema,
      password: passwordSchema,
      confirmPassword: z.string().optional(),
      preferredCurrency: z.string().length(3).default("USD"),
      accountType: z.enum(["INVESTOR", "TRADER"]).default("INVESTOR"),
    })
    .refine(
      (data) => {
        if (data.confirmPassword) {
          return data.password === data.confirmPassword;
        }
        return true;
      },
      {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      }
    ),

  // Login
  login: z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
  }),

  // Verify email
  verifyEmail: z.object({
    email: emailSchema,
    code: z.string().length(6, "Code must be 6 characters"),
  }),

  // Forgot password
  forgotPassword: z.object({
    email: emailSchema,
  }),

  // Reset password
  resetPassword: z.object({
    email: emailSchema,
    token: z.string().min(1, "Token is required"),
    password: passwordSchema,
    confirmPassword: z.string().optional(),
  }),

  // Crypto buy order
  buyOrder: z.object({
    symbol: symbolSchema,
    amount: amountSchema,
    price: amountSchema,
  }),

  // Crypto sell order
  sellOrder: z.object({
    symbol: symbolSchema,
    amount: amountSchema,
    price: amountSchema,
  }),

  // Convert crypto
  convert: z.object({
    fromSymbol: symbolSchema,
    toSymbol: symbolSchema,
    amount: amountSchema,
  }),

  // Transfer
  transfer: z
    .object({
      recipientEmail: emailSchema.optional(),
      recipientAccountNumber: z.string().optional(),
      amount: amountSchema,
      symbol: symbolSchema.optional().default("USD"),
      note: z.string().max(500).optional(),
    })
    .refine(
      (data) => {
        return data.recipientEmail || data.recipientAccountNumber;
      },
      {
        message: "Either email or account number is required",
        path: ["recipientEmail"],
      }
    ),

  // Deposit
  deposit: z.object({
    amount: amountSchema,
    method: z.enum(["CRYPTO", "BANK", "PIX"]),
    currency: z.string().length(3).default("USD"),
  }),

  // Withdrawal
  withdrawal: z.object({
    amount: amountSchema,
    method: z.enum(["CRYPTO", "BANK", "PIX"]),
    address: z.string().optional(),
    bankDetails: z
      .object({
        bankName: z.string(),
        accountNumber: z.string(),
        routingNumber: z.string().optional(),
      })
      .optional(),
  }),

  // Admin: Top up user
  adminTopUp: z.object({
    userId: uuidSchema,
    amount: amountSchema,
    type: z.enum(["BALANCE", "CRYPTO"]).default("BALANCE"),
    symbol: symbolSchema.optional(),
    reason: z.string().max(500).optional(),
  }),

  // Admin: Update user
  adminUpdateUser: z.object({
    userId: uuidSchema,
    name: z.string().min(2).max(100).optional(),
    email: emailSchema.optional(),
    role: z.enum(["USER", "ADMIN", "STAFF"]).optional(),
    isEmailVerified: z.boolean().optional(),
    preferredCurrency: z.string().length(3).optional(),
  }),

  // Notification
  notification: z.object({
    title: z.string().min(1).max(200),
    message: z.string().min(1).max(1000),
    type: z
      .enum(["INFO", "WARNING", "SUCCESS", "TRADE", "DEPOSIT", "WITHDRAW"])
      .default("INFO"),
  }),

  // KYC submission
  kycSubmit: z.object({
    documentType: z.enum(["PASSPORT", "DRIVERS_LICENSE", "NATIONAL_ID"]),
    documentNumber: z.string().min(1),
    frontImage: z.string().url("Invalid front image URL"),
    backImage: z.string().url("Invalid back image URL").optional(),
    selfieImage: z.string().url("Invalid selfie URL"),
  }),

  // Pagination
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).default("desc"),
  }),
};

// Type exports for use in handlers
export type SignUpInput = z.infer<typeof schemas.signUp>;
export type LoginInput = z.infer<typeof schemas.login>;
export type BuyOrderInput = z.infer<typeof schemas.buyOrder>;
export type SellOrderInput = z.infer<typeof schemas.sellOrder>;
export type ConvertInput = z.infer<typeof schemas.convert>;
export type TransferInput = z.infer<typeof schemas.transfer>;
export type DepositInput = z.infer<typeof schemas.deposit>;
export type WithdrawalInput = z.infer<typeof schemas.withdrawal>;
export type AdminTopUpInput = z.infer<typeof schemas.adminTopUp>;
export type AdminUpdateUserInput = z.infer<typeof schemas.adminUpdateUser>;
export type PaginationInput = z.infer<typeof schemas.pagination>;

/**
 * Validation result type
 */
type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: NextResponse };

/**
 * Validate request body against a Zod schema
 */
export async function validateBody<T extends z.ZodSchema>(
  request: Request,
  schema: T
): Promise<ValidationResult<z.infer<T>>> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const zodError = result.error as z.ZodError;
      const errors = zodError.issues.map((issue: z.ZodIssue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return {
        success: false,
        error: NextResponse.json(
          {
            error: "Validation failed",
            details: errors,
          },
          { status: 400 }
        ),
      };
    }

    return { success: true, data: result.data };
  } catch {
    return {
      success: false,
      error: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }),
    };
  }
}

/**
 * Validate URL search params against a Zod schema
 */
export function validateParams<T extends z.ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
): ValidationResult<z.infer<T>> {
  const params = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(params);

  if (!result.success) {
    const zodError = result.error as z.ZodError;
    const errors = zodError.issues.map((issue: z.ZodIssue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return {
      success: false,
      error: NextResponse.json(
        {
          error: "Invalid query parameters",
          details: errors,
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: result.data };
}

/**
 * Validate route params (e.g., [userId])
 */
export function validateRouteParams<T extends z.ZodSchema>(
  params: Record<string, string>,
  schema: T
): ValidationResult<z.infer<T>> {
  const result = schema.safeParse(params);

  if (!result.success) {
    const zodError = result.error as z.ZodError;
    const errors = zodError.issues.map((issue: z.ZodIssue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return {
      success: false,
      error: NextResponse.json(
        {
          error: "Invalid route parameters",
          details: errors,
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: result.data };
}

/**
 * Create a custom schema with common patterns
 */
export const createSchema = {
  /**
   * Create an optional string that transforms empty strings to undefined
   */
  optionalString: () =>
    z
      .string()
      .optional()
      .transform((val) => (val === "" ? undefined : val)),

  /**
   * Create a positive decimal number schema
   */
  decimal: (message = "Must be a positive number") =>
    z.coerce.number().positive(message),

  /**
   * Create an enum from values
   */
  enumFromValues: <T extends string>(values: readonly T[]) =>
    z.enum(values as [T, ...T[]]),
};
