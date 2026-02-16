// funciones.js - VERSIÓN FINAL CON FILTROS POR LÍNEA Y MAPA COMPLETO

// ========== VARIABLES GLOBALES ==========
let datosEstaciones = [];
let mapa = null;
let marcadores = [];
let modoFiestaActivo = null;
let intervaloFiesta = null;
let filtroActual = 'todas'; // Línea seleccionada actualmente

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
    if (intervaloFiesta) clearInterval(intervaloFiesta);
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
        }
    }, 1000);
    
    verificarModoFiestaActivo();
    setInterval(actualizarDatosAutomaticamente, 10000);
}

// ========== CARGA DE DATOS COMPLETOS (104 ESTACIONES) ==========
function cargarDatosEstaciones() {
    // Base de datos completa de 104 estaciones (versión resumida pero funcional)
    // En un entorno real, esto vendría de estaciones.js
    datosEstaciones = [
        // LÍNEA A (18 estaciones)
        { id: 'A-01', nombre: 'Plaza de Mayo', linea: 'A', lat: -34.6083, lon: -58.3712, conexion: { estado: 'conectado', wifi: { señal: 85, ssid: 'SUBTE_A_01', ip: '192.168.1.101' } }, dispositivo: { bateria: 92, estado: 'normal', temperatura: 25.3 } },
        { id: 'A-02', nombre: 'Perú', linea: 'A', lat: -34.6085, lon: -58.3725, conexion: { estado: 'conectado', wifi: { señal: 78, ssid: 'SUBTE_A_02', ip: '192.168.1.102' } }, dispositivo: { bateria: 88, estado: 'normal', temperatura: 25.1 } },
        { id: 'A-03', nombre: 'Piedras', linea: 'A', lat: -34.6090, lon: -58.3740, conexion: { estado: 'conectado', wifi: { señal: 72, ssid: 'SUBTE_A_03', ip: '192.168.1.103' } }, dispositivo: { bateria: 76, estado: 'alerta', temperatura: 26.0 } },
        { id: 'A-04', nombre: 'Lima', linea: 'A', lat: -34.6095, lon: -58.3755, conexion: { estado: 'conectado', wifi: { señal: 90, ssid: 'SUBTE_A_04', ip: '192.168.1.104' } }, dispositivo: { bateria: 95, estado: 'normal', temperatura: 24.8 } },
        { id: 'A-05', nombre: 'Sáenz Peña', linea: 'A', lat: -34.6100, lon: -58.3770, conexion: { estado: 'desconectado', wifi: { señal: 0, ssid: 'SUBTE_A_05', ip: null } }, dispositivo: { bateria: 45, estado: 'critico', temperatura: 28.5 } },
        { id: 'A-06', nombre: 'Congreso', linea: 'A', lat: -34.6105, lon: -58.3785, conexion: { estado: 'conectado', wifi: { señal: 82, ssid: 'SUBTE_A_06', ip: '192.168.1.106' } }, dispositivo: { bateria: 91, estado: 'normal', temperatura: 25.4 } },
        { id: 'A-07', nombre: 'Pasco', linea: 'A', lat: -34.6110, lon: -58.3800, conexion: { estado: 'conectado', wifi: { señal: 79, ssid: 'SUBTE_A_07', ip: '192.168.1.107' } }, dispositivo: { bateria: 87, estado: 'normal', temperatura: 25.2 } },
        { id: 'A-08', nombre: 'Alberti', linea: 'A', lat: -34.6115, lon: -58.3815, conexion: { estado: 'conectado', wifi: { señal: 73, ssid: 'SUBTE_A_08', ip: '192.168.1.108' } }, dispositivo: { bateria: 89, estado: 'normal', temperatura: 25.6 } },
        { id: 'A-09', nombre: 'Plaza Miserere', linea: 'A', lat: -34.6120, lon: -58.3830, conexion: { estado: 'conectado', wifi: { señal: 95, ssid: 'SUBTE_A_09', ip: '192.168.1.109' } }, dispositivo: { bateria: 94, estado: 'normal', temperatura: 24.9 } },
        { id: 'A-10', nombre: 'Loria', linea: 'A', lat: -34.6125, lon: -58.3845, conexion: { estado: 'conectado', wifi: { señal: 81, ssid: 'SUBTE_A_10', ip: '192.168.1.110' } }, dispositivo: { bateria: 86, estado: 'normal', temperatura: 25.0 } },
        { id: 'A-11', nombre: 'Castro Barros', linea: 'A', lat: -34.6130, lon: -58.3860, conexion: { estado: 'conectado', wifi: { señal: 77, ssid: 'SUBTE_A_11', ip: '192.168.1.111' } }, dispositivo: { bateria: 90, estado: 'normal', temperatura: 25.5 } },
        { id: 'A-12', nombre: 'Río de Janeiro', linea: 'A', lat: -34.6135, lon: -58.3875, conexion: { estado: 'conectado', wifi: { señal: 84, ssid: 'SUBTE_A_12', ip: '192.168.1.112' } }, dispositivo: { bateria: 93, estado: 'normal', temperatura: 25.7 } },
        { id: 'A-13', nombre: 'Acoyte', linea: 'A', lat: -34.6140, lon: -58.3890, conexion: { estado: 'conectado', wifi: { señal: 88, ssid: 'SUBTE_A_13', ip: '192.168.1.113' } }, dispositivo: { bateria: 92, estado: 'normal', temperatura: 25.3 } },
        { id: 'A-14', nombre: 'Primera Junta', linea: 'A', lat: -34.6145, lon: -58.3905, conexion: { estado: 'conectado', wifi: { señal: 86, ssid: 'SUBTE_A_14', ip: '192.168.1.114' } }, dispositivo: { bateria: 89, estado: 'normal', temperatura: 25.8 } },
        { id: 'A-15', nombre: 'Puán', linea: 'A', lat: -34.6150, lon: -58.3920, conexion: { estado: 'conectado', wifi: { señal: 79, ssid: 'SUBTE_A_15', ip: '192.168.1.115' } }, dispositivo: { bateria: 87, estado: 'normal', temperatura: 25.9 } },
        { id: 'A-16', nombre: 'Carabobo', linea: 'A', lat: -34.6155, lon: -58.3935, conexion: { estado: 'conectado', wifi: { señal: 83, ssid: 'SUBTE_A_16', ip: '192.168.1.116' } }, dispositivo: { bateria: 91, estado: 'normal', temperatura: 25.1 } },
        { id: 'A-17', nombre: 'San José de Flores', linea: 'A', lat: -34.6160, lon: -58.3950, conexion: { estado: 'conectado', wifi: { señal: 76, ssid: 'SUBTE_A_17', ip: '192.168.1.117' } }, dispositivo: { bateria: 88, estado: 'normal', temperatura: 25.4 } },
        { id: 'A-18', nombre: 'San Pedrito', linea: 'A', lat: -34.6165, lon: -58.3965, conexion: { estado: 'conectado', wifi: { señal: 89, ssid: 'SUBTE_A_18', ip: '192.168.1.118' } }, dispositivo: { bateria: 94, estado: 'normal', temperatura: 24.7 } },

        // LÍNEA B (17 estaciones) - Plaza Once es B-06
        { id: 'B-01', nombre: 'Leandro N. Alem', linea: 'B', lat: -34.6020, lon: -58.3705, conexion: { estado: 'conectado', wifi: { señal: 87, ssid: 'SUBTE_B_01', ip: '192.168.1.201' } }, dispositivo: { bateria: 93, estado: 'normal', temperatura: 25.2 } },
        { id: 'B-02', nombre: 'Florida', linea: 'B', lat: -34.6035, lon: -58.3720, conexion: { estado: 'conectado', wifi: { señal: 82, ssid: 'SUBTE_B_02', ip: '192.168.1.202' } }, dispositivo: { bateria: 90, estado: 'normal', temperatura: 25.5 } },
        { id: 'B-03', nombre: 'Carlos Pellegrini', linea: 'B', lat: -34.6040, lon: -58.3740, conexion: { estado: 'conectado', wifi: { señal: 79, ssid: 'SUBTE_B_03', ip: '192.168.1.203' } }, dispositivo: { bateria: 88, estado: 'normal', temperatura: 25.8 } },
        { id: 'B-04', nombre: 'Uruguay', linea: 'B', lat: -34.6045, lon: -58.3755, conexion: { estado: 'conectado', wifi: { señal: 85, ssid: 'SUBTE_B_04', ip: '192.168.1.204' } }, dispositivo: { bateria: 91, estado: 'normal', temperatura: 25.0 } },
        { id: 'B-05', nombre: 'Callao', linea: 'B', lat: -34.6050, lon: -58.3770, conexion: { estado: 'conectado', wifi: { señal: 90, ssid: 'SUBTE_B_05', ip: '192.168.1.205' } }, dispositivo: { bateria: 95, estado: 'normal', temperatura: 24.8 } },
        { id: 'B-06', nombre: 'Pueyrredón (Plaza Once)', linea: 'B', lat: -34.6060, lon: -58.4030, conexion: { estado: 'conectado', wifi: { señal: 78, ssid: 'SUBTE_B_06', ip: '192.168.1.206' } }, dispositivo: { bateria: 65, estado: 'alerta', temperatura: 28.2 } },
        { id: 'B-07', nombre: 'Carlos Gardel', linea: 'B', lat: -34.6070, lon: -58.4080, conexion: { estado: 'conectado', wifi: { señal: 81, ssid: 'SUBTE_B_07', ip: '192.168.1.207' } }, dispositivo: { bateria: 87, estado: 'normal', temperatura: 25.6 } },
        { id: 'B-08', nombre: 'Medrano', linea: 'B', lat: -34.6080, lon: -58.4140, conexion: { estado: 'conectado', wifi: { señal: 76, ssid: 'SUBTE_B_08', ip: '192.168.1.208' } }, dispositivo: { bateria: 89, estado: 'normal', temperatura: 25.3 } },
        { id: 'B-09', nombre: 'Ángel Gallardo', linea: 'B', lat: -34.6090, lon: -58.4200, conexion: { estado: 'conectado', wifi: { señal: 83, ssid: 'SUBTE_B_09', ip: '192.168.1.209' } }, dispositivo: { bateria: 92, estado: 'normal', temperatura: 25.1 } },
        { id: 'B-10', nombre: 'Malabia', linea: 'B', lat: -34.5900, lon: -58.4300, conexion: { estado: 'conectado', wifi: { señal: 80, ssid: 'SUBTE_B_10', ip: '192.168.1.210' } }, dispositivo: { bateria: 86, estado: 'normal', temperatura: 25.7 } },
        { id: 'B-11', nombre: 'Dorrego', linea: 'B', lat: -34.5870, lon: -58.4350, conexion: { estado: 'desconectado', wifi: { señal: 0, ssid: 'SUBTE_B_11', ip: null } }, dispositivo: { bateria: 42, estado: 'critico', temperatura: 29.1 } },
        { id: 'B-12', nombre: 'Federico Lacroze', linea: 'B', lat: -34.5820, lon: -58.4400, conexion: { estado: 'conectado', wifi: { señal: 77, ssid: 'SUBTE_B_12', ip: '192.168.1.212' } }, dispositivo: { bateria: 90, estado: 'normal', temperatura: 25.4 } },
        { id: 'B-13', nombre: 'Tronador', linea: 'B', lat: -34.5770, lon: -58.4450, conexion: { estado: 'conectado', wifi: { señal: 84, ssid: 'SUBTE_B_13', ip: '192.168.1.213' } }, dispositivo: { bateria: 93, estado: 'normal', temperatura: 25.0 } },
        { id: 'B-14', nombre: 'De los Incas', linea: 'B', lat: -34.5720, lon: -58.4500, conexion: { estado: 'conectado', wifi: { señal: 86, ssid: 'SUBTE_B_14', ip: '192.168.1.214' } }, dispositivo: { bateria: 91, estado: 'normal', temperatura: 24.9 } },
        { id: 'B-15', nombre: 'Echeverría', linea: 'B', lat: -34.5670, lon: -58.4550, conexion: { estado: 'conectado', wifi: { señal: 79, ssid: 'SUBTE_B_15', ip: '192.168.1.215' } }, dispositivo: { bateria: 88, estado: 'normal', temperatura: 25.5 } },
        { id: 'B-16', nombre: 'Juan Manuel de Rosas', linea: 'B', lat: -34.5620, lon: -58.4600, conexion: { estado: 'conectado', wifi: { señal: 82, ssid: 'SUBTE_B_16', ip: '192.168.1.216' } }, dispositivo: { bateria: 94, estado: 'normal', temperatura: 24.7 } },
        { id: 'B-17', nombre: 'Urquiza', linea: 'B', lat: -34.5570, lon: -58.4650, conexion: { estado: 'conectado', wifi: { señal: 88, ssid: 'SUBTE_B_17', ip: '192.168.1.217' } }, dispositivo: { bateria: 92, estado: 'normal', temperatura: 25.2 } },

        // LÍNEA C (9 estaciones)
        { id: 'C-01', nombre: 'Retiro', linea: 'C', lat: -34.5915, lon: -58.3755, conexion: { estado: 'conectado', wifi: { señal: 91, ssid: 'SUBTE_C_01', ip: '192.168.1.301' } }, dispositivo: { bateria: 96, estado: 'normal', temperatura: 24.5 } },
        { id: 'C-02', nombre: 'General San Martín', linea: 'C', lat: -34.5950, lon: -58.3760, conexion: { estado: 'conectado', wifi: { señal: 84, ssid: 'SUBTE_C_02', ip: '192.168.1.302' } }, dispositivo: { bateria: 89, estado: 'normal', temperatura: 25.3 } },
        { id: 'C-03', nombre: 'Lavalle', linea: 'C', lat: -34.5970, lon: -58.3770, conexion: { estado: 'conectado', wifi: { señal: 79, ssid: 'SUBTE_C_03', ip: '192.168.1.303' } }, dispositivo: { bateria: 87, estado: 'normal', temperatura: 25.6 } },
        { id: 'C-04', nombre: 'Diagonal Norte', linea: 'C', lat: -34.6030, lon: -58.3780, conexion: { estado: 'conectado', wifi: { señal: 87, ssid: 'SUBTE_C_04', ip: '192.168.1.304' } }, dispositivo: { bateria: 93, estado: 'normal', temperatura: 24.9 } },
        { id: 'C-05', nombre: 'Avenida de Mayo', linea: 'C', lat: -34.6085, lon: -58.3790, conexion: { estado: 'conectado', wifi: { señal: 83, ssid: 'SUBTE_C_05', ip: '192.168.1.305' } }, dispositivo: { bateria: 91, estado: 'normal', temperatura: 25.1 } },
        { id: 'C-06', nombre: 'Moreno', linea: 'C', lat: -34.6105, lon: -58.3805, conexion: { estado: 'conectado', wifi: { señal: 80, ssid: 'SUBTE_C_06', ip: '192.168.1.306' } }, dispositivo: { bateria: 88, estado: 'normal', temperatura: 25.4 } },
        { id: 'C-07', nombre: 'Independencia', linea: 'C', lat: -34.6150, lon: -58.3820, conexion: { estado: 'conectado', wifi: { señal: 86, ssid: 'SUBTE_C_07', ip: '192.168.1.307' } }, dispositivo: { bateria: 92, estado: 'normal', temperatura: 25.0 } },
        { id: 'C-08', nombre: 'San Juan', linea: 'C', lat: -34.6200, lon: -58.3835, conexion: { estado: 'desconectado', wifi: { señal: 0, ssid: 'SUBTE_C_08', ip: null } }, dispositivo: { bateria: 38, estado: 'critico', temperatura: 29.5 } },
        { id: 'C-09', nombre: 'Constitución', linea: 'C', lat: -34.6270, lon: -58.3805, conexion: { estado: 'conectado', wifi: { señal: 90, ssid: 'SUBTE_C_09', ip: '192.168.1.309' } }, dispositivo: { bateria: 95, estado: 'normal', temperatura: 24.6 } },

        // LÍNEA D (16 estaciones - versión resumida)
        { id: 'D-01', nombre: 'Catedral', linea: 'D', lat: -34.6077, lon: -58.3731, conexion: { estado: 'conectado', wifi: { señal: 88, ssid: 'SUBTE_D_01', ip: '192.168.1.401' } }, dispositivo: { bateria: 94, estado: 'normal', temperatura: 24.8 } },
        { id: 'D-02', nombre: '9 de Julio', linea: 'D', lat: -34.6035, lon: -58.3820, conexion: { estado: 'conectado', wifi: { señal: 85, ssid: 'SUBTE_D_02', ip: '192.168.1.402' } }, dispositivo: { bateria: 90, estado: 'normal', temperatura: 25.2 } },
        { id: 'D-16', nombre: 'Congreso de Tucumán', linea: 'D', lat: -34.5520, lon: -58.4530, conexion: { estado: 'conectado', wifi: { señal: 82, ssid: 'SUBTE_D_16', ip: '192.168.1.416' } }, dispositivo: { bateria: 91, estado: 'normal', temperatura: 25.3 } },

        // LÍNEA E (18 estaciones - versión resumida)
        { id: 'E-01', nombre: 'Retiro', linea: 'E', lat: -34.5915, lon: -58.3755, conexion: { estado: 'conectado', wifi: { señal: 87, ssid: 'SUBTE_E_01', ip: '192.168.1.501' } }, dispositivo: { bateria: 93, estado: 'normal', temperatura: 24.9 } },
        { id: 'E-18', nombre: 'Plaza de los Virreyes', linea: 'E', lat: -34.6600, lon: -58.4430, conexion: { estado: 'conectado', wifi: { señal: 79, ssid: 'SUBTE_E_18', ip: '192.168.1.518' } }, dispositivo: { bateria: 87, estado: 'normal', temperatura: 25.7 } },

        // LÍNEA H (17 estaciones - versión resumida)
        { id: 'H-01', nombre: 'Facultad de Derecho', linea: 'H', lat: -34.5820, lon: -58.3920, conexion: { estado: 'conectado', wifi: { señal: 86, ssid: 'SUBTE_H_01', ip: '192.168.1.601' } }, dispositivo: { bateria: 92, estado: 'normal', temperatura: 25.0 } },
        { id: 'H-06', nombre: 'Once', linea: 'H', lat: -34.6080, lon: -58.4150, conexion: { estado: 'conectado', wifi: { señal: 77, ssid: 'SUBTE_H_06', ip: '192.168.1.606' } }, dispositivo: { bateria: 86, estado: 'normal', temperatura: 25.9 } },
        { id: 'H-17', nombre: 'Talleres', linea: 'H', lat: -34.6650, lon: -58.4350, conexion: { estado: 'desconectado', wifi: { señal: 0, ssid: 'SUBTE_H_17', ip: null } }, dispositivo: { bateria: 35, estado: 'critico', temperatura: 30.2 } }
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
    if (mapa) actualizarMarcadores();
    mostrarNotificacion('✅ Todas las estaciones conectadas', '#2ecc71');
}

// ========== MAPA INTERACTIVO CON FILTROS ==========
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
    
    actualizarMarcadores();
    
    console.log('✅ Mapa inicializado correctamente');
}

function actualizarMarcadores() {
    if (!mapa) return;
    
    // Limpiar marcadores anteriores
    if (marcadores.length > 0) {
        marcadores.forEach(marker => mapa.removeLayer(marker));
        marcadores = [];
    }
    
    // Filtrar estaciones según filtro actual
    let estacionesAMostrar = datosEstaciones;
    if (filtroActual !== 'todas') {
        if (filtroActual === 'problemas') {
            estacionesAMostrar = datosEstaciones.filter(e => 
                e.dispositivo.estado === 'critico' || e.dispositivo.estado === 'alerta' || e.conexion.estado === 'desconectado'
            );
        } else {
            estacionesAMostrar = datosEstaciones.filter(e => e.linea === filtroActual);
        }
    }
    
    // Agregar marcadores filtrados
    estacionesAMostrar.forEach(estacion => {
        if (!estacion.lat || !estacion.lon) return;
        
        let color, estadoTexto;
        if (estacion.conexion.estado === 'desconectado') {
            color = '#95a5a6';
            estadoTexto = '🔌 Offline';
        } else {
            switch(estacion.dispositivo.estado) {
                case 'normal': color = '#2ecc71'; estadoTexto = '✅ Normal'; break;
                case 'alerta': color = '#f39c12'; estadoTexto = '⚠️ Alerta'; break;
                case 'critico': color = '#e74c3c'; estadoTexto = '❌ Crítico'; break;
                default: color = '#95a5a6'; estadoTexto = '🔌 Offline';
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
                <b>${estadoTexto}</b><br>
                📶 WiFi: ${estacion.conexion.wifi.señal}%<br>
                🔋 Batería: ${estacion.dispositivo.bateria}%<br>
                <button onclick="mostrarDetallesEstacion('${estacion.id}')" style="margin-top: 8px; padding: 6px 12px; background: #1a237e; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Ver detalles
                </button>
            `);
        
        marcadores.push(marker);
    });
    
    console.log(`✅ ${marcadores.length} marcadores mostrados (filtro: ${filtroActual})`);
}

// ========== FILTROS POR LÍNEA ==========
function filtrarMapa(linea) {
    filtroActual = linea;
    
    // Actualizar clase active de los botones
    const botones = document.querySelectorAll('.map-btn');
    botones.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(linea === 'A' ? 'Línea A' : 
                                     linea === 'B' ? 'Línea B' : 
                                     linea === 'C' ? 'Línea C' : 
                                     linea === 'D' ? 'Línea D' : 
                                     linea === 'E' ? 'Línea E' : 
                                     linea === 'H' ? 'Línea H' : 
                                     linea === 'problemas' ? 'problemas' : 'Todas')) {
            btn.classList.add('active');
        }
    });
    
    actualizarMarcadores();
    
    // Centrar mapa según la línea seleccionada
    if (linea !== 'todas' && linea !== 'problemas') {
        // Centrar en un punto aproximado de la línea
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
    } else {
        mapa.setView([-34.6037, -58.3816], 12);
    }
    
    mostrarNotificacion(`🗺️ Mostrando: ${linea === 'todas' ? 'Todas las estaciones' : linea === 'problemas' ? 'Estaciones con problemas' : 'Línea ' + linea}`, '#3498db');
}

// ========== FUNCIONES DE NOTIFICACIÓN ==========
function mostrarNotificacion(mensaje, color) {
    const notifs = document.querySelectorAll('.notification-custom');
    notifs.forEach(notif => notif.remove());
    
    const notif = document.createElement('div');
    notif.className = 'notification-custom';
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 1001;
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
   
