export function formatDateHandler(item, dateOptions) {
    const defaultDateOptions = {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      separator: '/',
      ...dateOptions,
    };
  
    // Obteniendo la fecha formateada
    let formattedDate = new Date(item).toLocaleDateString('es-MX', defaultDateOptions);
  
    // Limpieza y aplicación del separador personalizado
    formattedDate = formattedDate.replace(/de /g, '').replace(/ del /g, ' de ');
  
    // Separando los componentes de la fecha para aplicar el separador y capitalización
    const dateComponents = formattedDate.split(' ');
    const capitalizedDateComponents = dateComponents.map((component, index) => {
      // Aplicar capitalización solo al mes
      if (index === 1) { // Asumiendo que el mes siempre estará en la segunda posición
        return capitalizeFirstLetterOfTheMonth(component);
      }
      return component;
    });
  
    // Reconstruyendo la fecha con el separador personalizado
    return capitalizedDateComponents.join(defaultDateOptions.separator || ' ');
  }
  
  function capitalizeFirstLetterOfTheMonth(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  