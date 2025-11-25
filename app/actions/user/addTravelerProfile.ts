"use server";

import connectionToDB from "@/lib/mongoose";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { TravelerProfileSchema } from "@/lib/definitions"; // New schema import
import { TravelerProfile } from "../../models/TravelerProfile"; // New model import
import { revalidatePath } from "next/cache";

// Define the result type for clarity, using generic message errors
type TravelerEditResult = {
  success: boolean;
  errors: {
    message?: string;
    // We keep the original keys for compatibility with useActionState,
    // though they are not strictly used for profile fields.
    travelFrequency?: string[];
    preferredTransport?: string[];
    // ... add other profile fields if specific field errors are needed
  };
};

/**
 * Server action to update or create a TravelerProfile for the logged-in user.
 * NOTE: This action expects the form data to be correctly structured,
 * especially arrays like preferredTransport and interests. If the front-end
 * is serializing the full state object, the form data extraction logic below
 * may need adjustment (e.g., parsing a JSON string from a hidden field).
 *
 * @param {any} _prev - The previous state of the action.
 * @param {FormData} formData - The data submitted from the form.
 * @returns {Promise<TravelerEditResult>}
 */
export async function addTravelerProfile(_prev: any, formData: FormData): Promise<TravelerEditResult> {
  try {
    await connectionToDB();
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return { success: false, errors: { message: "User not authenticated" } };
    }

    // 1. Extract Data from FormData
    // Since we are using chip selectors and "other" inputs, the data needs careful extraction.
    // For simplicity, we are assuming arrays are passed by the client-side logic
    // (e.g., in the modal's `next` or submission handler) as comma-separated strings
    // or as an array of values if using hidden inputs.
    // Given the `formData` object, we must extract ALL relevant profile fields:
    
    const rawData = {
      travelFrequency: formData.get("travelFrequency") || '',
      preferredTransport: formData.getAll("preferredTransport") || [], // Requires multiple hidden inputs or client-side serialization
      accommodationType: formData.get("accommodationType") || '',
      budgetRange: formData.get("budgetRange") || '',
      dietaryRestrictions: formData.getAll("dietaryRestrictions") || [],
      mobilityNeeds: formData.get("mobilityNeeds") || '',
      interests: formData.getAll("interests") || [],
      languagesSpoken: formData.getAll("languagesSpoken") || [],
      tripStyle: formData.get("tripStyle") || '',
      notes: formData.get("notes") || '',
    };
    
    // 2. Validate Data
    const validation = TravelerProfileSchema.safeParse(rawData);

    if (!validation.success) {
      // In a real application, you'd map these to the exact field names used in the form's state
      // For now, we return a generic error message.
      console.error("Profile validation failed:", validation.error.flatten().fieldErrors);
      return {
        success: false,
        errors: { message: "Invalid data submitted. Please check all fields." },
      };
    }

    const profileData = validation.data;
    
    // 3. Upsert Traveler Profile
    // We use findOneAndUpdate with upsert: true to create the profile if it doesn't exist,
    // or update it if it does. The user ID is the key (_id).
    const updatedProfile = await TravelerProfile.findOneAndUpdate(
      { _id: currentUser.id }, // Query by the user's ID
      { $set: profileData },
      { 
        new: true, 
        upsert: true, // Create the document if it doesn't exist
        runValidators: true 
      }
    );

    if (!updatedProfile) {
        return { success: false, errors: { message: "Failed to save or update profile." } };
    }

    // Revalidate paths that rely on the user profile data
    revalidatePath("/profile"); 

    return {
      success: true,
      errors: {}, // Empty errors on success
    };

  } catch (e) {
    console.error("Unhandled error in editTraveler:", e);
    return { success: false, errors: { message: "An unhandled server error occurred." } };
  }
}