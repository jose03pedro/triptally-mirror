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

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        success: false,
        errors: { email: ["This email is already registered."] },
      };
    }

    // Validate the fields if email is new
    const validatedFields = SignupFormSchema.safeParse({ email, password });

    if (!validatedFields.success) {
      const flat = validatedFields.error.flatten();
      return {
        success: false,
        errors: {
          email: flat.fieldErrors.email || [],
          password: flat.fieldErrors.password || [],
        },
      };
    }

    // Create user
    const hashedPassword = await hash(validatedFields.data.password, 10);
    await User.create({
      email: validatedFields.data.email,
      password: hashedPassword,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Signup error:", error);
    return { success: false };
  }
}
