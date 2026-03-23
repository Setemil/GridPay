import { useAuthStore } from "../store";

export function TransactionsPage() {
  const user = useAuthStore((s) => s.user);
  return (
    <div>
      <h1>Hello {user.name}</h1>
      <p>Welcome to your transactions</p>
    </div>
  );
}
