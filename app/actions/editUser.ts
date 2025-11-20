"use server";

import connectionToDB from "@/lib/mongoose";
import User from "../models/User";
import { compare, hash } from "bcrypt";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { EditUserSchema, ChangePasswordSchema } from "@/lib/definitions";
import { logoutHandler } from "./logout";

type EditResult = {
  success: boolean;
  errors: {
    first_name?: string[];
    last_name?: string[];
    password?: string[];
    current_password?: string[];
    message?: string;
  };
};

export async function editUser(_prev: any, formData: FormData): Promise<EditResult> {
  try {
    await connectionToDB();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, errors: { message: "User not authenticated" } };
    }

    const first_name = (formData.get("first_name") || "") as string;
    const last_name = (formData.get("last_name") || "") as string;
    const current_password = (formData.get("current_password") || "") as string;
    const password = (formData.get("password") || "") as string;

    const userValidation = EditUserSchema.safeParse({
      first_name,
      last_name,
      current_password,
    });

    if (!userValidation.success) {
      const flat = userValidation.error.flatten();
      return {
        success: false,
        errors: {
          first_name: flat.fieldErrors.first_name || [],
          last_name: flat.fieldErrors.last_name || [],
          current_password: flat.fieldErrors.current_password || [],
        },
      };
    }

    if (!current_password) {
      return {
        success: false,
        errors: {
          current_password: ["Current password is required to make changes"],
        },
      };
    }

    const user = await User.findById(currentUser.id);
    if (!user) {
      return {
        success: false,
        errors: { first_name: ["User not found"] },
      };
    }

    const ok = await compare(current_password, user.password);
    if (!ok) {
      return {
        success: false,
        errors: { current_password: ["Current password is incorrect"] },
      };
    }

    const updateData: any = {
      first_name: userValidation.data.first_name,
      last_name: userValidation.data.last_name,
    };

    if (password) {
      const passValidation = ChangePasswordSchema.safeParse({ password });
      if (!passValidation.success) {
        const flat = passValidation.error.flatten();
        return {
          success: false,
          errors: {
            password: flat.fieldErrors.password || [],
          },
        };
      }
      updateData.password = await hash(passValidation.data.password, 10);
    }

    await User.findByIdAndUpdate(currentUser.id, updateData);
    const updated = await User.findById(currentUser.id).lean();
    if (!updated) {
      return { success: false, errors: { message: "Could not find user after update." } };
    }

    // Minimal side-effect for test (can be mocked)
    await logoutHandler();

    return {
      success: true,
      errors: {
        first_name: [],
        last_name: [],
        password: [],
        current_password: [],
      },
    };
  } catch (e) {
    return { success: false, errors: { message: "Unhandled error" } };
  }
}