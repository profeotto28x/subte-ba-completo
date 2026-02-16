// ========== VARIABLES GLOBALES ==========
let datosEstaciones = [];
let mapa = null;
let marcadores = [];
let filtroActual = 'todas';

// ========== LOGIN ==========
function checkLogin() {
    const pass = document.getElementById('password').value;
    if (pass === 'SUBTE2024' || pass === '') {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard-content').style.display = 'block';
        iniciarSistema();
    } else {
        alert('Contraseña incorrecta. Usá SUBTE2024');
    }
}

function logout() {
    document.getElementById('dashboard-content').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
}

// ========== INICIALIZACIÓN ==========
function iniciarSistema() {
    console.log('✅ Sistema iniciado');
    cargarDatosCompletos(); // Cambié el nombre para que sea claro
    actualizarEstadisticas();
    setTimeout(initMap, 600);
    setInterval(actualizarDatosSimulados, 30000);
}

// ========== CARGA DE DATOS COMPLETOS (TODAS LAS ESTACIONES) ==========
function cargarDatosCompletos() {
    datosEstaciones = [
        // ==================== LÍNEA A (18 estaciones) ====================
        { id: 'A-01', nombre: 'Plaza de Mayo', linea: 'A', lat: -34.6083, lon: -58.3712, estadoLuces: false, bateria: 87, paneles: 82, regulador: 'OK', wifi: { ssid: 'SUBTE_A_01', señal: 92 } },
        { id: 'A-02', nombre: 'Perú', linea: 'A', lat: -34.6085, lon: -58.3725, estadoLuces: true, bateria: 72, paneles: 65, regulador: 'OK', wifi: { ssid: 'SUBTE_A_02', señal: 84 } },
        { id: 'A-03', nombre: 'Piedras', linea: 'A', lat: -34.6090, lon: -58.3740, estadoLuces: false, bateria: 45, paneles: 30, regulador: '⚠️ Revisar', wifi: { ssid: 'SUBTE_A_03', señal: 0 } },
        { id: 'A-04', nombre: 'Lima', linea: 'A', lat: -34.6095, lon: -58.3755, estadoLuces: true, bateria: 95, paneles: 90, regulador: 'OK', wifi: { ssid: 'SUBTE_A_04', señal: 88 } },
        { id: 'A-05', nombre: 'Sáenz Peña', linea: 'A', lat: -34.6100, lon: -58.3770, estadoLuces: false, bateria: 33, paneles: 12, regulador: 'FALLA', wifi: { ssid: 'SUBTE_A_05', señal: 0 } },
        { id: 'A-06', nombre: 'Congreso', linea: 'A', lat: -34.6105, lon: -58.3785, estadoLuces: true, bateria: 89, paneles: 85, regulador: 'OK', wifi: { ssid: 'SUBTE_A_06', señal: 90 } },
        { id: 'A-07', nombre: 'Pasco', linea: 'A', lat: -34.6110, lon: -58.3800, estadoLuces: true, bateria: 91, paneles: 87, regulador: 'OK', wifi: { ssid: 'SUBTE_A_07', señal: 86 } },
        { id: 'A-08', nombre: 'Alberti', linea: 'A', lat: -34.6115, lon: -58.3815, estadoLuces: false, bateria: 77, paneles: 72, regulador: 'OK', wifi: { ssid: 'SUBTE_A_08', señal: 79 } },
        { id: 'A-09', nombre: 'Plaza Miserere', linea: 'A', lat: -34.6120, lon: -58.3830, estadoLuces: true, bateria: 82, paneles: 78, regulador: 'OK', wifi: { ssid: 'SUBTE_A_09', señal: 83 } },
        { id: 'A-10', nombre: 'Loria', linea: 'A', lat: -34.6125, lon: -58.3845, estadoLuces: true, bateria: 86, paneles: 81, regulador: 'OK', wifi: { ssid: 'SUBTE_A_10', señal: 81 } },
        { id: 'A-11', nombre: 'Castro Barros', linea: 'A', lat: -34.6130, lon: -58.3860, estadoLuces: true, bateria: 88, paneles: 83, regulador: 'OK', wifi: { ssid: 'SUBTE_A_11', señal: 84 } },
        { id: 'A-12', nombre: 'Río de Janeiro', linea: 'A', lat: -34.6135, lon: -58.3875, estadoLuces: false, bateria: 79, paneles: 74, regulador: 'OK', wifi: { ssid: 'SUBTE_A_12', señal: 76 } },
        { id: 'A-13', nombre: 'Acoyte', linea: 'A', lat: -34.6140, lon: -58.3890, estadoLuces: true, bateria: 84, paneles: 79, regulador: 'OK', wifi: { ssid: 'SUBTE_A_13', señal: 82 } },
        { id: 'A-14', nombre: 'Primera Junta', linea: 'A', lat: -34.6145, lon: -58.3905, estadoLuces: true, bateria: 90, paneles: 86, regulador: 'OK', wifi: { ssid: 'SUBTE_A_14', señal: 88 } },
        { id: 'A-15', nombre: 'Puán', linea: 'A', lat: -34.6150, lon: -58.3920, estadoLuces: false, bateria: 76, paneles: 71, regulador: 'OK', wifi: { ssid: 'SUBTE_A_15', señal: 73 } },
        { id: 'A-16', nombre: 'Carabobo', linea: 'A', lat: -34.6155, lon: -58.3935, estadoLuces: true, bateria: 83, paneles: 78, regulador: 'OK', wifi: { ssid: 'SUBTE_A_16', señal: 80 } },
        { id: 'A-17', nombre: 'San José de Flores', linea: 'A', lat: -34.6160, lon: -58.3950, estadoLuces: true, bateria: 85, paneles: 80, regulador: 'OK', wifi: { ssid: 'SUBTE_A_17', señal: 82 } },
        { id: 'A-18', nombre: 'San Pedrito', linea: 'A', lat: -34.6165, lon: -58.3965, estadoLuces: false, bateria: 81, paneles: 76, regulador: 'OK', wifi: { ssid: 'SUBTE_A_18', señal: 77 } },

        // ==================== LÍNEA B (17 estaciones) ====================
        { id: 'B-01', nombre: 'Leandro N. Alem', linea: 'B', lat: -34.6020, lon: -58.3705, estadoLuces: false, bateria: 93, paneles: 88, regulador: 'OK', wifi: { ssid: 'SUBTE_B_01', señal: 90 } },
        { id: 'B-02', nombre: 'Florida', linea: 'B', lat: -34.6035, lon: -58.3720, estadoLuces: true, bateria: 78, paneles: 72, regulador: 'OK', wifi: { ssid: 'SUBTE_B_02', señal: 80 } },
        { id: 'B-03', nombre: 'Carlos Pellegrini', linea: 'B', lat: -34.6040, lon: -58.3740, estadoLuces: true, bateria: 88, paneles: 85, regulador: 'OK', wifi: { ssid: 'SUBTE_B_03', señal: 86 } },
        { id: 'B-04', nombre: 'Uruguay', linea: 'B', lat: -34.6045, lon: -58.3755, estadoLuces: false, bateria: 79, paneles: 74, regulador: 'OK', wifi: { ssid: 'SUBTE_B_04', señal: 77 } },
        { id: 'B-05', nombre: 'Callao', linea: 'B', lat: -34.6050, lon: -58.3770, estadoLuces: true, bateria: 96, paneles: 92, regulador: 'OK', wifi: { ssid: 'SUBTE_B_05', señal: 94 } },
        { id: 'B-06', nombre: 'Pueyrredón (Plaza Once)', linea: 'B', lat: -34.6060, lon: -58.4030, estadoLuces: true, bateria: 68, paneles: 59, regulador: '⚠️ Bajo', wifi: { ssid: 'SUBTE_B_06', señal: 71 } },
        { id: 'B-07', nombre: 'Carlos Gardel', linea: 'B', lat: -34.6070, lon: -58.4080, estadoLuces: false, bateria: 82, paneles: 77, regulador: 'OK', wifi: { ssid: 'SUBTE_B_07', señal: 79 } },
        { id: 'B-08', nombre: 'Medrano', linea: 'B', lat: -34.6080, lon: -58.4140, estadoLuces: true, bateria: 89, paneles: 84, regulador: 'OK', wifi: { ssid: 'SUBTE_B_08', señal: 85 } },
        { id: 'B-09', nombre: 'Ángel Gallardo', linea: 'B', lat: -34.6090, lon: -58.4200, estadoLuces: true, bateria: 92, paneles: 87, regulador: 'OK', wifi: { ssid: 'SUBTE_B_09', señal: 88 } },
        { id: 'B-10', nombre: 'Malabia', linea: 'B', lat: -34.5900, lon: -58.4300, estadoLuces: false, bateria: 86, paneles: 81, regulador: 'OK', wifi: { ssid: 'SUBTE_B_10', señal: 83 } },
        { id: 'B-11', nombre: 'Dorrego', linea: 'B', lat: -34.5870, lon: -58.4350, estadoLuces: true, bateria: 42, paneles: 35, regulador: 'FALLA', wifi: { ssid: 'SUBTE_B_11', señal: 0 } },
        { id: 'B-12', nombre: 'Federico Lacroze', linea: 'B', lat: -34.5820, lon: -58.4400, estadoLuces: true, bateria: 90, paneles: 85, regulador: 'OK', wifi: { ssid: 'SUBTE_B_12', señal: 87 } },
        { id: 'B-13', nombre: 'Tronador', linea: 'B', lat: -34.5770, lon: -58.4450, estadoLuces: false, bateria: 93, paneles: 88, regulador: 'OK', wifi: { ssid: 'SUBTE_B_13', señal: 89 } },
        { id: 'B-14', nombre: 'De los Incas', linea: 'B', lat: -34.5720, lon: -58.4500, estadoLuces: true, bateria: 91, paneles: 86, regulador: 'OK', wifi: { ssid: 'SUBTE_B_14', señal: 86 } },
        { id: 'B-15', nombre: 'Echeverría', linea: 'B', lat: -34.5670, lon: -58.4550, estadoLuces: true, bateria: 88, paneles: 83, regulador: 'OK', wifi: { ssid: 'SUBTE_B_15', señal: 84 } },
        { id: 'B-16', nombre: 'Juan Manuel de Rosas', linea: 'B', lat: -34.5620, lon: -58.4600, estadoLuces: false, bateria: 94, paneles: 89, regulador: 'OK', wifi: { ssid: 'SUBTE_B_16', señal: 91 } },
        { id: 'B-17', nombre: 'Urquiza', linea: 'B', lat: -34.5570, lon: -58.4650, estadoLuces: true, bateria: 92, paneles: 87, regulador: 'OK', wifi: { ssid: 'SUBTE_B_17', señal: 88 } },

        // ==================== LÍNEA C (9 estaciones) ====================
        { id: 'C-01', nombre: 'Retiro', linea: 'C', lat: -34.5915, lon: -58.3755, estadoLuces: true, bateria: 97, paneles: 94, regulador: 'OK', wifi: { ssid: 'SUBTE_C_01', señal: 95 } },
        { id: 'C-02', nombre: 'General San Martín', linea: 'C', lat: -34.5950, lon: -58.3760, estadoLuces: true, bateria: 85, paneles: 81, regulador: 'OK', wifi: { ssid: 'SUBTE_C_02', señal: 82 } },
        { id: 'C-03', nombre: 'Lavalle', linea: 'C', lat: -34.5970, lon: -58.3770, estadoLuces: false, bateria: 74, paneles: 66, regulador: 'OK', wifi: { ssid: 'SUBTE_C_03', señal: 68 } },
        { id: 'C-04', nombre: 'Diagonal Norte', linea: 'C', lat: -34.6030, lon: -58.3780, estadoLuces: true, bateria: 88, paneles: 83, regulador: 'OK', wifi: { ssid: 'SUBTE_C_04', señal: 86 } },
        { id: 'C-05', nombre: 'Avenida de Mayo', linea: 'C', lat: -34.6085, lon: -58.3790, estadoLuces: true, bateria: 90, paneles: 86, regulador: 'OK', wifi: { ssid: 'SUBTE_C_05', señal: 88 } },
        { id: 'C-06', nombre: 'Moreno', linea: 'C', lat: -34.6105, lon: -58.3805, estadoLuces: false, bateria: 69, paneles: 61, regulador: '⚠️ Revisar', wifi: { ssid: 'SUBTE_C_06', señal: 0 } },
        { id: 'C-07', nombre: 'Independencia', linea: 'C', lat: -34.6150, lon: -58.3820, estadoLuces: true, bateria: 86, paneles: 82, regulador: 'OK', wifi: { ssid: 'SUBTE_C_07', señal: 80 } },
        { id: 'C-08', nombre: 'San Juan', linea: 'C', lat: -34.6200, lon: -58.3835, estadoLuces: false, bateria: 29, paneles: 9, regulador: 'FALLA', wifi: { ssid: 'SUBTE_C_08', señal: 0 } },
        { id: 'C-09', nombre: 'Constitución', linea: 'C', lat: -34.6270, lon: -58.3805, estadoLuces: true, bateria: 95, paneles: 91, regulador: 'OK', wifi: { ssid: 'SUBTE_C_09', señal: 93 } },

        // ==================== LÍNEA D (16 estaciones) ====================
        { id: 'D-01', nombre: 'Catedral', linea: 'D', lat: -34.6077, lon: -58.3731, estadoLuces: true, bateria: 94, paneles: 90, regulador: 'OK', wifi: { ssid: 'SUBTE_D_01', señal: 92 } },
        { id: 'D-02', nombre: '9 de Julio', linea: 'D', lat: -34.6035, lon: -58.3820, estadoLuces: true, bateria: 86, paneles: 82, regulador: 'OK', wifi: { ssid: 'SUBTE_D_02', señal: 84 } },
        { id: 'D-03', nombre: 'Tribunales', linea: 'D', lat: -34.6000, lon: -58.3880, estadoLuces: false, bateria: 79, paneles: 74, regulador: 'OK', wifi: { ssid: 'SUBTE_D_03', señal: 76 } },
        { id: 'D-04', nombre: 'Callao', linea: 'D', lat: -34.5950, lon: -58.3930, estadoLuces: true, bateria: 91, paneles: 87, regulador: 'OK', wifi: { ssid: 'SUBTE_D_04', señal: 88 } },
        { id: 'D-05', nombre: 'Facultad de Medicina', linea: 'D', lat: -34.5900, lon: -58.3980, estadoLuces: true, bateria: 82, paneles: 77, regulador: 'OK', wifi: { ssid: 'SUBTE_D_05', señal: 80 } },
        { id: 'D-06', nombre: 'Pueyrredón', linea: 'D', lat: -34.5850, lon: -58.4030, estadoLuces: false, bateria: 77, paneles: 72, regulador: 'OK', wifi: { ssid: 'SUBTE_D_06', señal: 75 } },
        { id: 'D-07', nombre: 'Agüero', linea: 'D', lat: -34.5800, lon: -58.4080, estadoLuces: true, bateria: 83, paneles: 78, regulador: 'OK', wifi: { ssid: 'SUBTE_D_07', señal: 81 } },
        { id: 'D-08', nombre: 'Bulnes', linea: 'D', lat: -34.5750, lon: -58.4130, estadoLuces: true, bateria: 87, paneles: 82, regulador: 'OK', wifi: { ssid: 'SUBTE_D_08', señal: 84 } },
        { id: 'D-09', nombre: 'Scalabrini Ortiz', linea: 'D', lat: -34.5700, lon: -58.4180, estadoLuces: false, bateria: 84, paneles: 79, regulador: 'OK', wifi: { ssid: 'SUBTE_D_09', señal: 82 } },
        { id: 'D-10', nombre: 'Plaza Italia', linea: 'D', lat: -34.5820, lon: -58.4230, estadoLuces: true, bateria: 89, paneles: 84, regulador: 'OK', wifi: { ssid: 'SUBTE_D_10', señal: 86 } },
        { id: 'D-11', nombre: 'Palermo', linea: 'D', lat: -34.5770, lon: -58.4280, estadoLuces: true, bateria: 86, paneles: 81, regulador: 'OK', wifi: { ssid: 'SUBTE_D_11', señal: 83 } },
        { id: 'D-12', nombre: 'Ministro Carranza', linea: 'D', lat: -34.5720, lon: -58.4330, estadoLuces: false, bateria: 92, paneles: 87, regulador: 'OK', wifi: { ssid: 'SUBTE_D_12', señal: 89 } },
        { id: 'D-13', nombre: 'Olleros', linea: 'D', lat: -34.5670, lon: -58.4380, estadoLuces: true, bateria: 85, paneles: 80, regulador: 'OK', wifi: { ssid: 'SUBTE_D_13', señal: 82 } },
        { id: 'D-14', nombre: 'José Hernández', linea: 'D', lat: -34.5620, lon: -58.4430, estadoLuces: true, bateria: 90, paneles: 85, regulador: 'OK', wifi: { ssid: 'SUBTE_D_14', señal: 87 } },
        { id: 'D-15', nombre: 'Juramento', linea: 'D', lat: -34.5570, lon: -58.4480, estadoLuces: false, bateria: 88, paneles: 83, regulador: 'OK', wifi: { ssid: 'SUBTE_D_15', señal: 85 } },
        { id: 'D-16', nombre: 'Congreso de Tucumán', linea: 'D', lat: -34.5520, lon: -58.4530, estadoLuces: true, bateria: 96, paneles: 92, regulador: 'OK', wifi: { ssid: 'SUBTE_D_16', señal: 94 } },

        // ==================== LÍNEA E (18 estaciones) ====================
        { id: 'E-01', nombre: 'Retiro', linea: 'E', lat: -34.5915, lon: -58.3755, estadoLuces: true, bateria: 93, paneles: 88, regulador: 'OK', wifi: { ssid: 'SUBTE_E_01', señal: 90 } },
        { id: 'E-02', nombre: 'Catalinas', linea: 'E', lat: -34.5930, lon: -58.3660, estadoLuces: false, bateria: 82, paneles: 77, regulador: 'OK', wifi: { ssid: 'SUBTE_E_02', señal: 80 } },
        { id: 'E-03', nombre: 'Correo Central', linea: 'E', lat: -34.6090, lon: -58.3700, estadoLuces: true, bateria: 85, paneles: 80, regulador: 'OK', wifi: { ssid: 'SUBTE_E_03', señal: 83 } },
        { id: 'E-04', nombre: 'Bolívar', linea: 'E', lat: -34.6100, lon: -58.3710, estadoLuces: true, bateria: 79, paneles: 74, regulador: 'OK', wifi: { ssid: 'SUBTE_E_04', señal: 77 } },
        { id: 'E-05', nombre: 'Belgrano', linea: 'E', lat: -34.6105, lon: -58.3770, estadoLuces: false, bateria: 84, paneles: 79, regulador: 'OK', wifi: { ssid: 'SUBTE_E_05', señal: 82 } },
        { id: 'E-06', nombre: 'Independencia', linea: 'E', lat: -34.6150, lon: -58.3820, estadoLuces: true, bateria: 91, paneles: 86, regulador: 'OK', wifi: { ssid: 'SUBTE_E_06', señal: 88 } },
        { id: 'E-07', nombre: 'San José', linea: 'E', lat: -34.6180, lon: -58.3880, estadoLuces: true, bateria: 76, paneles: 71, regulador: 'OK', wifi: { ssid: 'SUBTE_E_07', señal: 74 } },
        { id: 'E-08', nombre: 'Entre Ríos', linea: 'E', lat: -34.6200, lon: -58.3930, estadoLuces: false, bateria: 88, paneles: 83, regulador: 'OK', wifi: { ssid: 'SUBTE_E_08', señal: 85 } },
        { id: 'E-09', nombre: 'Pichincha', linea: 'E', lat: -34.6220, lon: -58.3980, estadoLuces: true, bateria: 81, paneles: 76, regulador: 'OK', wifi: { ssid: 'SUBTE_E_09', señal: 79 } },
        { id: 'E-10', nombre: 'Jujuy', linea: 'E', lat: -34.6250, lon: -58.4030, estadoLuces: true, bateria: 87, paneles: 82, regulador: 'OK', wifi: { ssid: 'SUBTE_E_10', señal: 84 } },
        { id: 'E-11', nombre: 'General Urquiza', linea: 'E', lat: -34.6280, lon: -58.4080, estadoLuces: false, bateria: 83, paneles: 78, regulador: 'OK', wifi: { ssid: 'SUBTE_E_11', señal: 81 } },
        { id: 'E-12', nombre: 'Boedo', linea: 'E', lat: -34.6310, lon: -58.4130, estadoLuces: true, bateria: 78, paneles: 73, regulador: 'OK', wifi: { ssid: 'SUBTE_E_12', señal: 76 } },
        { id: 'E-13', nombre: 'Avenida La Plata', linea: 'E', lat: -34.6350, lon: -58.4180, estadoLuces: true, bateria: 86, paneles: 81, regulador: 'OK', wifi: { ssid: 'SUBTE_E_13', señal: 83 } },
        { id: 'E-14', nombre: 'José María Moreno', linea: 'E', lat: -34.6400, lon: -58.4230, estadoLuces: false, bateria: 84, paneles: 79, regulador: 'OK', wifi: { ssid: 'SUBTE_E_14', señal: 82 } },
        { id: 'E-15', nombre: 'Emilio Mitre', linea: 'E', lat: -34.6450, lon: -58.4280, estadoLuces: true, bateria: 79, paneles: 74, regulador: 'OK', wifi: { ssid: 'SUBTE_E_15', señal: 77 } },
        { id: 'E-16', nombre: 'Medalla Milagrosa', linea: 'E', lat: -34.6500, lon: -58.4330, estadoLuces: true, bateria: 82, paneles: 77, regulador: 'OK', wifi: { ssid: 'SUBTE_E_16', señal: 80 } },
        { id: 'E-17', nombre: 'Varela', linea: 'E', lat: -34.6550, lon: -58.4380, estadoLuces: false, bateria: 85, paneles: 80, regulador: 'OK', wifi: { ssid: 'SUBTE_E_17', señal: 83 } },
        { id: 'E-18', nombre: 'Plaza de los Virreyes', linea: 'E', lat: -34.6600, lon: -58.4430, estadoLuces: true, bateria: 89, paneles: 84, regulador: 'OK', wifi: { ssid: 'SUBTE_E_18', señal: 86 } },

        // ==================== LÍNEA H (17 estaciones) ====================
        { id: 'H-01', nombre: 'Facultad de Derecho', linea: 'H', lat: -34.5820, lon: -58.3920, estadoLuces: true, bateria: 92, paneles: 87, regulador: 'OK', wifi: { ssid: 'SUBTE_H_01', señal: 89 } },
        { id: 'H-02', nombre: 'Las Heras', linea: 'H', lat: -34.5870, lon: -58.3970, estadoLuces: false, bateria: 85, paneles: 80, regulador: 'OK', wifi: { ssid: 'SUBTE_H_02', señal: 83 } },
        { id: 'H-03', nombre: 'Santa Fe', linea: 'H', lat: -34.5920, lon: -58.4020, estadoLuces: true, bateria: 78, paneles: 73, regulador: 'OK', wifi: { ssid: 'SUBTE_H_03', señal: 76 } },
        { id: 'H-04', nombre: 'Córdoba', linea: 'H', lat: -34.5970, lon: -58.4070, estadoLuces: true, bateria: 86, paneles: 81, regulador: 'OK', wifi: { ssid: 'SUBTE_H_04', señal: 84 } },
        { id: 'H-05', nombre: 'Corrientes', linea: 'H', lat: -34.6030, lon: -58.4100, estadoLuces: false, bateria: 89, paneles: 84, regulador: 'OK', wifi: { ssid: 'SUBTE_H_05', señal: 86 } },
        { id: 'H-06', nombre: 'Once', linea: 'H', lat: -34.6080, lon: -58.4150, estadoLuces: true, bateria: 73, paneles: 68, regulador: '⚠️ Revisar', wifi: { ssid: 'SUBTE_H_06', señal: 70 } },
        { id: 'H-07', nombre: 'Venezuela', linea: 'H', lat: -34.6130, lon: -58.4200, estadoLuces: true, bateria: 84, paneles: 79, regulador: 'OK', wifi: { ssid: 'SUBTE_H_07', señal: 82 } },
        { id: 'H-08', nombre: 'Humberto I', linea: 'H', lat: -34.6180, lon: -58.4250, estadoLuces: false, bateria: 81, paneles: 76, regulador: 'OK', wifi: { ssid: 'SUBTE_H_08', señal: 79 } },
        { id: 'H-09', nombre: 'Inclán', linea: 'H', lat: -34.6230, lon: -58.4300, estadoLuces: true, bateria: 77, paneles: 72, regulador: 'OK', wifi: { ssid: 'SUBTE_H_09', señal: 75 } },
        { id: 'H-10', nombre: 'Caseros', linea: 'H', lat: -34.6280, lon: -58.4350, estadoLuces: true, bateria: 83, paneles: 78, regulador: 'OK', wifi: { ssid: 'SUBTE_H_10', señal: 81 } },
        { id: 'H-11', nombre: 'Parque Patricios', linea: 'H', lat: -34.6330, lon: -58.4100, estadoLuces: false, bateria: 88, paneles: 83, regulador: 'OK', wifi: { ssid: 'SUBTE_H_11', señal: 85 } },
        { id: 'H-12', nombre: 'Hospitales', linea: 'H', lat: -34.6400, lon: -58.4100, estadoLuces: true, bateria: 82, paneles: 77, regulador: 'OK', wifi: { ssid: 'SUBTE_H_12', señal: 80 } },
        { id: 'H-13', nombre: 'Sáenz', linea: 'H', lat: -34.6450, lon: -58.4150, estadoLuces: true, bateria: 79, paneles: 74, regulador: 'OK', wifi: { ssid: 'SUBTE_H_13', señal: 77 } },
        { id: 'H-14', nombre: 'Terminal de Ómnibus', linea: 'H', lat: -34.6500, lon: -58.4200, estadoLuces: false, bateria: 87, paneles: 82, regulador: 'OK', wifi: { ssid: 'SUBTE_H_14', señal: 84 } },
        { id: 'H-15', nombre: 'Nueva Pompeya', linea: 'H', lat: -34.6550, lon: -58.4250, estadoLuces: true, bateria: 76, paneles: 71, regulador: 'OK', wifi: { ssid: 'SUBTE_H_15', señal: 74 } },
        { id: 'H-16', nombre: 'Soychu', linea: 'H', lat: -34.6600, lon: -58.4300, estadoLuces: false, bateria: 35, paneles: 15, regulador: 'FALLA', wifi: { ssid: 'SUBTE_H_16', señal: 0 } },
        { id: 'H-17', nombre: 'Talleres', linea: 'H', lat: -34.6650, lon: -58.4350, estadoLuces: true, bateria: 81, paneles: 76, regulador: 'OK', wifi: { ssid: 'SUBTE_H_17', señal: 79 } }
    ];
    
    console.log(`✅ Cargadas ${datosEstaciones.length} estaciones (${datosEstaciones.length} de 104)`);
}

// ========== MAPA ==========
function initMap() {
    if (!document.getElementById('map')) return;
    mapa = L.map('map').setView([-34.6037, -58.3816], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa);
    actualizarMarcadores();
}

function actualizarMarcadores() {
    if (!mapa) return;
    if (marcadores.length) marcadores.forEach(m => mapa.removeLayer(m));
    marcadores = [];

    const filtradas = filtrarEstaciones();
    console.log(`Mostrando ${filtradas.length} estaciones en el mapa`);
    
    filtradas.forEach(e => {
        // Determinar color del marcador (basado en conexión y batería)
        let color;
        if (e.wifi.señal === 0) {
            color = '#95a5a6'; // Gris para offline
        } else if (e.bateria > 70) {
            color = '#2ecc71'; // Verde para normal
        } else if (e.bateria > 40) {
            color = '#f39c12'; // Naranja para alerta
        } else {
            color = '#e74c3c'; // Rojo para crítico
        }

        let icono = L.divIcon({
            html: `<div style="background:${color}; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20]
        });
        
        let m = L.marker([e.lat, e.lon], { icon: icono }).addTo(mapa)
            .bindPopup(`
                <b>${e.nombre}</b><br>
                Línea ${e.linea}<br>
                🔋 ${e.bateria}% | ☀️ ${e.paneles}%<br>
                📶 ${e.wifi.señal > 0 ? e.wifi.señal + '%' : 'Desconectado'}<br>
                💡 ${e.estadoLuces ? 'ENCENDIDA' : 'APAGADA'}<br>
                <button onclick="verDetalles('${e.id}')" style="margin-top:5px; padding:5px 10px; background:#1a237e; color:white; border:none; border-radius:4px; cursor:pointer;">
                    ⚙️ VER DETALLES
                </button>
            `);
        marcadores.push(m);
    });
}

function filtrarEstaciones() {
    if (filtroActual === 'todas') return datosEstaciones;
    if (filtroActual === 'problemas') {
        return datosEstaciones.filter(e => 
            e.wifi.señal === 0 || 
            e.bateria < 40 || 
            e.regulador !== 'OK' ||
            e.paneles < 30
        );
    }
    return datosEstaciones.filter(e => e.linea === filtroActual);
}

function filtrarMapa(linea) {
    filtroActual = linea;
    document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    actualizarMarcadores();
}

// ========== ESTADÍSTICAS GLOBALES ==========
function actualizarEstadisticas() {
    let total = datosEstaciones.length;
    let conectadas = datosEstaciones.filter(e => e.wifi.señal > 0).length;
    let lucesEncendidas = datosEstaciones.filter(e => e.estadoLuces).length;
    
    document.getElementById('wifi-connected').innerText = conectadas;
    document.getElementById('wifi-disconnected').innerText = total - conectadas;
    document.getElementById('wifi-percentage').innerText = Math.round((conectadas / total) * 100) + '%';
    
    // Agregar info de luces al estado general
    document.getElementById('estado-general').innerHTML = `
        <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
            <span style="background:#2ecc71; color:white; padding:8px 15px; border-radius:20px;">
                ✅ ${conectadas} de ${total} conectadas
            </span>
            <span style="background:#f39c12; color:white; padding:8px 15px; border-radius:20px;">
                💡 ${lucesEncendidas} luces encendidas
            </span>
        </div>
    `;
}

// ========== CONTROL DE LUCES GLOBAL ==========
function encenderTodasLasLuces() {
    datosEstaciones.forEach(e => {
        if (e.wifi.señal > 0) { // Solo si están conectadas
            e.estadoLuces = true;
        }
    });
    actualizarMarcadores();
    actualizarEstadisticas();
    mostrarNotificacion('💡 Todas las luces encendidas (estaciones conectadas)', '#f39c12');
}

function apagarTodasLasLuces() {
    datosEstaciones.forEach(e => {
        if (e.wifi.señal > 0) {
            e.estadoLuces = false;
        }
    });
    actualizarMarcadores();
    actualizarEstadisticas();
    mostrarNotificacion('🌙 Todas las luces apagadas', '#95a5a6');
}

function conectarTodasLasEstaciones() {
    datosEstaciones.forEach(e => {
        e.wifi.señal = 85 + Math.floor(Math.random() * 10);
        e.bateria = 80 + Math.floor(Math.random() * 15);
        e.paneles = 75 + Math.floor(Math.random() * 15);
        e.regulador = 'OK';
    });
    actualizarEstadisticas();
    actualizarMarcadores();
    mostrarNotificacion('✅ Todas las estaciones conectadas', '#2ecc71');
}

// ========== 🚀 PANEL DE DETALLES COMPLETO ==========
function verDetalles(id) {
    const e = datosEstaciones.find(e => e.id === id);
    if (!e) return;

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.onclick = () => modal.remove();

    const contenido = document.createElement('div');
    contenido.className = 'modal-content';
    contenido.onclick = e => e.stopPropagation();
    contenido.innerHTML = `
        <h2 style="color:#1a237e; text-align:center;">⚙️ ${e.nombre}</h2>
        <p style="text-align:center; color:#666;">Línea ${e.linea} | ID: ${e.id}</p>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin:20px 0;">
            <div class="info-box">
                <span>🔋 Batería</span>
                <strong>${e.bateria}%</strong>
            </div>
            <div class="info-box">
                <span>☀️ Paneles</span>
                <strong>${e.paneles}%</strong>
            </div>
            <div class="info-box">
                <span>⚡ Regulador</span>
                <strong style="color:${e.regulador === 'OK' ? '#2ecc71' : '#e74c3c'}">${e.regulador}</strong>
            </div>
            <div class="info-box">
                <span>📶 WiFi</span>
                <strong>${e.wifi.señal > 0 ? e.wifi.señal + '%' : '❌ Desconectado'}</strong>
            </div>
        </div>

        <div style="background:#f0f8ff; padding:15px; border-radius:10px; margin-bottom:20px;">
            <p><strong>📡 SSID actual:</strong> ${e.wifi.ssid}</p>
        </div>

        <div style="background:#f8f9fa; padding:15px; border-radius:10px; margin-bottom:20px;">
            <h3 style="color:#1a237e;">💡 Control de luces</h3>
            <div style="display:flex; gap:10px; margin-top:10px;">
                <button class="btn-on" onclick="encenderLuz('${e.id}'); modal.remove();">🔆 ENCENDER</button>
                <button class="btn-off" onclick="apagarLuz('${e.id}'); modal.remove();">🌙 APAGAR</button>
            </div>
            <p style="margin-top:15px;">Estado actual: <strong id="luz-${e.id}" style="color:${e.estadoLuces ? '#f39c12' : '#95a5a6'}">${e.estadoLuces ? 'ENCENDIDA' : 'APAGADA'}</strong></p>
        </div>

        <div style="background:#f8f9fa; padding:15px; border-radius:10px;">
            <h3 style="color:#1a237e;">📡 Configuración WiFi manual</h3>
            <p style="color:#666; margin-bottom:10px;">Usar solo si la estación no se conecta automáticamente</p>
            <input type="text" id="ssid-${e.id}" placeholder="SSID" value="${e.wifi.ssid}" style="width:100%; padding:10px; margin-bottom:10px; border:2px solid #ddd; border-radius:6px;">
            <input type="password" id="pass-${e.id}" placeholder="Contraseña" style="width:100%; padding:10px; margin-bottom:10px; border:2px solid #ddd; border-radius:6px;">
            <button class="wifi-btn" onclick="configurarWifi('${e.id}'); modal.remove();">💾 GUARDAR Y CONECTAR</button>
        </div>

        <div style="text-align:center; margin-top:20px;">
            <button class="close-btn" onclick="modal.remove()">CERRAR</button>
        </div>
    `;

    modal.appendChild(contenido);
    document.body.appendChild(modal);

    // Agregar CSS dinámico (si no existe)
    if (!document.getElementById('modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.innerHTML = `
            .info-box { background:white; padding:15px; border-radius:10px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.05); }
            .info-box span { display:block; font-size:0.9rem; color:#5c6bc0; }
            .info-box strong { font-size:1.4rem; color:#1a237e; }
            .btn-on { flex:1; background:#2ecc71; color:white; padding:12px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; }
            .btn-off { flex:1; background:#e74c3c; color:white; padding:12px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; }
            .wifi-btn { width:100%; background:#3498db; color:white; padding:12px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; }
            .close-btn { background:#666; color:white; padding:10px 30px; border:none; border-radius:8px; cursor:pointer; }
            .modal-backdrop { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; justify-content:center; align-items:center; z-index:1000; }
            .modal-content { background:white; padding:30px; border-radius:20px; max-width:500px; width:90%; max-height:90vh; overflow-y:auto; }
        `;
        document.head.appendChild(style);
    }
}

// ========== CONTROL DE LUCES INDIVIDUAL ==========
function encenderLuz(id) {
    const e = datosEstaciones.find(e => e.id === id);
    if (e) {
        e.estadoLuces = true;
        mostrarNotificacion(`💡 Luces encendidas en ${e.nombre}`, '#f39c12');
        actualizarMarcadores();
        actualizarEstadisticas();
    }
}

function apagarLuz(id) {
    const e = datosEstaciones.find(e => e.id === id);
    if (e) {
        e.estadoLuces = false;
        mostrarNotificacion(`🌙 Luces apagadas en ${e.nombre}`, '#95a5a6');
        actualizarMarcadores();
        actualizarEstadisticas();
    }
}

// ========== CONFIGURACIÓN WIFI ==========
function configurarWifi(id) {
    const ssid = document.getElementById(`ssid-${id}`)?.value.trim();
    const pass = document.getElementById(`pass-${id}`)?.value.trim();
    const e = datosEstaciones.find(e => e.id === id);
    
    if (!ssid || !pass || !e) {
        mostrarNotificacion('❌ Completá SSID y contraseña', '#e74c3c');
        return;
    }
    
    e.wifi.ssid = ssid;
    e.wifi.señal = 85 + Math.floor(Math.random() * 10);
    mostrarNotificacion(`✅ ${e.nombre} conectada a "${ssid}"`, '#2ecc71');
    actualizarEstadisticas();
    actualizarMarcadores();
}

// ========== MODO FIESTA ==========
function mostrarPanelFiestas() {
    alert('🎉 MODO FIESTA activado por 5 segundos');
    let colores = ['#FF0000', '#00FF00'];
    let i = 0;
    let int = setInterval(() => {
        document.body.style.background = colores[i];
        i = (i + 1) % colores.length;
    }, 500);
    
    setTimeout(() => {
        clearInterval(int);
        document.body.style.background = 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)';
    }, 5000);
}

// ========== NOTIFICACIONES ==========
function mostrarNotificacion(msg, color) {
    let n = document.createElement('div');
    n.style.cssText = `position:fixed; top:20px; right:20px; background:${color}; color:white; padding:15px 25px; border-radius:10px; z-index:1002; font-weight:bold; box-shadow:0 5px 15px rgba(0,0,0,0.3); animation:slideIn 0.5s;`;
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 4000);
}

// ========== SIMULACIÓN ==========
function actualizarDatosSimulados() {
    datosEstaciones.forEach(e => {
        // Cambios aleatorios en WiFi
        if (Math.random() > 0.9) {
            e.wifi.señal = e.wifi.señal > 0 ? 0 : 80 + Math.floor(Math.random() * 15);
        }
        
        if (e.wifi.señal > 0) {
            e.bateria = Math.min(100, Math.max(0, e.bateria + (Math.random() * 4 - 2)));
            e.paneles = Math.min(100, Math.max(0, e.paneles + (Math.random() * 4 - 2)));
            e.regulador = e.bateria > 40 && e.paneles > 30 ? 'OK' : (e.bateria > 20 ? '⚠️ Revisar' : 'FALLA');
        }
    });
    actualizarEstadisticas();
    actualizarMarcadores();
}

// Agregar animación CSS si no existe
if (!document.getElementById('anim-styles')) {
    const style = document.createElement('style');
    style.id = 'anim-styles';
    style.innerHTML = `
        @keyframes slideIn {
            from { transform: translateX(100px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .map-btn.active {
            background: #2ecc71 !important;
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);
}
