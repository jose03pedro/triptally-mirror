import { useNotificationStore } from "@/lib/store/notificationStore";

describe("useNotificationStore", () => {
  beforeEach(() => {
    useNotificationStore.setState({ notifications: [] });
  });

  it("inicia com notifications = []", () => {
    expect(useNotificationStore.getState().notifications).toEqual([]);
  });

  it("setNotifications substitui o array", () => {
    const notifs = [
      { _id: "1", read: false },
      { _id: "2", read: true },
    ] as any[];

    useNotificationStore.getState().setNotifications(notifs);
    expect(useNotificationStore.getState().notifications).toEqual(notifs);
  });

  it("markAsRead marca a notif correta como lida", () => {
    const notifs = [
      { _id: "1", read: false },
      { _id: "2", read: false },
    ] as any[];

    useNotificationStore.getState().setNotifications(notifs);
    useNotificationStore.getState().markAsRead("2");

    const final = useNotificationStore.getState().notifications;
    expect(final.find((n) => n._id === "1")?.read).toBe(false);
    expect(final.find((n) => n._id === "2")?.read).toBe(true);
  });
});
