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

export type FormState =
  | {
      success?: boolean;
      errors?: {
        email?: string[];
        password?: string[];
        first_name?: string[];
        last_name?: string[];
      };
    }
  | undefined;

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
