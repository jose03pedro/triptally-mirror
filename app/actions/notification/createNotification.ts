import Notification from "@/app/models/Notification";
import connectionToDB from "@/lib/mongoose";

export async function createNotification({
  userId,
  typeId,
  title,
  message,
  link,
}: {
  userId: string;
  typeId: string;
  title: string;
  message: string;
  link?: string;
}) {
  await connectionToDB();

  const notification = await Notification.create({
    user: userId,
    type: typeId,
    title,
    message,
    link,
  });

  return notification;
}
