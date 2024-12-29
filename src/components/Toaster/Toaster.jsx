import { Toaster as HotToaster, toast } from 'react-hot-toast';
import './Toaster.css';

function Toaster() {
  return (
    <HotToaster 
      position="bottom-right"
      toastOptions={{
        error: {
          duration: 5000,
          className: 'toast-error',
          dismissible: true,
          onClick: () => toast.dismiss(),
        },
        success: {
          duration: 5000,
          className: 'toast-success',
        },
      }}
    />
  );
}

export default Toaster; 