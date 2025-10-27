"use server";

import connectionToDB from "@/lib/mongoose";
import User from "../models/User";
import { hash } from "bcrypt";
import { FormState, SignupFormSchema } from "@/lib/definitions";

export async function signup(state: FormState, formData: FormData) {
  try {
    await connectionToDB();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const first_name = formData.get("first_name") as string;
    const last_name = formData.get("last_name") as string;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        success: false,
        errors: { email: ["This email is already registered."] },
      };
    }

    // Validate the fields if email is new
    const validatedFields = SignupFormSchema.safeParse({
      email,
      password,
      first_name,
      last_name,
    });

    if (!validatedFields.success) {
      const flat = validatedFields.error.flatten();
      return {
        success: false,
        errors: {
          email: flat.fieldErrors.email || [],
          password: flat.fieldErrors.password || [],
          first_name: flat.fieldErrors.first_name || [],
          last_name: flat.fieldErrors.last_name || [],
        },
      };
    }

    // Create user
    const hashedPassword = await hash(validatedFields.data.password, 10);
    await User.create({
      email: validatedFields.data.email,
      password: hashedPassword,
      first_name: validatedFields.data.first_name,
      last_name: validatedFields.data.last_name,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Signup error:", error);
    return { success: false };
  }
}
