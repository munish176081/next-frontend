export interface UserType {
  id: string;
  email: string;
  name: string;
  imageUrl: string;
  username: string;
  createdAt: string;
  status: "active" | "suspended" | "not_verified";
}
