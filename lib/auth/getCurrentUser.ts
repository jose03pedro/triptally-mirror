import { cookies } from "next/headers";
import jwt from "jsonwebtoken"; // or your preferred token lib
import User from "@/app/models/User";

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  if (!token) return null;

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById(decoded.id);
    if (!user) return null;

    return {
      id: user._id.toString(),
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    };
  } catch (err) {
    console.error("Error verifying token:", err);
    return null;
  }
}
