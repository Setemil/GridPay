import { useAuthStore } from "../store";

export function Profile() {
  const user = useAuthStore((s) => s.user);
  return (
    <div>
      <h1>Hello {user.name}</h1>
      <p>Welcome to your profile</p>
    </div>
  );
}
