import { useAuthStore } from "../store";

export function MyListings() {
  const user = useAuthStore((s) => s.user);
  return (
    <div>
      <h1>Hello {user.name}</h1>
      <p>Welcome to your listings</p>
    </div>
  );
}
