import type { Role } from "@/constants/enums";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      role: Role;
      username: string;
      hasArtistProfile: boolean;
    };
  }

  interface User {
    role?: Role;
    username?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    username: string;
    hasArtistProfile: boolean;
  }
}
