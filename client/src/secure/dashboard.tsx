import { useAuthStore } from '../store'
import { capitalize } from '../helpers';
import { Button, Modal } from '../components/ui';

export function Dashboard() {
    const user = useAuthStore((s) => s.user)

    return (
      <div>
        <h1>Hello {capitalize(user.full_name)}</h1>
            <p>Welcome to your dashboard</p>
            <Modal open={true} title='setemi'>
                <Button variant='primary'>Save</Button>
            </Modal>
      </div>
    );
}