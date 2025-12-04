import { useUserStore } from "@/lib/store/userStore";

describe("useUserStore", () => {
  beforeEach(() => {
    // limpar o estado entre testes
    const { clearUser } = useUserStore.getState();
    clearUser();
  });

  it("inicia com user = null", () => {
    expect(useUserStore.getState().user).toBeNull();
  });

  it("setUser define o utilizador", () => {
    const dummyUser = { id: "1", first_name: "John", last_name: "Doe", email: "test@test.com" } as any;
    useUserStore.getState().setUser(dummyUser);

    expect(useUserStore.getState().user).toEqual(dummyUser);
  });

  it("clearUser limpa o utilizador", () => {
    const dummyUser = { id: "1" } as any;
    useUserStore.getState().setUser(dummyUser);
    useUserStore.getState().clearUser();

    expect(useUserStore.getState().user).toBeNull();
  });

  it("updateUser faz merge dos dados", () => {
    useUserStore.getState().setUser({ id: "1", first_name: "John", last_name: "Doe" } as any);

    useUserStore.getState().updateUser({ last_name: "Smith" });

    expect(useUserStore.getState().user).toEqual({
      id: "1",
      first_name: "John",
      last_name: "Smith",
    });
  });
});
