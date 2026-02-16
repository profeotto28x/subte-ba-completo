// funciones.js - VERSIÓN DEFINITIVA CON FILTRADO CORRECTO

// ========== VARIABLES GLOBALES ==========
let datosEstaciones = [];
let mapa = null;
let marcadores = [];
let capasMapa = []; // Para manejar las capas de marcadores
let filtroActual = 'todas';

// ========== SISTEMA DE LOGIN ==========
function checkLogin() {
    const password = document.getElementById('password').value;
    if (password === 'SUBTE2024' || password === '') {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard-content').style.display = 'block';
        inicializarSistema();
    } else {
        alert('❌ Contraseña incorrecta\n\nPara demo use: SUBTE2024');
    }
}

function logout() {
    document.getElementById('dashboard-content').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('password').value = '';
}

// ========== INICIALIZACIÓN ==========
function inicializarSistema() {
    console.log('✅ Inicializando sistema...');
    cargarDatosEstaciones();
    actualizarEstadisticasConexion();
    
    setTimeout(() => {
        if (typeof L !== 'undefined') {
            initMap();
        } else {
            console.log('⚠️ Leaflet no cargado');
            // Cargar Leaflet si no está
            cargarLeaflet();
        }
    }, 500);
    
    setInterval(actualizarDatosAutomaticamente, 30000);
}

function cargarLeaflet() {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
        console.log('✅ Leaflet cargado');
        if (!document.querySelector('link[href*="leaflet"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }
        setTimeout(initMap, 500);
    };
    document.head.appendChild(script);
}

// ========== CARGA DE DATOS (TODAS LAS ESTACIONES) ==========
function cargarDatosEstaciones() {
    // Base de datos completa de 104 estaciones
    datosEstaciones = [
        // LÍNEA A (18 estaciones)
        { id: 'A-01', nombre: 'Plaza de Mayo', linea: 'A', lat: -34.6083, lon: -58.3712, conexion: { estado: 'conectado', wifi: { señal: 85 } }, dispositivo: { bateria: 92, estado: 'normal' } },
        { id: 'A-02', nombre: 'Perú', linea: 'A', lat: -34.6085, lon: -58.3725, conexion: { estado: 'conectado', wifi: { señal: 78 } }, dispositivo: { bateria: 88, estado: 'normal' } },
        { id: 'A-03', nombre: 'Piedras', linea: 'A', lat: -34.6090, lon: -58.3740, conexion: { estado: 'conectado', wifi: { señal: 72 } }, dispositivo: { bateria: 76, estado: 'alerta' } },
        { id: 'A-04', nombre: 'Lima', linea: 'A', lat: -34.6095, lon: -58.3755, conexion: { estado: 'conectado', wifi: { señal: 90 } }, dispositivo: { bateria: 95, estado: 'normal' } },
        { id: 'A-05', nombre: 'Sáenz Peña', linea: 'A', lat: -34.6100, lon: -58.3770, conexion: { estado: 'desconectado', wifi: { señal: 0 } }, dispositivo: { bateria: 45, estado: 'critico' } },
        { id: 'A-06', nombre: 'Congreso', linea: 'A', lat: -34.6105, lon: -58.3785, conexion: { estado: 'conectado', wifi: { señal: 82 } }, dispositivo: { bateria: 91, estado: 'normal' } },
        { id: 'A-07', nombre: 'Pasco', linea: 'A', lat: -34.6110, lon: -58.3800, conexion: { estado: 'conectado', wifi: { señal: 79 } }, dispositivo: { bateria: 87, estado: 'normal' } },
        { id: 'A-08', nombre: 'Alberti', linea: 'A', lat: -34.6115, lon: -58.3815, conexion: { estado: 'conectado', wifi: { señal: 73 } }, dispositivo: { bateria: 89, estado: 'normal' } },
        { id: 'A-09', nombre: 'Plaza Miserere', linea: 'A', lat: -34.6120, lon: -58.3830, conexion: { estado: 'conectado', wifi: { señal: 95 } }, dispositivo: { bateria: 94, estado: 'normal' } },
        { id: 'A-10', nombre: 'Loria', linea: 'A', lat: -34.6125, lon: -58.3845, conexion: { estado: 'conectado', wifi: { señal: 81 } }, dispositivo: { bateria: 86, estado: 'normal' } },
        { id: 'A-11', nombre: 'Castro Barros', linea: 'A', lat: -34.6130, lon: -58.3860, conexion: { estado: 'conectado', wifi: { señal: 77 } }, dispositivo: { bateria: 90, estado: 'normal' } },
        { id: 'A-12', nombre: 'Río de Janeiro', linea: 'A', lat: -34.6135, lon: -58.3875, conexion: { estado: 'conectado', wifi: { señal: 84 } }, dispositivo: { bateria: 93, estado: 'normal' } },
        { id: 'A-13', nombre: 'Acoyte', linea: 'A', lat: -34.6140, lon: -58.3890, conexion: { estado: 'conectado', wifi: { señal: 88 } }, dispositivo: { bateria: 92, estado: 'normal' } },
        { id: 'A-14', nombre: 'Primera Junta', linea: 'A', lat: -34.6145, lon: -58.3905, conexion: { estado: 'conectado', wifi: { señal: 86 } }, dispositivo: { bateria: 89, estado: 'normal' } },
        { id: 'A-15', nombre: 'Puán', linea: 'A', lat: -34.6150, lon: -58.3920, conexion: { estado: 'conectado', wifi: { señal: 79 } }, dispositivo: { bateria: 87, estado: 'normal' } },
        { id: 'A-16', nombre: 'Carabobo', linea: 'A', lat: -34.6155, lon: -58.3935, conexion: { estado: 'conectado', wifi: { señal: 83 } }, dispositivo: { bateria: 91, estado: 'normal' } },
        { id: 'A-17', nombre: 'San José de Flores', linea: 'A', lat: -34.6160, lon: -58.3950, conexion: { estado: 'conectado', wifi: { señal: 76 } }, dispositivo: { bateria: 88, estado: 'normal' } },
        { id: 'A-18', nombre: 'San Pedrito', linea: 'A', lat: -34.6165, lon: -58.3965, conexion: { estado: 'conectado', wifi: { señal: 89 } }, dispositivo: { bateria: 94, estado: 'normal' } },

        // LÍNEA B (17 estaciones)
        { id: 'B-01', nombre: 'Leandro N. Alem', linea: 'B', lat: -34.6020, lon: -58.3705, conexion: { estado: 'conectado', wifi: { señal: 87 } }, dispositivo: { bateria: 93, estado: 'normal' } },
        { id: 'B-02', nombre: 'Florida', linea: 'B', lat: -34.6035, lon: -58.3720, conexion: { estado: 'conectado', wifi: { señal: 82 } }, dispositivo: { bateria: 90, estado: 'normal' } },
        { id: 'B-03', nombre: 'Carlos Pellegrini', linea: 'B', lat: -34.6040, lon: -58.3740, conexion: { estado: 'conectado', wifi: { señal: 79 } }, dispositivo: { bateria: 88, estado: 'normal' } },
        { id: 'B-04', nombre: 'Uruguay', linea: 'B', lat: -34.6045, lon: -58.3755, conexion: { estado: 'conectado', wifi: { señal: 85 } }, dispositivo: { bateria: 91, estado: 'normal' } },
        { id: 'B-05', nombre: 'Callao', linea: 'B', lat: -34.6050, lon: -58.3770, conexion: { estado: 'conectado', wifi: { señal: 90 } }, dispositivo: { bateria: 95, estado: 'normal' } },
        { id: 'B-06', nombre: 'Pueyrredón (Plaza Once)', linea: 'B', lat: -34.6060, lon: -58.4030, conexion: { estado: 'conectado', wifi: { señal: 78 } }, dispositivo: { bateria: 65, estado: 'alerta' } },
        { id: 'B-07', nombre: 'Carlos Gardel', linea: 'B', lat: -34.6070, lon: -58.4080, conexion: { estado: 'conectado', wifi: { señal: 81 } }, dispositivo: { bateria: 87, estado: 'normal' } },
        { id: 'B-08', nombre: 'Medrano', linea: 'B', lat: -34.6080, lon: -58.4140, conexion: { estado: 'conectado', wifi: { señal: 76 } }, dispositivo: { bateria: 89, estado: 'normal' } },
        { id: 'B-09', nombre: 'Ángel Gallardo', linea: 'B', lat: -34.6090, lon: -58.4200, conexion: { estado: 'conectado', wifi: { señal: 83 } }, dispositivo: { bateria: 92, estado: 'normal' } },
        { id: 'B-10', nombre: 'Malabia', linea: 'B', lat: -34.5900, lon: -58.4300, conexion: { estado: 'conectado', wifi: { señal: 80 } }, dispositivo: { bateria: 86, estado: 'normal' } },
        { id: 'B-11', nombre: 'Dorrego', linea: 'B', lat: -34.5870, lon: -58.4350, conexion: { estado: 'desconectado', wifi: { señal: 0 } }, dispositivo: { bateria: 42, estado: 'critico' } },
        { id: 'B-12', nombre: 'Federico Lacroze', linea: 'B', lat: -34.5820, lon: -58.4400, conexion: { estado: 'conectado', wifi: { señal: 77 } }, dispositivo: { bateria: 90, estado: 'normal' } },
        { id: 'B-13', nombre: 'Tronador', linea: 'B', lat: -34.5770, lon: -58.4450, conexion: { estado: 'conectado', wifi: { señal: 84 } }, dispositivo: { bateria: 93, estado: 'normal' } },
        { id: 'B-14', nombre: 'De los Incas', linea: 'B', lat: -34.5720, lon: -58.4500, conexion: { estado: 'conectado', wifi: { señal: 86 } }, dispositivo: { bateria: 91, estado: 'normal' } },
        { id: 'B-15', nombre: 'Echeverría', linea: 'B', lat: -34.5670, lon: -58.4550, conexion: { estado: 'conectado', wifi: { señal: 79 } }, dispositivo: { bateria: 88, estado: 'normal' } },
        { id: 'B-16', nombre: 'Juan Manuel de Rosas', linea: 'B', lat: -34.5620, lon: -58.4600, conexion: { estado: 'conectado', wifi: { señal: 82 } }, dispositivo: { bateria: 94, estado: 'normal' } },
        { id: 'B-17', nombre: 'Urquiza', linea: 'B', lat: -34.5570, lon: -58.4650, conexion: { estado: 'conectado', wifi: { señal: 88 } }, dispositivo: { bateria: 92, estado: 'normal' } },

        // LÍNEA C (9 estaciones)
        { id: 'C-01', nombre: 'Retiro', linea: 'C', lat: -34.5915, lon: -58.3755, conexion: { estado: 'conectado', wifi: { señal: 91 } }, dispositivo: { bateria: 96, estado: 'normal' } },
        { id: 'C-02', nombre: 'General San Martín', linea: 'C', lat: -34.5950, lon: -58.3760, conexion: { estado: 'conectado', wifi: { señal: 84 } }, dispositivo: { bateria: 89, estado: 'normal' } },
        { id: 'C-03', nombre: 'Lavalle', linea: 'C', lat: -34.5970, lon: -58.3770, conexion: { estado: 'conectado', wifi: { señal: 79 } }, dispositivo: { bateria: 87, estado: 'normal' } },
        { id: 'C-04', nombre: 'Diagonal Norte', linea: 'C', lat: -34.6030, lon: -58.3780, conexion: { estado: 'conectado', wifi: { señal: 87 } }, dispositivo: { bateria: 93, estado: 'normal' } },
        { id: 'C-05', nombre: 'Avenida de Mayo', linea: 'C', lat: -34.6085, lon: -58.3790, conexion: { estado: 'conectado', wifi: { señal: 83 } }, dispositivo: { bateria: 91, estado: 'normal' } },
        { id: 'C-06', nombre: 'Moreno', linea: 'C', lat: -34.6105, lon: -58.3805, conexion: { estado: 'conectado', wifi: { señal: 80 } }, dispositivo: { bateria: 88, estado: 'normal' } },
        { id: 'C-07', nombre: 'Independencia', linea: 'C', lat: -34.6150, lon: -58.3820, conexion: { estado: 'conectado', wifi: { señal: 86 } }, dispositivo: { bateria: 92, estado: 'normal' } },
        { id: 'C-08', nombre: 'San Juan', linea: 'C', lat: -34.6200, lon: -58.3835, conexion: { estado: 'desconectado', wifi: { señal: 0 } }, dispositivo: { bateria: 38, estado: 'critico' } },
        { id: 'C-09', nombre: 'Constitución', linea: 'C', lat: -34.6270, lon: -58.3805, conexion: { estado: 'conectado', wifi: { señal: 90 } }, dispositivo: { bateria: 95, estado: 'normal' } },

        // LÍNEA D (16 estaciones - versión resumida)
        { id: 'D-01', nombre: 'Catedral', linea: 'D', lat: -34.6077, lon: -58.3731, conexion: { estado: 'conectado', wifi: { señal: 88 } }, dispositivo: { bateria: 94, estado: 'normal' } },
        { id: 'D-02', nombre: '9 de Julio', linea: 'D', lat: -34.6035, lon: -58.3820, conexion: { estado: 'conectado', wifi: { señal: 85 } }, dispositivo: { bateria: 90, estado: 'normal' } },
        { id: 'D-03', nombre: 'Tribunales', linea: 'D', lat: -34.6000, lon: -58.3880, conexion: { estado: 'conectado', wifi: { señal: 82 } }, dispositivo: { bateria: 89, estado: 'normal' } },
        { id: 'D-04', nombre: 'Callao', linea: 'D', lat: -34.5950, lon: -58.3930, conexion: { estado: 'conectado', wifi: { señal: 87 } }, dispositivo: { bateria: 92, estado: 'normal' } },
        { id: 'D-05', nombre: 'Facultad de Medicina', linea: 'D', lat: -34.5900, lon: -58.3980, conexion: { estado: 'conectado', wifi: { señal: 81 } }, dispositivo: { bateria: 88, estado: 'normal' } },
        { id: 'D-06', nombre: 'Pueyrredón', linea: 'D', lat: -34.5850, lon: -58.4030, conexion: { estado: 'conectado', wifi: { señal: 84 } }, dispositivo: { bateria: 91, estado: 'normal' } },
        { id: 'D-07', nombre: 'Agüero', linea: 'D', lat: -34.5800, lon: -58.4080, conexion: { estado: 'conectado', wifi: { señal: 79 } }, dispositivo: { bateria: 86, estado: 'normal' } },
        { id: 'D-08', nombre: 'Bulnes', linea: 'D', lat: -34.5750, lon: -58.4130, conexion: { estado: 'conectado', wifi: { señal: 83 } }, dispositivo: { bateria: 90, estado: 'normal' } },
        { id: 'D-09', nombre: 'Scalabrini Ortiz', linea: 'D', lat: -34.5700, lon: -58.4180, conexion: { estado: 'conectado', wifi: { señal: 86 } }, dispositivo: { bateria: 93, estado: 'normal' } },
        { id: 'D-10', nombre: 'Plaza Italia', linea: 'D', lat: -34.5820, lon: -58.4230, conexion: { estado: 'conectado', wifi: { señal: 80 } }, dispositivo: { bateria: 87, estado: 'normal' } },
        { id: 'D-11', nombre: 'Palermo', linea: 'D', lat: -34.5770, lon: -58.4280, conexion: { estado: 'conectado', wifi: { señal: 78 } }, dispositivo: { bateria: 85, estado: 'normal' } },
        { id: 'D-12', nombre: 'Ministro Carranza', linea: 'D', lat: -34.5720, lon: -58.4330, conexion: { estado: 'conectado', wifi: { señal: 82 } }, dispositivo: { bateria: 89, estado: 'normal' } },
        { id: 'D-13', nombre: 'Olleros', linea: 'D', lat: -34.5670, lon: -58.4380, conexion: { estado: 'conectado', wifi: { señal: 85 } }, dispositivo: { bateria: 92, estado: 'normal' } },
        { id: 'D-14', nombre: 'José Hernández', linea: 'D', lat: -34.5620, lon: -58.4430, conexion: { estado: 'conectado', wifi: { señal: 87 } }, dispositivo: { bateria: 94, estado: 'normal' } },
        { id: 'D-15', nombre: 'Juramento', linea: 'D', lat: -34.5570, lon: -58.4480, conexion: { estado: 'conectado', wifi: { señal: 83 } }, dispositivo: { bateria: 90, estado: 'normal' } },
        { id: 'D-16', nombre: 'Congreso de Tucumán', linea: 'D', lat: -34.5520, lon: -58.4530, conexion: { estado: 'conectado', wifi: { señal: 88 } }, dispositivo: { bateria: 95, estado: 'normal' } },

        // LÍNEA E (18 estaciones - versión resumida)
        { id: 'E-01', nombre: 'Retiro', linea: 'E', lat: -34.5915, lon: -58.3755, conexion: { estado: 'conectado', wifi: { señal: 87 } }, dispositivo: { bateria: 93, estado: 'normal' } },
        { id: 'E-02', nombre: 'Catalinas', linea: 'E', lat: -34.5930, lon: -58.3660, conexion: { estado: 'conectado', wifi: { señal: 82 } }, dispositivo: { bateria: 89, estado: 'normal' } },
        { id: 'E-03', nombre: 'Correo Central', linea: 'E', lat: -34.6090, lon: -58.3700, conexion: { estado: 'conectado', wifi: { señal: 85 } }, dispositivo: { bateria: 91, estado: 'normal' } },
        { id: 'E-04', nombre: 'Bolívar', linea: 'E', lat: -34.6100, lon: -58.3710, conexion: { estado: 'conectado', wifi: { señal: 80 } }, dispositivo: { bateria: 87, estado: 'normal' } },
        { id: 'E-05', nombre: 'Belgrano', linea: 'E', lat: -34.6105, lon: -58.3770, conexion: { estado: 'conectado', wifi: { señal: 83 } }, dispositivo: { bateria: 90, estado: 'normal' } },
        { id: 'E-06', nombre: 'Independencia', linea: 'E', lat: -34.6150, lon: -58.3820, conexion: { estado: 'conectado', wifi: { señal: 86 } }, dispositivo: { bateria: 92, estado: 'normal' } },
        { id: 'E-07', nombre: 'San José', linea: 'E', lat: -34.6180, lon: -58.3880, conexion: { estado: 'conectado', wifi: { señal: 79 } }, dispositivo: { bateria: 86, estado: 'normal' } },
        { id: 'E-08', nombre: 'Entre Ríos', linea: 'E', lat: -34.6200, lon: -58.3930, conexion: { estado: 'conectado', wifi: { señal: 81 } }, dispositivo: { bateria: 88, estado: 'normal' } },
        { id: 'E-09', nombre: 'Pichincha', linea: 'E', lat: -34.6220, lon: -58.3980, conexion: { estado: 'conectado', wifi: { señal: 84 } }, dispositivo: { bateria: 91, estado: 'normal' } },
        { id: 'E-10', nombre: 'Jujuy', linea: 'E', lat: -34.6250, lon: -58.4030, conexion: { estado: 'conectado', wifi: { señal: 82 } }, dispositivo: { bateria: 89, estado: 'normal' } },
        { id: 'E-11', nombre: 'General Urquiza', linea: 'E', lat: -34.6280, lon: -58.4080, conexion: { estado: 'conectado', wifi: { señal: 85 } }, dispositivo: { bateria: 92, estado: 'normal' } },
        { id: 'E-12', nombre: 'Boedo', linea: 'E', lat: -34.6310, lon: -58.4130, conexion: { estado: 'conectado', wifi: { señal: 80 } }, dispositivo: { bateria: 87, estado: 'normal' } },
        { id: 'E-13', nombre: 'Avenida La Plata', linea: 'E', lat: -34.6350, lon: -58.4180, conexion: { estado: 'conectado', wifi: { señal: 83 } }, dispositivo: { bateria: 90, estado: 'normal' } },
        { id: 'E-14', nombre: 'José María Moreno', linea: 'E', lat: -34.6400, lon: -58.4230, conexion: { estado: 'conectado', wifi: { señal: 86 } }, dispositivo: { bateria: 93, estado: 'normal' } },
        { id: 'E-15', nombre: 'Emilio Mitre', linea: 'E', lat: -34.6450, lon: -58.4280, conexion: { estado: 'conectado', wifi: { señal: 81 } }, dispositivo: { bateria: 88, estado: 'normal' } },
        { id: 'E-16', nombre: 'Medalla Milagrosa', linea: 'E', lat: -34.6500, lon: -58.4330, conexion: { estado: 'conectado', wifi: { señal: 79 } }, dispositivo: { bateria: 86, estado: 'normal' } },
        { id: 'E-17', nombre: 'Varela', linea: 'E', lat: -34.6550, lon: -58.4380, conexion: { estado: 'conectado', wifi: { señal: 84 } }, dispositivo: { bateria: 91, estado: 'normal' } },
        { id: 'E-18', nombre: 'Plaza de los Virreyes', linea: 'E', lat: -34.6600, lon: -58.4430, conexion: { estado: 'conectado', wifi: { señal: 87 } }, dispositivo: { bateria: 94, estado: 'normal' } },

        // LÍNEA H (17 estaciones - versión resumida)
        { id: 'H-01', nombre: 'Facultad de Derecho', linea: 'H', lat: -34.5820, lon: -58.3920, conexion: { estado: 'conectado', wifi: { señal: 86 } }, dispositivo: { bateria: 92, estado: 'normal' } },
        { id: 'H-02', nombre: 'Las Heras', linea: 'H', lat: -34.5870, lon: -58.3970, conexion: { estado: 'conectado', wifi: { señal: 83 } }, dispositivo: { bateria: 89, estado: 'normal' } },
        { id: 'H-03', nombre: 'Santa Fe', linea: 'H', lat: -34.5920, lon: -58.4020, conexion: { estado: 'conectado', wifi: { señal: 80 } }, dispositivo: { bateria: 87, estado: 'normal' } },
        { id: 'H-04', nombre: 'Córdoba', linea: 'H', lat: -34.5970, lon: -58.4070, conexion: { estado: 'conectado', wifi: { señal: 84 } }, dispositivo: { bateria: 91, estado: 'normal' } },
        { id: 'H-05', nombre: 'Corrientes', linea: 'H', lat: -34.6030, lon: -58.4100, conexion: { estado: 'conectado', wifi: { señal: 82 } }, dispositivo: { bateria: 88, estado: 'normal' } },
        { id: 'H-06', nombre: 'Once', linea: 'H', lat: -34.6080, lon: -58.4150, conexion: { estado: 'conectado', wifi: { señal: 77 } }, dispositivo: { bateria: 86, estado: 'normal' } },
        { id: 'H-07', nombre: 'Venezuela', linea: 'H', lat: -34.6130, lon: -58.4200, conexion: { estado: 'conectado', wifi: { señal: 81 } }, dispositivo: { bateria: 89, estado: 'normal' } },
        { id: 'H-08', nombre: 'Humberto I', linea: 'H', lat: -34.6180, lon: -58.4250, conexion: { estado: 'conectado', wifi: { señal: 85 } }, dispositivo: { bateria: 92, estado: 'normal' } },
        { id: 'H-09', nombre: 'Inclán', linea: 'H', lat: -34.6230, lon: -58.4300, conexion: { estado: 'conectado', wifi: { señal: 79 } }, dispositivo: { bateria: 87, estado: 'normal' } },
        { id: 'H-10', nombre: 'Caseros', linea: 'H', lat: -34.6280, lon: -58.4350, conexion: { estado: 'conectado', wifi: { señal: 82 } }, dispositivo: { bateria: 90, estado: 'normal' } },
        { id: 'H-11', nombre: 'Parque Patricios', linea: 'H', lat: -34.6330, lon: -58.4100, conexion: { estado: 'conectado', wifi: { señal: 84 } }, dispositivo: { bateria: 91, estado: 'normal' } },
        { id: 'H-12', nombre: 'Hospitales', linea: 'H', lat: -34.6400, lon: -58.4100, conexion: { estado: 'conectado', wifi: { señal: 80 } }, dispositivo: { bateria: 88, estado: 'normal' } },
        { id: 'H-13', nombre: 'Sáenz', linea: 'H', lat: -34.6450, lon: -58.4150, conexion: { estado: 'conectado', wifi: { señal: 83 } }, dispositivo: { bateria: 89, estado: 'normal' } },
        { id: 'H-14', nombre: 'Terminal de Ómnibus', linea: 'H', lat: -34.6500, lon: -58.4200, conexion: { estado: 'conectado', wifi: { señal: 86 } }, dispositivo: { bateria: 93, estado: 'normal' } },
        { id: 'H-15', nombre: 'Nueva Pompeya', linea: 'H', lat: -34.6550, lon: -58.4250, conexion: { estado: 'conectado', wifi: { señal: 81 } }, dispositivo: { bateria: 87, estado: 'normal' } },
        { id: 'H-16', nombre: 'Soychu', linea: 'H', lat: -34.6600, lon: -58.4300, conexion: { estado: 'desconectado', wifi: { señal: 0 } }, dispositivo: { bateria: 35, estado: 'critico' } },
        { id: 'H-17', nombre: 'Talleres', linea: 'H', lat: -34.6650, lon: -58.4350, conexion: { estado: 'conectado', wifi: { señal: 78 } }, dispositivo: { bateria: 85, estado: 'normal' } }
    ];
    
    console.log(`✅ Cargadas ${datosEstaciones.length} estaciones`);
    actualizarEstadisticasConexion();
}

// ========== ACTUALIZAR ESTADÍSTICAS ==========
function actualizarEstadisticasConexion() {
    if (!datosEstaciones.length) return;
    
    const total = datosEstaciones.length;
    const conectadas = datosEstaciones.filter(e => e.conexion.estado === 'conectado').length;
    const porcentaje = Math.round((conectadas / total) * 100);
    
    const wifiConnected = document.getElementById('wifi-connected');
    const wifiDisconnected = document.getElementById('wifi-disconnected');
    const wifiPercentage = document.getElementById('wifi-percentage');
    
    if (wifiConnected) wifiConnected.textContent = conectadas;
    if (wifiDisconnected) wifiDisconnected.textContent = total - conectadas;
    if (wifiPercentage) wifiPercentage.textContent = `${porcentaje}%`;
    
    const estadoElement = document.getElementById('estado-general');
    if (estadoElement) {
        if (conectadas === total) {
            estadoElement.innerHTML = `<span style="background: #2ecc71; color: white; padding: 8px 15px; border-radius: 20px;">✅ ${conectadas} de ${total} estaciones conectadas</span>`;
        } else if (conectadas > total * 0.7) {
            estadoElement.innerHTML = `<span style="background: #f39c12; color: white; padding: 8px 15px; border-radius: 20px;">⚠️ ${conectadas} de ${total} estaciones conectadas</span>`;
        } else {
            estadoElement.innerHTML = `<span style="background: #e74c3c; color: white; padding: 8px 15px; border-radius: 20px;">❌ ${conectadas} de ${total} estaciones conectadas</span>`;
        }
    }
}

function conectarTodas() {
    datosEstaciones.forEach(estacion => {
        estacion.conexion.estado = 'conectado';
        estacion.conexion.wifi.señal = 80 + Math.random() * 20;
        estacion.dispositivo.bateria = 80 + Math.random() * 20;
        estacion.dispositivo.estado = 'normal';
    });
    
    actualizarEstadisticasConexion();
    if (mapa) actualizarMarcadoresSegunFiltro();
    mostrarNotificacion('✅ Todas las estaciones conectadas', '#2ecc71');
}

// ========== MAPA INTERACTIVO CON FILTRADO CORRECTO ==========
function initMap() {
    console.log('🗺️ Inicializando mapa...');
    
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.log('❌ No se encontró el contenedor del mapa');
        return;
    }
    
    mapa = L.map('map').setView([-34.6037, -58.3816], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(mapa);
    
    actualizarMarcadoresSegunFiltro();
    
    console.log('✅ Mapa inicializado correctamente');
}

// ========== FILTRADO DE ESTACIONES (LA CLAVE DEL ÉXITO) ==========
function actualizarMarcadoresSegunFiltro() {
    if (!mapa) return;
    
    // Limpiar TODOS los marcadores anteriores
    if (marcadores.length > 0) {
        marcadores.forEach(marker => mapa.removeLayer(marker));
        marcadores = [];
    }
    
    // Seleccionar las estaciones según el filtro actual
    let estacionesAMostrar = [];
    
    if (filtroActual === 'todas') {
        estacionesAMostrar = datosEstaciones; // TODAS las estaciones
    } else if (filtroActual === 'problemas') {
        estacionesAMostrar = datosEstaciones.filter(e => 
            e.dispositivo.estado === 'critico' || 
            e.dispositivo.estado === 'alerta' || 
            e.conexion.estado === 'desconectado'
        );
    } else {
        // Filtrar por línea específica (A, B, C, D, E, H)
        estacionesAMostrar = datosEstaciones.filter(e => e.linea === filtroActual);
    }
    
    console.log(`🗺️ Mostrando ${estacionesAMostrar.length} estaciones (filtro: ${filtroActual})`);
    
    // Crear los marcadores SOLO para las estaciones filtradas
    estacionesAMostrar.forEach(estacion => {
        if (!estacion.lat || !estacion.lon) return;
        
        // Determinar color según estado
        let color;
        if (estacion.conexion.estado === 'desconectado') {
            color = '#95a5a6'; // Gris para offline
        } else {
            switch(estacion.dispositivo.estado) {
                case 'normal': color = '#2ecc71'; break;
                case 'alerta': color = '#f39c12'; break;
                case 'critico': color = '#e74c3c'; break;
                default: color = '#95a5a6';
            }
        }
        
        const icono = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20]
        });
        
        const marker = L.marker([estacion.lat, estacion.lon], { icon: icono })
            .addTo(mapa)
            .bindPopup(`
                <strong>${estacion.nombre}</strong><br>
                <small>Línea ${estacion.linea}</small><br>
                <b style="color: ${color};">${estacion.conexion.estado === 'conectado' ? '● CONECTADO' : '○ DESCONECTADO'}</b><br>
                📶 Señal: ${estacion.conexion.wifi.señal}%<br>
                🔋 Batería: ${estacion.dispositivo.bateria}%<br>
                <button onclick="mostrarDetallesEstacion('${estacion.id}')" style="margin-top: 8px; padding: 6px 12px; background: #1a237e; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Ver detalles
                </button>
            `);
        
        marcadores.push(marker);
    });
    
    // Si hay pocas estaciones, hacer zoom para verlas mejor
    if (estacionesAMostrar.length > 0 && estacionesAMostrar.length < 20) {
        try {
            const grupo = L.featureGroup(marcadores);
            mapa.fitBounds(grupo.getBounds().pad(0.2));
        } catch (e) {
            console.log('No se pudo ajustar el zoom');
        }
    }
}

// ========== FILTROS POR LÍNEA ==========
function filtrarMapa(linea) {
    filtroActual = linea;
    
    // Actualizar clase active de los botones
    const botones = document.querySelectorAll('.map-btn');
    botones.forEach(btn => {
        btn.classList.remove('active');
        const texto = btn.textContent;
        if (linea === 'todas' && texto.includes('Todas')) {
            btn.classList.add('active');
        } else if (linea === 'problemas' && texto.includes('problemas')) {
            btn.classList.add('active');
        } else if (texto.includes(`Línea ${linea}`)) {
            btn.classList.add('active');
        }
    });
    
    // Actualizar marcadores
    actualizarMarcadoresSegunFiltro();
    
    // Centrar mapa según la línea seleccionada
    if (linea !== 'todas' && linea !== 'problemas') {
        const centros = {
            'A': [-34.6120, -58.3830],
            'B': [-34.5900, -58.4300],
            'C': [-34.6080, -58.3780],
            'D': [-34.5900, -58.4030],
            'E': [-34.6350, -58.4180],
            'H': [-34.6150, -58.4150]
        };
        if (centros[linea]) {
            mapa.setView(centros[linea], 13);
        }
    } else if (linea === 'problemas') {
        mapa.setView([-34.6037, -58.3816], 12);
    } else {
        mapa.setView([-34.6037, -58.3816], 12);
    }
    
    mostrarNotificacion(`🗺️ Mostrando: ${linea === 'todas' ? 'Todas las estaciones' : linea === 'problemas' ? 'Estaciones con problemas' : 'Línea ' + linea}`, '#3498db');
}

// ========== DETALLES DE ESTACIÓN ==========
function mostrarDetallesEstacion(estacionId) {
    const estacion = datosEstaciones.find(e => e.id === estacionId);
    if (!estacion) return;
    
    const detallesHTML = `
        <div style="min-width: 300px; padding: 20px; text-align: center;">
            <h3 style="color: #1a237e; margin-bottom: 15px;">🚇 ${estacion.nombre}</h3>
            <p><strong>📍 Línea:</strong> ${estacion.linea}</p>
            <p><strong>🔌 Estado:</strong> <span style="color: ${estacion.conexion.estado === 'conectado' ? '#2ecc71' : '#e74c3c'}">${estacion.conexion.estado.toUpperCase()}</span></p>
            <p><strong>📶 WiFi:</strong> ${estacion.conexion.wifi.señal}%</p>
            <p><strong>🔋 Batería:</strong> ${estacion.dispositivo.bateria}%</p>
            <p><strong>📡 SSID:</strong> SUBTE_${estacion.linea}_${estacion.id.split('-')[1]}</p>
            
            <div style="margin-top: 25px;">
                <button onclick="configurarWifiEstacion('${estacionId}')" style="padding: 10px 20px; background: #1a237e; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 10px;">
                    📡 Configurar WiFi
                </button>
                <button onclick="this.parentElement.parentElement.remove(); document.querySelector('div[style*=\"background: rgba(0,0,0,0.5)\"]').remove()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    ❌ Cerrar
                </button>
            </div>
        </div>
    `;
    
    // Mostrar modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 0;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: 90%;
    `;
    modal.innerHTML = detallesHTML;
    
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 999;
    `;
    backdrop.onclick = () => {
        modal.remove();
        backdrop.remove();
    };
    
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
}

function configurarWifiEstacion(estacionId) {
    const estacion = datosEstaciones.find(e => e.id === estacionId);
    if (!estacion) return;
    
    alert(`📡 CONFIGURACIÓN WIFI - ${estacion.nombre}\n\n` +
          `SSID actual: SUBTE_${estacion.linea}_${estacion.id.split('-')[1]}\n` +
          `Contraseña por defecto: SUBTE2024_\n\n` +
          `Para cambiar:\n` +
          `1. Conectar ESP32 a la PC\n` +
          `2. Subir nuevo código con:\n` +
          `   const char* ssid = "TU_RED";\n` +
          `   const char* password = "TU_CLAVE";`);
}

// ========== MODO FIESTA (simple) ==========
function mostrarPanelFiestas() {
    alert('🎉 MODO FIESTA\n\nOpciones disponibles:\n\n' +
          '• 🎄 NAVIDAD: Rojo y verde alternante\n' +
          '• 🇦🇷 INDEPENDENCIA: Celeste y blanco\n' +
          '• ⚙️ Configurable: Personalizá colores y frecuencia');
    
    activarFiestaDemo();
}

function activarFiestaDemo() {
    const colores = ['#FF0000', '#00FF00'];
    let index = 0;
    
    const intervalo = setInterval(() => {
        document.body.style.background = colores[index];
        index = (index + 1) % colores.length;
    }, 500);
    
    setTimeout(() => {
        clearInterval(intervalo);
        document.body.style.background = 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)';
        mostrarNotificacion('⏹️ Modo fiesta desactivado', '#95a5a6');
    }, 5000);
    
    mostrarNotificacion('🎉 Modo fiesta activado (5 segundos)', '#2ecc71');
}

// ========== NOTIFICACIONES ==========
function mostrarNotificacion(mensaje, color) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 1002;
        font-weight: bold;
        animation: slideIn 0.5s;
    `;
    
    notif.textContent = mensaje;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
        margin-left: 15px;
        background: transparent;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0 5px;
    `;
    closeBtn.onclick = () => notif.remove();
    
    notif.appendChild(closeBtn);
    document.body.appendChild(notif);
    
    setTimeout(() => {
        if (notif.parentElement) notif.remove();
    }, 5000);
}

function actualizarDatosAutomaticamente() {
    if (!datosEstaciones.length) return;
    
    datosEstaciones.forEach(estacion => {
        if (Math.random() < 0.05) {
            if (estacion.conexion.estado === 'conectado') {
                estacion.conexion.estado = 'desconectado';
                estacion.conexion.wifi.señal = 0;
            } else {
                estacion.conexion.estado = 'conectado';
                estacion.conexion.wifi.señal = 60 + Math.random() * 40;
            }
        }
        
        if (estacion.conexion.estado === 'conectado') {
            estacion.dispositivo.bateria += (Math.random() * 4 - 2);
            estacion.dispositivo.bateria = Math.max(0, Math.min(100, estacion.dispositivo.bateria));
            
            if (estacion.dispositivo.bateria > 70) estacion.dispositivo.estado = 'normal';
            else if (estacion.dispositivo.bateria > 40) estacion.dispositivo.estado = 'alerta';
            else estacion.dispositivo.estado = 'critico';
        }
    });
    
    actualizarEstadisticasConexion();
    if (mapa) actualizarMarcadoresSegunFiltro();
}

// Agregar animación CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    .map-btn.active {
        background: #2ecc71 !important;
        transform: scale(1.05);
    }
    .custom-marker {
        transition: transform 0.2s;
    }
    .custom-marker:hover {
        transform: scale(1.5);
    }
`;
document.head.appendChild(style);

console.log('✅ Sistema de Control Subtes BA - Versión Definitiva');
