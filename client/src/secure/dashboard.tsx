import { useAuthStore } from '../store'
import { capitalize } from '../helpers';

export function Dashboard() {
  const user = useAuthStore((s) => s.user)

    return (
      <div>
        <h1>Hello {capitalize(user?.full_name ?? '')}</h1>
            <p>Welcome to your dashboard</p>
            
      </div>
    );
}