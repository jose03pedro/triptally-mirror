"use server";

import connectionToDB from "@/lib/mongoose";
import User from "../../models/User";
import { compare, hash } from "bcrypt";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { EditUserSchema, ChangePasswordSchema } from "@/lib/definitions";
import { logoutHandler } from "../auth/logout";
import Trip from "@/app/models/Trip";

type EditResult = {
  user?: any;
  success: boolean;
  errors: {
    first_name?: string[];
    last_name?: string[];
    password?: string[];
    current_password?: string[];
    message?: string;
  };
};

export async function editUser(_prev: unknown, formData: FormData): Promise<EditResult> {
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
    const avatar = (formData.get("avatar") || "") as string;

    const userValidation = EditUserSchema.safeParse({
      first_name,
      last_name,
      current_password,
      avatar
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

    if (avatar) {
      updateData.avatar = avatar;
    }

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

    const updated = await User.findByIdAndUpdate(currentUser.id, updateData, {
        new: true, // return the updated document
    });

    if (!updated) {
      return { success: false, errors: { message: "Could not find user after update." } };
    }

    return {
      user: {
          first_name: updated.first_name,
          last_name: updated.last_name,
          avatar: updated.avatar,
      },
      success: true,
      errors: {
        first_name: [],
        last_name: [],
        password: [],
        current_password: [],
      },
    };
  } catch (e) {
    console.error(e);
    return { success: false, errors: { message: "Unhandled error" } };
  }
}