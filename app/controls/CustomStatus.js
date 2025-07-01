export default function CustomStatus({ status }) {
    const getStatusColor = (status) => {
      switch (status) {
        case 'Activo':
          return 'text-green-500';
        case 'Enviado':
          return 'text-blue-500';
        case 'No entregado':
          return 'text-red-500';
        case 'Pendiente':
          return 'text-yellow-500';
        default:
          return '';
      }
    };
  
    return (
      <div className={`rounded-full px-3 py-1 ${getStatusColor(status)}`}>
        {status}
      </div>
    );
  };