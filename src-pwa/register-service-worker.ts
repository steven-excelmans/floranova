import { register } from 'register-service-worker';
import { Notify } from 'quasar';

register(process.env.SERVICE_WORKER_FILE as string, {
  updated(registration: ServiceWorkerRegistration) {
    Notify.create({
      message: 'New version available!',
      color: 'primary',
      actions: [
        {
          label: 'Reload',
          color: 'white',
          handler() {
            registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          },
        },
      ],
      timeout: 0,
    });
  },
});
