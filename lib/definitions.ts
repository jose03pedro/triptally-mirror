import * as z from "zod";

export const SignupFormSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { error: "Must be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { error: "Must contain at least one letter." })
    .regex(/[0-9]/, { error: "Must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      error: "Must contain at least one special character.",
    })
    .trim(),
  first_name: z.string().trim().nonempty("First name is required"),
  last_name: z.string().trim().nonempty("Last name is required"),
});

export const CreateTripSchema = z
  .object({
    title: z.string().trim().nonempty("Title is required"),
    startDate: z.string().trim().nonempty("Start date is required"),
    endDate: z.string().trim().nonempty("End date is required"),
    cities: z
      .array(
        z.object({
          name: z.string().trim().nonempty("Please select a valid city"),
          country: z.string().trim(),
        })
      )
      .min(1, "At least one city is required"),
  })
  .refine(
    (data) => {
      // Check that endDate >= startDate
      if (!data.startDate || !data.endDate) return true;
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    {
      message: "Must be after the start date",
      path: ["endDate"],
    }
  );

export const CreateExpenseSchema = z.object({
  tripId: z.string().min(1, "Trip is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  currency: z.string().min(1, "Currency is required"),

  date: z
    .string()
    .min(1, "Date is required")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Date must be a valid date",
    }),

  value: z
    .string()
    .min(1, "Value is required")
    .refine((v) => !isNaN(Number(v)), {
      message: "Value must be a valid number",
    }),
});

export type AuthErrors = {
  email?: string[];
  password?: string[];
  first_name?: string[];
  last_name?: string[];
};

export type AuthResponse = {
  success: boolean;
  token?: string;
  errors?: AuthErrors;
};
