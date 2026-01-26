// funciones.js - Todas las funcionalidades del sistema

// ========== VARIABLES GLOBALES ==========
let datosEstaciones = [];
let mapa = null;
let marcadores = [];
let modoFiestaActivo = null;
let intervaloFiesta = null;

// ========== SISTEMA DE LOGIN ==========
function checkLogin() {
    const password = document.getElementById('password').value;
    
    // Contraseña de demo o vacío para acceso rápido
    if (password === 'SUBTE2024' || password === '') {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard-content').style.display = 'block';
        inicializarSistema();
    } else {
        alert('❌ Contraseña incorrecta\n\nPara demo use: SUBTE2024\nO deje vacío para acceso rápido');
    }
}

function logout() {
    // Detener efectos de fiesta si están activos
    if (intervaloFiesta) {
        clearInterval(intervaloFiesta);
    }
    
    document.getElementById('dashboard-content').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('password').value = '';
}

// ========== INICIALIZACIÓN DEL SISTEMA ==========
function inicializarSistema() {
    // 1. Cargar datos de estaciones
    cargarDatosEstaciones();
    
    // 2. Actualizar estadísticas
    actualizarEstadisticasConexion();
    
    // 3. Inicializar mapa
    setTimeout(() => {
        if (typeof L !== 'undefined') {
            initMap();
        }
    }, 1000);
    
    // 4. Verificar modo fiesta activo
    verificarModoFiestaActivo();
    
    // 5. Iniciar actualizaciones automáticas
    setInterval(actualizarDatosAutomaticamente, 10000);
}

function cargarDatosEstaciones() {
    datosEstaciones = window.databaseSubte.generarDatosEstadoInicial();
    console.log(`✅ Cargadas ${datosEstaciones.length} estaciones`);
}

// ========== SISTEMA DE CONEXIÓN WIFI ==========
function actualizarEstadisticasConexion() {
    if (!datosEstaciones.length) return;
    
    const total = datosEstaciones.length;
    const conectadas = datosEstaciones.filter(e => e.conexion.estado === 'conectado').length;
    const porcentaje = Math.round((conectadas / total) * 100);
    
    // Actualizar números
    document.getElementById('wifi-connected').textContent = conectadas;
    document.getElementById('wifi-disconnected').textContent = total - conectadas;
    document.getElementById('wifi-percentage').textContent = `${porcentaje}%`;
    
    // Actualizar estado general
    const estadoElement = document.getElementById('estado-general');
    if (conectadas === total) {
        estadoElement.innerHTML = `<span class="status-online">✅ ${conectadas} de ${total} estaciones conectadas</span>`;
    } else if (conectadas > total * 0.7) {
        estadoElement.innerHTML = `<span class="status-warning">⚠️ ${conectadas} de ${total} estaciones conectadas</span>`;
    } else {
        estadoElement.innerHTML = `<span style="background: #e74c3c; color: white; padding: 5px 15px; border-radius: 20px;">❌ ${conectadas} de ${total} estaciones conectadas</span>`;
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

function filtrarMapa(tipo) {
    // Actualizar botones activos
    document.querySelectorAll('.map-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    mostrarNotificacion(`🗺️ Mostrando: ${tipo === 'todas' ? 'Todas las estaciones' : 'Línea ' + tipo}`, '#3498db');
}

// ========== MAPA INTERACTIVO ==========
function initMap() {
    // Crear mapa centrado en Buenos Aires
    mapa = L.map('map').setView([-34.6037, -58.3816], 13);
    
    // Agregar capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(mapa);
    
    // Agregar marcadores
    actualizarMarcadores();
}

function actualizarMarcadores() {
    // Limpiar marcadores anteriores
    if (marcadores.length > 0) {
        marcadores.forEach(marker => mapa.removeLayer(marker));
        marcadores = [];
    }
    
    // Agregar nuevos marcadores
    datosEstaciones.forEach(estacion => {
        // Determinar color según estado
        let color, estadoTexto;
        switch(estacion.dispositivo.estado) {
            case 'normal':
                color = '#2ecc71';
                estadoTexto = '✅ Normal';
                break;
            case 'alerta':
                color = '#f39c12';
                estadoTexto = '⚠️ Alerta';
                break;
            case 'critico':
                color = '#e74c3c';
                estadoTexto = '❌ Crítico';
                break;
            default:
                color = '#95a5a6';
                estadoTexto = '🔌 Offline';
        }
        
        // Crear ícono personalizado
        const icono = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20]
        });
        
        // Crear marcador
        const marker = L.marker([estacion.lat, estacion.lon], { icon: icono })
            .addTo(mapa)
            .bindPopup(`
                <strong>${estacion.nombre}</strong><br>
                <small>Línea ${estacion.linea}</small><br>
                <b>${estadoTexto}</b
