
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    is_admin?: boolean;
    role?: "admin" | "user";
  }

  interface Session {
    user: {
      id: string;
      is_admin: boolean;
      role: "admin" | "user";
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    is_admin?: boolean;
    role?: "admin" | "user";
  }
}
