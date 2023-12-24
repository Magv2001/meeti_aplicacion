// Obtén una lista de todas las alertas
const alertaElements = document.querySelectorAll('.alertas');

// Función para eliminar todas las alertas
function eliminarAlertas() {
    alertaElements.forEach(alertaElement => {
        const padre = alertaElement.parentElement;
        padre.removeChild(alertaElement);
    });
}

// Elimina todas las alertas después de 3 segundos (3000 milisegundos)
setTimeout(eliminarAlertas, 3000);



