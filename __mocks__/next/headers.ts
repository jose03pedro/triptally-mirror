export const cookies = jest.fn(() => {
  const store = new Map<string, string>();

  return {
    get: (name: string) => {
      const value = store.get(name);
      return value ? { name, value } : undefined;
    },
    set: (name: string, value: string) => {
      store.set(name, value);
    },
    delete: (name: string) => {
      store.delete(name);
    },
  };
});

export const headers = jest.fn(() => new Map());
