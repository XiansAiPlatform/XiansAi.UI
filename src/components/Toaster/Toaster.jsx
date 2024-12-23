import { Toaster as HotToaster, toast } from 'react-hot-toast';

function Toaster() {
  return (
    <HotToaster 
      position="bottom-right"
      toastOptions={{
        error: {
          duration: 5000,
          style: {
            background: '#FED7D7',
            color: '#822727',
            padding: '16px',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90vw',
          },
          dismissible: true,
          onClick: () => toast.dismiss(),
        },
        success: {
          duration: 5000,
          style: {
            background: '#D1FAE5',
            color: '#15803D',
            padding: '16px',
          },
        },
      }}
    />
  );
}

export default Toaster; 