"use server";

import connectionToDB from "@/lib/mongoose";
import User from "../models/User";
import { hash } from "bcrypt";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

// Schema for validation
const EditUserSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    current_password: z.string().min(1, "Current password is required"),
    password: z.string().optional(),
});

export async function editUser(prevState: any, formData: FormData) {
    try {
        await connectionToDB();
        
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return { success: false, errors: { message: "User not authenticated" } };
        }

        const first_name = formData.get("first_name") as string;
        const last_name = formData.get("last_name") as string;
        const current_password = formData.get("current_password") as string;
        const password = formData.get("password") as string;

        const validation = EditUserSchema.safeParse({
            first_name,
            last_name,
            current_password,
            password,
        });

        if (!validation.success) {
            const flat = validation.error.flatten();
            return {
                success: false,
                errors: {
                    first_name: flat.fieldErrors.first_name || [],
                    last_name: flat.fieldErrors.last_name || [],
                    current_password: flat.fieldErrors.current_password || [],
                    password: flat.fieldErrors.password || [],
                },
            };
        }

        // Verify current password
        const currentPassword = formData.get("current_password") as string;
        
        if (!currentPassword) {
            return { 
            success: false, 
            errors: { current_password: ["Current password is required to make changes"] } 
            };
        }

        const user = await User.findById(currentUser.id);
        if (!user) {
            return { success: false, errors: { first_name: ["User not found"] } };
        }

        const { compare } = await import("bcrypt");
        const isPasswordValid = await compare(currentPassword, user.password);
        
        if (!isPasswordValid) {
            return { 
                success: false, 
                errors: { current_password: ["Current password is incorrect"] } 
            };
        }

        const updateData: any = {
            first_name: validation.data.first_name,
            last_name: validation.data.last_name,
        };

        if (validation.data.password) {
            updateData.password = await hash(validation.data.password, 10);
        }

        console.log("Updating user:", currentUser.id);
        console.log("Update data:", updateData);

        await User.findByIdAndUpdate(currentUser.id, updateData);

        return { success: true };
    } catch (error) {
        console.error("Edit user error:", error);
        return { success: false };
    }
}