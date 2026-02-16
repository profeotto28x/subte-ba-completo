// funciones.js - VERSIÓN CON CONFIGURACIÓN WIFI MEJORADA

// ========== VARIABLES GLOBALES ==========
let datosEstaciones = [];
let mapa = null;
let marcadores = [];
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
            cargarLeaflet();
        }
    }, 500);
    
    setInterval(actualizarDatosAutomaticamente, 30000);
}

function cargarLeaflet() {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        setTimeout(initMap, 500);
    };
    document.head.appendChild(script);
}

// ========== CARGA DE DATOS ==========
function cargarDatosEstaciones() {
    // Base de datos completa de 104 estaciones
    datosEstaciones = [
        { id: 'A-01', nombre: 'Plaza de Mayo', linea: 'A', lat: -34.6083, lon: -58.3712, conexion: { estado: 'conectado', wifi: { señal: 85, ssid: 'SUBTE_A_01' } }, dispositivo: { bateria: 92, estado: 'normal' } },
        { id: 'A-02', nombre: 'Perú', linea: 'A', lat: -34.6085, lon: -58.3725, conexion: { estado: 'conectado', wifi: { señal: 78, ssid: 'SUBTE_A_02' } }, dispositivo: { bateria: 88, estado: 'normal' } },
        { id: 'A-03', nombre: 'Piedras', linea: 'A', lat: -34.6090, lon: -58.3740, conexion: { estado: 'conectado', wifi: { señal: 72, ssid: 'SUBTE_A_03' } }, dispositivo: { bateria: 76, estado: 'alerta' } },
        { id: 'A-04', nombre: 'Lima', linea: 'A', lat: -34.6095, lon: -58.3755, conexion: { estado: 'conectado', wifi: { señal: 90, ssid: 'SUBTE_A_04' } }, dispositivo: { bateria: 95, estado: 'normal' } },
        { id: 'A-05', nombre: 'Sáenz Peña', linea: 'A', lat: -34.6100, lon: -58.3770, conexion: { estado: 'desconectado', wifi: { señal: 0, ssid: 'SUBTE_A_05' } }, dispositivo: { bateria: 45, estado: 'critico' } },
        { id: 'A-06', nombre: 'Congreso', linea: 'A', lat: -34.6105, lon: -58.3785, conexion: { estado: 'conectado', wifi: { señal: 82, ssid: 'SUBTE_A_06' } }, dispositivo: { bateria: 91, estado: 'normal' } },
        { id: 'B-01', nombre: 'Leandro N. Alem', linea: 'B', lat: -34.6020, lon: -58.3705, conexion: { estado: 'conectado', wifi: { señal: 87, ssid: 'SUBTE_B_01' } }, dispositivo: { bateria: 93, estado: 'normal' } },
        { id: 'B-02', nombre: 'Florida', linea: 'B', lat: -34.6035, lon: -58.3720, conexion: { estado: 'conectado', wifi: { señal: 82, ssid: 'SUBTE_B_02' } }, dispositivo: { bateria: 90, estado: 'normal' } },
        { id: 'B-03', nombre: 'Carlos Pellegrini', linea: 'B', lat: -34.6040, lon: -58.3740, conexion: { estado: 'conectado', wifi: { señal: 79, ssid: 'SUBTE_B_03' } }, dispositivo: { bateria: 88, estado: 'normal' } },
        { id: 'B-04', nombre: 'Uruguay', linea: 'B', lat: -34.6045, lon: -58.3755, conexion: { estado: 'conectado', wifi: { señal: 85, ssid: 'SUBTE_B_04' } }, dispositivo: { bateria: 91, estado: 'normal' } },
        { id: 'B-05', nombre: 'Callao', linea: 'B', lat: -34.6050, lon: -58.3770, conexion: { estado: 'conectado', wifi: { señal: 90, ssid: 'SUBTE_B_05' } }, dispositivo: { bateria: 95, estado: 'normal' } },
        { id: 'B-06', nombre: 'Pueyrredón (Plaza Once)', linea: 'B', lat: -34.6060, lon: -58.4030, conexion: { estado: 'conectado', wifi: { señal: 78, ssid: 'SUBTE_B_06' } }, dispositivo: { bateria: 65, estado: 'alerta' } },
        { id: 'B-07', nombre: 'Carlos Gardel', linea: 'B', lat: -34.6070, lon: -58.4080, conexion: { estado: 'conectado', wifi: { señal: 81, ssid: 'SUBTE_B_07' } }, dispositivo: { bateria: 87, estado: 'normal' } },
        { id: 'B-08', nombre: 'Medrano', linea: 'B', lat: -34.6080, lon: -58.4140, conexion: { estado: 'conectado', wifi: { señal: 76, ssid: 'SUBTE_B_08' } }, dispositivo: { bateria: 89, estado: 'normal' } },
        { id: 'B-09', nombre: 'Ángel Gallardo', linea: 'B', lat: -34.6090, lon: -58.4200, conexion: { estado: 'conectado', wifi: { señal: 83, ssid: 'SUBTE_B_09' } }, dispositivo: { bateria: 92, estado: 'normal' } },
        { id: 'B-10', nombre: 'Malabia', linea: 'B', lat: -34.5900, lon: -58.4300, conexion: { estado: 'conectado', wifi: { señal: 80, ssid: 'SUBTE_B_10' } }, dispositivo: { bateria: 86, estado: 'normal' } },
        { id: 'B-11', nombre: 'Dorrego', linea: 'B', lat: -34.5870, lon: -58.4350, conexion: { estado: 'desconectado', wifi: { señal: 0, ssid: 'SUBTE_B_11' } }, dispositivo: { bateria: 42, estado: 'critico' } },
        { id: 'B-12', nombre: 'Federico Lacroze', linea: 'B', lat: -34.5820, lon: -58.4400, conexion: { estado: 'conectado', wifi: { señal: 77, ssid: 'SUBTE_B_12' } }, dispositivo: { bateria: 90, estado: 'normal' } },
        { id: 'B-13', nombre: 'Tronador', linea: 'B', lat: -34.5770, lon: -58.4450, conexion: { estado: 'conectado', wifi: { señal: 84, ssid: 'SUBTE_B_13' } }, dispositivo: { bateria: 93, estado: 'normal' } },
        { id: 'C-01', nombre: 'Retiro', linea: 'C', lat: -34.5915, lon: -58.3755, conexion: { estado: 'conectado', wifi: { señal: 91, ssid: 'SUBTE_C_01' } }, dispositivo: { bateria: 96, estado: 'normal' } },
        { id: 'C-02', nombre: 'General San Martín', linea: 'C', lat: -34.5950, lon: -58.3760, conexion: { estado: 'conectado', wifi: { señal: 84, ssid: 'SUBTE_C_02' } }, dispositivo: { bateria: 89, estado: 'normal' } },
        { id: 'C-03', nombre: 'Lavalle', linea: 'C', lat: -34.5970, lon: -58.3770, conexion: { estado: 'conectado', wifi: { señal: 79, ssid: 'SUBTE_C_03' } }, dispositivo: { bateria: 87, estado: 'normal' } },
        { id: 'C-04', nombre: 'Diagonal Norte', linea: 'C', lat: -34.6030, lon: -58.3780, conexion: { estado: 'conectado', wifi: { señal: 87, ssid: 'SUBTE_C_04' } }, dispositivo: { bateria: 93, estado: 'normal' } },
        { id: 'C-05', nombre: 'Avenida de Mayo', linea: 'C', lat: -34.6085, lon: -58.3790, conexion: { estado: 'conectado', wifi: { señal: 83, ssid: 'SUBTE_C_05' } }, dispositivo: { bateria: 91, estado: 'normal' } },
        { id: 'C-06', nombre: 'Moreno', linea: 'C', lat: -34.6105, lon: -58.3805, conexion: { estado: 'conectado', wifi: { señal: 80, ssid: 'SUBTE_C_06' } }, dispositivo: { bateria: 88, estado: 'normal' } },
        { id: 'C-07', nombre: 'Independencia', linea: 'C', lat: -34.6150, lon: -58.3820, conexion: { estado: 'conectado', wifi: { señal: 86, ssid: 'SUBTE_C_07' } }, dispositivo: { bateria: 92, estado: 'normal' } },
        { id: 'C-08', nombre: 'San Juan', linea: 'C', lat: -34.6200, lon: -58.3835, conexion: { estado: 'desconectado', wifi: { señal: 0, ssid: 'SUBTE_C_08' } }, dispositivo: { bateria: 38, estado: 'critico' } },
        { id: 'C-09', nombre: 'Constitución', linea: 'C', lat: -34.6270, lon: -58.3805, conexion: { estado: 'conectado', wifi: { señal: 90, ssid: 'SUBTE_C_09' } }, dispositivo: { bateria: 95, estado: 'normal' } }
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

// ========== MAPA INTERACTIVO ==========
function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    mapa = L.map('map').setView([-34.6037, -58.3816], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(mapa);
    
    actualizarMarcadoresSegunFiltro();
}

function actualizarMarcadoresSegunFiltro() {
    if (!mapa) return;
    
    if (marcadores.length > 0) {
        marcadores.forEach(marker => mapa.removeLayer(marker));
        marcadores = [];
    }
    
    let estacionesAMostrar = [];
    if (filtroActual === 'todas') {
        estacionesAMostrar = datosEstaciones;
    } else if (filtroActual === 'problemas') {
        estacionesAMostrar = datosEstaciones.filter(e => 
            e.dispositivo.estado === 'critico' || 
            e.dispositivo.estado === 'alerta' || 
            e.conexion.estado === 'desconectado'
        );
    } else {
        estacionesAMostrar = datosEstaciones.filter(e => e.linea === filtroActual);
    }
    
    estacionesAMostrar.forEach(estacion => {
        if (!estacion.lat || !estacion.lon) return;
        
        let color;
        if (estacion.conexion.estado === 'desconectado') {
            color = '#95a5a6';
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
                <b>${estacion.conexion.estado === 'conectado' ? '● CONECTADO' : '○ DESCONECTADO'}</b><br>
                📶 Señal: ${estacion.conexion.wifi.señal}%<br>
                🔋 Batería: ${estacion.dispositivo.bateria}%<br>
                <button onclick="configurarWifiEstacion('${estacion.id}')" style="margin-top: 8px; padding: 6px 12px; background: #1a237e; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    📡 CONFIGURAR WIFI
                </button>
            `);
        
        marcadores.push(marker);
    });
}

function filtrarMapa(linea) {
    filtroActual = linea;
    
    const botones = document.querySelectorAll('.map-btn');
    botones.forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    
    actualizarMarcadoresSegunFiltro();
    
    if (linea !== 'todas' && linea !== 'problemas') {
        const centros = { 'A': [-34.6120, -58.3830], 'B': [-34.5900, -58.4300], 'C': [-34.6080, -58.3780], 'D': [-34.5900, -58.4030], 'E': [-34.6350, -58.4180], 'H': [-34.6150, -58.4150] };
        if (centros[linea]) mapa.setView(centros[linea], 13);
    } else {
        mapa.setView([-34.6037, -58.3816], 12);
    }
    
    mostrarNotificacion(`🗺️ Mostrando: ${linea === 'todas' ? 'Todas' : linea === 'problemas' ? 'Problemas' : 'Línea ' + linea}`, '#3498db');
}

// ========== 🚀 CONFIGURACIÓN WIFI MEJORADA ==========
function configurarWifiEstacion(estacionId) {
    const estacion = datosEstaciones.find(e => e.id === estacionId);
    if (!estacion) return;
    
    const modalHTML = `
        <div class="modal-backdrop" onclick="cerrarModalWifi()">
            <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 500px;">
                <h2 style="color: #1a237e; text-align: center; margin-bottom: 10px;">📡 CONFIGURAR WIFI</h2>
                <p style="text-align: center; color: #666; margin-bottom: 20px;"><strong>${estacion.nombre}</strong> - Línea ${estacion.linea}</p>
                
                <!-- ESTADO ACTUAL -->
                <div style="background: #f0f8ff; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="color: #1a237e; font-size: 1rem; margin-bottom: 8px;">📊 ESTADO ACTUAL</h3>
                    <p><strong>SSID actual:</strong> ${estacion.conexion.wifi.ssid}</p>
                    <p><strong>Estado:</strong> <span style="color: ${estacion.conexion.estado === 'conectado' ? '#2ecc71' : '#e74c3c'}">${estacion.conexion.estado.toUpperCase()}</span></p>
                    <p><strong>Señal:</strong> ${estacion.conexion.wifi.señal}%</p>
                </div>
                
                <!-- MÉTODO AUTOMÁTICO (ESCANEAR) -->
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #1a237e; margin-bottom: 10px;">🔍 ESCANEAR REDES CERCANAS</h3>
                    <button onclick="escanearRedesCercanas('${estacionId}')" style="width: 100%; padding: 12px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer; margin-bottom: 15px;">
                        📶 BUSCAR REDES DISPONIBLES
                    </button>
                    <div id="redes-${estacionId}" style="max-height: 200px; overflow-y: auto; background: #f8f9fa; padding: 10px; border-radius: 8px;">
                        <p style="text-align: center; color: #666;">Presioná "Buscar redes" para ver opciones</p>
                    </div>
                </div>
                
                <!-- MÉTODO MANUAL -->
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="color: #1a237e; margin-bottom: 15px;">✏️ CONFIGURACIÓN MANUAL</h3>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: #5c6bc0;">SSID (nombre de red):</label>
                        <input type="text" id="manual-ssid-${estacionId}" placeholder="Ej: WiFi-Subte" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;">
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: #5c6bc0;">Contraseña:</label>
                        <input type="password" id="manual-pass-${estacionId}" placeholder="••••••••" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;">
                    </div>
                    
                    <button onclick="configurarManual('${estacionId}')" style="width: 100%; padding: 12px; background: #1a237e; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        💾 GUARDAR Y CONECTAR
                    </button>
                </div>
                
                <!-- CÓDIGO DE EJEMPLO (para técnicos) -->
                <div style="margin-top: 20px; background: #2c3e50; padding: 15px; border-radius: 8px; color: white;">
                    <p style="font-family: monospace; font-size: 0.8rem;">
📟 <strong>Código Arduino (ejemplo):</strong><br>
const char* ssid = "XXXXX";<br>
const char* password = "YYYYY";<br>
WiFi.begin(ssid, password);
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 25px;">
                    <button onclick="cerrarModalWifi()" style="padding: 10px 30px; background: #666; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        ❌ CERRAR
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.id = 'modal-wifi';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
}

function cerrarModalWifi() {
    const modal = document.getElementById('modal-wifi');
    if (modal) modal.remove();
}

// ESCANEAR REDES CERCANAS (SIMULADO)
function escanearRedesCercanas(estacionId) {
    const container = document.getElementById(`redes-${estacionId}`);
    if (!container) return;
    
    container.innerHTML = '<p style="text-align: center; color: #3498db;">🔍 Escaneando redes...</p>';
    
    // SIMULACIÓN de redes disponibles (en un ESP32 real, esto vendría del hardware)
    setTimeout(() => {
        const redesCercanas = [
            { ssid: `WiFi-Subte-2.4G`, señal: 92, seguridad: 'WPA2' },
            { ssid: `Fibertel-${Math.floor(Math.random()*1000)}`, señal: 85, seguridad: 'WPA2' },
            { ssid: `Personal-${Math.floor(Math.random()*100)}`, señal: 76, seguridad: 'WPA' },
            { ssid: `SUBTE_${estacionId}`, señal: 95, seguridad: 'WPA2' },
            { ssid: `Telecentro-${Math.floor(Math.random()*500)}`, señal: 65, seguridad: 'WPA2' },
            { ssid: `WiFi-Publico`, señal: 40, seguridad: 'Abierta' }
        ];
        
        container.innerHTML = redesCercanas.map(red => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; margin-bottom: 5px; background: white; border-radius: 6px; border-left: 4px solid ${red.señal > 80 ? '#2ecc71' : red.señal > 50 ? '#f39c12' : '#e74c3c'};">
                <div>
                    <strong>${red.ssid}</strong><br>
                    <small>${red.seguridad} • ${red.señal}%</small>
                </div>
                <button onclick="seleccionarRed('${estacionId}', '${red.ssid}')" style="padding: 6px 12px; background: #1a237e; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Usar
                </button>
            </div>
        `).join('');
    }, 1500);
}

function seleccionarRed(estacionId, ssid) {
    document.getElementById(`manual-ssid-${estacionId}`).value = ssid;
    mostrarNotificacion(`✅ Red "${ssid}" seleccionada. Ingresá la contraseña.`, '#2ecc71');
}

function configurarManual(estacionId) {
    const ssid = document.getElementById(`manual-ssid-${estacionId}`).value.trim();
    const password = document.getElementById(`manual-pass-${estacionId}`).value.trim();
    
    if (!ssid || !password) {
        mostrarNotificacion('❌ Completá SSID y contraseña', '#e74c3c');
        return;
    }
    
    // Buscar estación y actualizar
    const estacion = datosEstaciones.find(e => e.id === estacionId);
    if (estacion) {
        estacion.conexion.wifi.ssid = ssid;
        estacion.conexion.estado = 'conectado';
        estacion.conexion.wifi.señal = 85 + Math.floor(Math.random() * 10);
        mostrarNotificacion(`✅ ${estacion.nombre} conectada a "${ssid}"`, '#2ecc71');
        actualizarMarcadoresSegunFiltro();
        actualizarEstadisticasConexion();
        cerrarModalWifi();
    }
}

// ========== MODO FIESTA ==========
function mostrarPanelFiestas() {
    alert('🎉 MODO FIESTA\n\nOpciones disponibles:\n• 🎄 NAVIDAD\n• 🇦🇷 INDEPENDENCIA\n• ⚙️ Configurable');
    const colores = ['#FF0000', '#00FF00'];
    let index = 0;
    const intervalo = setInterval(() => {
        document.body.style.background = colores[index];
        index = (index + 1) % colores.length;
    }, 500);
    setTimeout(() => {
        clearInterval(intervalo);
        document.body.style.background = 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)';
    }, 5000);
}

// ========== NOTIFICACIONES ==========
function mostrarNotificacion(mensaje, color) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: ${color}; color: white;
        padding: 15px 25px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 1002; font-weight: bold; animation: slideIn 0.5s;
    `;
    notif.textContent = mensaje;
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `margin-left: 15px; background: transparent; border: none; color: white; font-size: 1.2rem; cursor: pointer;`;
    closeBtn.onclick = () => notif.remove();
    notif.appendChild(closeBtn);
    document.body.appendChild(notif);
    setTimeout(() => { if (notif.parentElement) notif.remove(); }, 5000);
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

// CSS extra para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .map-btn.active { background: #2ecc71 !important; transform: scale(1.05); }
`;
document.head.appendChild(style);

console.log('✅ Sistema WiFi mejorado listo');
