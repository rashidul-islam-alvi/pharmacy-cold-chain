export type UserRole = "ADMIN" | "NURSE";

export type AuthUser = {
  username: string;
  role: UserRole;
};

type DemoUser = AuthUser & {
  password: string;
};

const users: DemoUser[] = [
  {
    username: process.env.ADMIN_USERNAME ?? "",
    password: process.env.ADMIN_PASSWORD ?? "",
    role: "ADMIN",
  },
  {
    username: process.env.NURSE_USERNAME ?? "",
    password: process.env.NURSE_PASSWORD ?? "",
    role: "NURSE",
  },
];

export function authenticateUser(
  username: string,
  password: string,
): AuthUser | null {
  const user = users.find(
    (user) => user.username === username && user.password === password,
  );

  if (!user) {
    return null;
  }

  return {
    username: user.username,
    role: user.role,
  };
}
