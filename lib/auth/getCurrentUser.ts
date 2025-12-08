import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/app/models/User";
import { JwtPayload } from "jwt-decode";

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("session")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as string | JwtPayload;
    if (typeof decoded === "string") return null;

    const userId = (decoded as JwtPayload & { user: { id: string } }).user.id;

    const user = await User.findById(userId);
    if (!user) return null;

    return {
      id: user._id.toString(),
    };
  } catch (err) {
    console.error("Error verifying token:", err);
    return null;
  }
}
