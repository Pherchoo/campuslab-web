const key = "campuslab.session";
export const sessionStorage = {
  get: async () => localStorage.getItem(key),
  set: async (token) => localStorage.setItem(key, token),
  remove: async () => localStorage.removeItem(key),
};
