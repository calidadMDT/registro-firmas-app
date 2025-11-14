// VARIABLES GLOBALES
let signaturePad;
let registros = [];

// INICIALIZACIÓN AL CARGAR LA PÁGINA
document.addEventListener('DOMContentLoaded', function() {
    inicializarSignaturePad();
    cargarRegistrosDesdeLocalStorage();
    actualizarContadorRegistros();
    
    // Event Listeners
    document.getElementById('clearSignature').addEventListener('click', limpiarFirma);
    document.getElementById('registroForm').addEventListener('submit', manejarEnvioFormulario);
    document.getElementById('exportExcel').addEventListener('click', exportarAExcel);
});

// ==================== FIRMA DIGITAL ====================

function inicializarSignaturePad() {
    const canvas = document.getElementById('signaturePad');
    
    // Ajustar tamaño del canvas para pantallas pequeñas
    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = 200 * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
    }
    
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    
    // Inicializar Signature Pad
    signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgba(255, 255, 255, 0)',
        penColor: 'rgb(0, 0, 0)',
        minWidth: 1,
        maxWidth: 3
    });
}

function limpiarFirma() {
    signaturePad.clear();
}

// ================== MANEJO DE FECHA/HORA COLOMBIA ==================

function obtenerFechaHoraColombia() {
    // Colombia está en UTC-5 todo el año (no tiene horario de verano)
    const fecha = new Date();
    const offsetColombia = -5; // UTC-5
    
    // Convertir a timestamp en UTC
    const utc = fecha.getTime() + (fecha.getTimezoneOffset() * 60000);
    
    // Crear nueva fecha con offset de Colombia
    const fechaColombia = new Date(utc + (3600000 * offsetColombia));
    
    // Formatear fecha
    const opcionesFecha = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    };
    
    const opcionesHora = { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: false 
    };
    
    const fechaFormateada = fechaColombia.toLocaleDateString('es-CO', opcionesFecha);
    const horaFormateada = fechaColombia.toLocaleTimeString('es-CO', opcionesHora);
    
    return {
        fechaCompleta: fechaColombia,
        fecha: fechaFormateada,
        hora: horaFormateada,
        timestamp: fechaColombia.getTime()
    };
}

// ================== MANEJO DEL FORMULARIO ==================

function manejarEnvioFormulario(event) {
    event.preventDefault();
    
    // VALIDACIONES
    if (!validarFormulario()) {
        return;
    }
    
    // Verificar si hay firma
    if (signaturePad.isEmpty()) {
        mostrarMensaje('Por favor, realice su firma digital antes de enviar.', 'error');
        return;
    }
    
    // Obtener datos del formulario
    const datos = obtenerDatosFormulario();
    
    // Guardar registro
    guardarRegistro(datos);
    
    // Limpiar formulario
    limpiarFormulario();
    
    // Mostrar mensaje de éxito
    mostrarMensaje('¡Registro guardado exitosamente!', 'exito');
    
    // Actualizar contador
    actualizarContadorRegistros();
}

function validarFormulario() {
    const nombres = document.getElementById('nombres').value.trim();
    const documento = document.getElementById('documento').value.trim();
    const correo = document.getElementById('correo').value.trim();
    
    if (nombres.length < 5) {
        mostrarMensaje('Nombres y apellidos debe tener al menos 5 caracteres.', 'error');
        return false;
    }
    
    if (documento.length < 6) {
        mostrarMensaje('Número de documento inválido.', 'error');
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        mostrarMensaje('Correo electrónico inválido.', 'error');
        return false;
    }
    
    return true;
}

function obtenerDatosFormulario() {
    const fechaHora = obtenerFechaHoraColombia();
    
    return {
        id: generarIdUnico(),
        nombres: document.getElementById('nombres').value.trim(),
        documento: document.getElementById('documento').value.trim(),
        correo: document.getElementById('correo').value.trim(),
        cargo: document.getElementById('cargo').value.trim(),
        area: document.getElementById('area').value,
        firma: signaturePad.toDataURL('image/png'), // Guardar firma como imagen base64
        fecha: fechaHora.fecha,
        hora: fechaHora.hora,
        timestamp: fechaHora.timestamp,
        fechaHoraCompleta: fechaHora.fechaCompleta.toISOString()
    };
}

function generarIdUnico() {
    return 'REG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function limpiarFormulario() {
    document.getElementById('registroForm').reset();
    signaturePad.clear();
}

function mostrarMensaje(texto, tipo) {
    const mensajeDiv = document.getElementById('mensaje');
    mensajeDiv.textContent = texto;
    mensajeDiv.className = `mensaje ${tipo}`;
    mensajeDiv.style.display = 'block';
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        mensajeDiv.style.display = 'none';
    }, 5000);
}

// ================== ALMACENAMIENTO LOCAL ==================

function guardarRegistro(datos) {
    registros.push(datos);
    localStorage.setItem('registros_firmas_app', JSON.stringify(registros));
}

function cargarRegistrosDesdeLocalStorage() {
    const datosGuardados = localStorage.getItem('registros_firmas_app');
    if (datosGuardados) {
        registros = JSON.parse(datosGuardados);
    }
}

function actualizarContadorRegistros() {
    document.getElementById('totalRegistros').textContent = `Total registros: ${registros.length}`;
}

// ================== EXPORTACIÓN EXCEL ==================

function exportarAExcel() {
    if (registros.length === 0) {
        mostrarMensaje('No hay registros para exportar.', 'error');
        return;
    }
    
    try {
        // Preparar datos para Excel
        const datosExcel = registros.map((registro, index) => ({
            '#': index + 1,
            'NOMBRES Y APELLIDOS': registro.nombres,
            'DOCUMENTO': registro.documento,
            'CORREO': registro.correo,
            'CARGO': registro.cargo,
            'ÁREA': registro.area,
            'FECHA': registro.fecha,
            'HORA': registro.hora,
            'ID REGISTRO': registro.id
        }));
        
        // Crear workbook y worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(datosExcel);
        
        // Ajustar ancho de columnas
        const colWidths = [
            { wch: 5 },  // #
            { wch: 30 }, // Nombres
            { wch: 15 }, // Documento
            { wch: 25 }, // Correo
            { wch: 20 }, // Cargo
            { wch: 20 }, // Área
            { wch: 12 }, // Fecha
            { wch: 12 }, // Hora
            { wch: 25 }  // ID
        ];
        ws['!cols'] = colWidths;
        
        // Agregar worksheet al workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Registros');
        
        // Generar nombre de archivo con fecha
        const fechaArchivo = obtenerFechaHoraColombia().fecha.replace(/\//g, '-');
        const nombreArchivo = `registros_firmas_${fechaArchivo}.xlsx`;
        
        // Descargar archivo
        XLSX.writeFile(wb, nombreArchivo);
        
        mostrarMensaje(`¡Excel descargado con ${registros.length} registros!`, 'exito');
        
    } catch (error) {
        console.error('Error al exportar:', error);
        mostrarMensaje('Error al generar el archivo Excel. Revise la consola.', 'error');
    }
}