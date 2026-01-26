// estaciones.js - Base de datos completa de estaciones de subte

const todasLasEstaciones = [
    // LÍNEA A (18 estaciones)
    { id: 'A-01', nombre: 'Plaza de Mayo', linea: 'A', lat: -34.6083, lon: -58.3712, orden: 1 },
    { id: 'A-02', nombre: 'Perú', linea: 'A', lat: -34.6085, lon: -58.3725, orden: 2 },
    { id: 'A-03', nombre: 'Piedras', linea: 'A', lat: -34.6090, lon: -58.3740, orden: 3 },
    { id: 'A-04', nombre: 'Lima', linea: 'A', lat: -34.6095, lon: -58.3755, orden: 4 },
    { id: 'A-05', nombre: 'Sáenz Peña', linea: 'A', lat: -34.6100, lon: -58.3770, orden: 5 },
    { id: 'A-06', nombre: 'Congreso', linea: 'A', lat: -34.6105, lon: -58.3785, orden: 6 },
    
    // LÍNEA B (17 estaciones) - Plaza Once es B-06
    { id: 'B-01', nombre: 'Leandro N. Alem', linea: 'B', lat: -34.6020, lon: -58.3705, orden: 1 },
    { id: 'B-02', nombre: 'Florida', linea: 'B', lat: -34.6035, lon: -58.3720, orden: 2 },
    { id: 'B-03', nombre: 'Carlos Pellegrini', linea: 'B', lat: -34.6040, lon: -58.3740, orden: 3 },
    { id: 'B-04', nombre: 'Uruguay', linea: 'B', lat: -34.6045, lon: -58.3755, orden: 4 },
    { id: 'B-05', nombre: 'Callao', linea: 'B', lat: -34.6050, lon: -58.3770, orden: 5 },
    { id: 'B-06', nombre: 'Pueyrredón (Plaza Once)', linea: 'B', lat: -34.6060, lon: -58.4030, orden: 6 },
    { id: 'B-07', nombre: 'Carlos Gardel', linea: 'B', lat: -34.6070, lon: -58.4080, orden: 7 },
    
    // LÍNEA C (9 estaciones)
    { id: 'C-01', nombre: 'Retiro', linea: 'C', lat: -34.5915, lon: -58.3755, orden: 1 },
    { id: 'C-02', nombre: 'General San Martín', linea: 'C', lat: -34.5950, lon: -58.3760, orden: 2 },
    { id: 'C-09', nombre: 'Constitución', linea: 'C', lat: -34.6270, lon: -58.3805, orden: 9 },
    
    // LÍNEA D (16 estaciones)
    { id: 'D-01', nombre: 'Catedral', linea: 'D', lat: -34.6077, lon: -58.3731, orden: 1 },
    { id: 'D-02', nombre: '9 de Julio', linea: 'D', lat: -34.6035, lon: -58.3820, orden: 2 },
    { id: 'D-16', nombre: 'Congreso de Tucumán', linea: 'D', lat: -34.5520, lon: -58.4530, orden: 16 },
    
    // LÍNEA E (18 estaciones)
    { id: 'E-01', nombre: 'Retiro', linea: 'E', lat: -34.5915, lon: -58.3755, orden: 1 },
    { id: 'E-18', nombre: 'Plaza de los Virreyes', linea: 'E', lat: -34.6600, lon: -58.4430, orden: 18 },
    
    // LÍNEA H (17 estaciones)
    { id: 'H-01', nombre: 'Facultad de Derecho', linea: 'H', lat: -34.5820, lon: -58.3920, orden: 1 },
    { id: 'H-06', nombre: 'Once', linea: 'H', lat: -34.6080, lon: -58.4150, orden: 6 },
    { id: 'H-17', nombre: 'Talleres', linea: 'H', lat: -34.6650, lon: -58.4350, orden: 17 }
];

// Función para generar datos de estado inicial
function generarDatosEstadoInicial() {
    return todasLasEstaciones.map(estacion => {
        // Estado aleatorio pero realista
        const esLineaPrincipal = ['A', 'B', 'D'].includes(estacion.linea);
        const probabilidadOnline = esLineaPrincipal ? 0.92 : 0.85;
        const estaOnline = Math.random() < probabilidadOnline;
        
        const bateria = estaOnline ? Math.floor(30 + Math.random() * 70) : 0;
        
        // Determinar estado
        let estado;
        if (!estaOnline) {
            estado = 'offline';
        } else if (bateria > 70) {
            estado = 'normal';
        } else if (bateria > 40) {
            estado = 'alerta';
        } else {
            estado = 'critico';
        }
        
        return {
            // Datos básicos
            ...estacion,
            
            // Estado de conexión
            conexion: {
                estado: estaOnline ? 'conectado' : 'desconectado',
                wifi: {
                    ssid: `SUBTE_${estacion.linea}_${estacion.orden}`,
                    señal: estaOnline ? Math.floor(60 + Math.random() * 40) : 0,
                    ip: estaOnline ? `192.168.1.${100 + estacion.orden}` : null
                }
            },
            
            // Estado del dispositivo
            dispositivo: {
                bateria: bateria,
                estado: estado,
                temperatura: 25 + Math.random() * 15
            },
            
            // Estado de iluminación
            iluminacion: {
                modo: 'auto',
                encendida: false, // Se calcula por horario
                fiesta: { activo: false }
            }
        };
    });
}

// ========== SISTEMA DE FIESTAS ==========

const modosFiesta = {
    NORMAL: 'normal',
    NAVIDAD: 'navidad',
    INDEPENDENCIA: 'independencia',
    PERSONALIZADO: 'personalizado',
    EMERGENCIA: 'emergencia'
};

const coloresFiesta = {
    navidad: ['#FF0000', '#00FF00'], // Rojo y verde
    independencia: ['#75AADB', '#FFFFFF'], // Celeste y blanco
    personalizado: ['#FF0000', '#00FF00', '#0000FF'],
    emergencia: ['#FF0000', '#FFFF00'] // Rojo y amarillo
};

function activarModoFiestaGlobal(modo, frecuencia = 1, duracionMinutos = 60) {
    const efecto = {
        modo: modo,
        frecuencia: frecuencia,
        activo: true,
        inicio: new Date().toISOString(),
        fin: new Date(Date.now() + duracionMinutos * 60000).toISOString(),
        colores: coloresFiesta[modo] || coloresFiesta.navidad
    };
    
    localStorage.setItem('subte-fiesta-activa', JSON.stringify(efecto));
    return efecto;
}

function desactivarModoFiesta() {
    localStorage.removeItem('subte-fiesta-activa');
    return { activo: false, modo: 'normal' };
}

function obtenerModoFiestaActivo() {
    const fiestaGuardada = localStorage.getItem('subte-fiesta-activa');
    if (!fiestaGuardada) return null;
    
    const efecto = JSON.parse(fiestaGuardada);
    const ahora = new Date();
    const fin = new Date(efecto.fin);
    
    if (ahora > fin) {
        desactivarModoFiesta();
        return null;
    }
    
    return efecto;
}

// Exportar para uso global
window.databaseSubte = {
    todasEstaciones: todasLasEstaciones,
    generarDatosEstadoInicial: generarDatosEstadoInicial,
    totalEstaciones: todasLasEstaciones.length,
    
    // Funciones de fiesta
    sistemaFiesta: {
        modosFiesta: modosFiesta,
        coloresFiesta: coloresFiesta,
        activarModoFiestaGlobal: activarModoFiestaGlobal,
        desactivarModoFiesta: desactivarModoFiesta,
        obtenerModoFiestaActivo: obtenerModoFiestaActivo
    }
};
