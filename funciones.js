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
                <b>${estadoTexto}</b><br>
                📶 WiFi: ${estacion.conexion.wifi.señal}%<br>
                🔋 Batería: ${estacion.dispositivo.bateria}%<br>
                <button onclick="mostrarDetallesEstacion('${estacion.id}')" style="margin-top: 8px; padding: 6px 12px; background: #1a237e; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Ver detalles
                </button>
            `);
        
        marcadores.push(marker);
    });
}

function mostrarDetallesEstacion(estacionId) {
    const estacion = datosEstaciones.find(e => e.id === estacionId);
    if (!estacion) return;
    
    alert(`
        🚇 ${estacion.nombre}
        
        📍 Línea: ${estacion.linea}
        🔌 Estado: ${estacion.conexion.estado.toUpperCase()}
        📶 Señal WiFi: ${estacion.conexion.wifi.señal}%
        🔋 Batería: ${estacion.dispositivo.bateria}%
        🌡️ Temperatura: ${estacion.dispositivo.temperatura.toFixed(1)}°C
        💡 Modo: ${estacion.iluminacion.modo}
        
        Red WiFi: ${estacion.conexion.wifi.ssid}
        IP: ${estacion.conexion.wifi.ip || 'No asignada'}
    `);
}

// ========== SISTEMA DE FIESTAS ==========
function mostrarPanelFiestas() {
    const modalHTML = `
        <div class="modal-backdrop">
            <div class="modal-content">
                <h2 style="color: #1a237e; text-align: center;">🎉 MODO FIESTA</h2>
                <p style="text-align: center; color: #666; margin-bottom: 25px;">Seleccione un efecto de luces</p>
                
                <div style="margin: 20px 0;">
                    <button onclick="activarFiesta('navidad')" style="width: 100%; padding: 15px; background: #FF0000; color: white; border: none; border-radius: 8px; margin-bottom: 10px; cursor: pointer; font-weight: bold;">
                        🎄 ACTIVAR NAVIDAD
                    </button>
                    <p style="font-size: 0.9rem; color: #666; text-align: center;">Rojo y verde alternante</p>
                </div>
                
                <div style="margin: 20px 0;">
                    <button onclick="activarFiesta('independencia')" style="width: 100%; padding: 15px; background: #75AADB; color: white; border: none; border-radius: 8px; margin-bottom: 10px; cursor: pointer; font-weight: bold;">
                        🇦🇷 ACTIVAR INDEPENDENCIA
                    </button>
                    <p style="font-size: 0.9rem; color: #666; text-align: center;">Celeste y blanco patriótico</p>
                </div>
                
                <div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <h3 style="color: #1a237e;">⚙️ CONFIGURACIÓN</h3>
                    
                    <div style="margin: 15px 0;">
                        <label style="display: block; margin-bottom: 5px; color: #5c6bc0;">Frecuencia: <span id="freqValue">1</span> Hz</label>
                        <input type="range" id="fiestaFreq" min="0.5" max="5" step="0.5" value="1" style="width: 100%;" 
                               oninput="document.getElementById('freqValue').textContent = this.value">
                    </div>
                    
                    <div style="margin: 15px 0;">
                        <label style="display: block; margin-bottom: 5px; color: #5c6bc0;">Duración:</label>
                        <select id="fiestaDuration" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px;">
                            <option value="1">1 minuto (prueba)</option>
                            <option value="30">30 minutos</option>
                            <option value="60" selected>1 hora</option>
                            <option value="120">2 horas</option>
                        </select>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 25px;">
                    <button onclick="probarEfectoFiesta()" style="flex: 1; padding: 12px; background: #f39c12; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        🔦 Probar efecto
                    </button>
                    <button onclick="cerrarModalFiesta()" style="flex: 1; padding: 12px; background: #666; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        ❌ Cancelar
                    </button>
                </div>
                
                ${modoFiestaActivo ? `
                <div style="margin-top: 25px; padding: 15px; background: #e8f5e9; border-radius: 10px; text-align: center;">
                    <strong>🎆 MODO FIESTA ACTIVO</strong><br>
                    ${modoFiestaActivo.modo.toUpperCase()} - ${modoFiestaActivo.frecuencia}Hz
                    <button onclick="desactivarFiesta()" style="margin-top: 10px; padding: 8px 15px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        ⏹️ DESACTIVAR
                    </button>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Crear y mostrar modal
    const modal = document.createElement('div');
    modal.id = 'modal-fiesta';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
}

function cerrarModalFiesta() {
    const modal = document.getElementById('modal-fiesta');
    if (modal) modal.remove();
}

function activarFiesta(modo) {
    const frecuencia = parseFloat(document.getElementById('fiestaFreq').value);
    const duracion = parseInt(document.getElementById('fiestaDuration').value);
    
    // Activar en todas las estaciones
    datosEstaciones.forEach(estacion => {
        estacion.iluminacion.modo = 'fiesta';
        estacion.iluminacion.fiesta = {
            modo: modo,
            frecuencia: frecuencia,
            activo: true
        };
    });
    
    // Guardar configuración
    modoFiestaActivo = window.databaseSubte.sistemaFiesta.activarModoFiestaGlobal(modo, frecuencia, duracion);
    
    // Iniciar animación
    iniciarAnimacionFiesta(modo, frecuencia);
    
    // Mostrar notificación
    mostrarNotificacion(`🎉 Modo ${modo.toUpperCase()} activado!`, '#2ecc71');
    
    // Cerrar modal
    cerrarModalFiesta();
}

function desactivarFiesta() {
    datosEstaciones.forEach(estacion => {
        estacion.iluminacion.modo = 'normal';
        estacion.iluminacion.fiesta.activo = false;
    });
    
    window.databaseSubte.sistemaFiesta.desactivarModoFiesta();
    modoFiestaActivo = null;
    
    // Detener animación
    if (intervaloFiesta) {
        clearInterval(intervaloFiesta);
        intervaloFiesta = null;
    }
    
    // Restaurar fondo normal
    document.body.style.background = 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)';
    
    mostrarNotificacion('⏹️ Modo fiesta desactivado', '#95a5a6');
    cerrarModalFiesta();
}

function probarEfectoFiesta() {
    const frecuencia = parseFloat(document.getElementById('fiestaFreq').value);
    const colores = ['#FF0000', '#00FF00']; // Rojo y verde para prueba
    
    let colorIndex = 0;
    const demoInterval = setInterval(() => {
        // Cambiar fondo de la página
        document.body.style.background = colores[colorIndex];
        document.body.style.transition = 'background 0.3s';
        colorIndex = (colorIndex + 1) % colores.length;
    }, 1000 / frecuencia);
    
    // Detener después de 3 segundos
    setTimeout(() => {
        clearInterval(demoInterval);
        document.body.style.background = 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)';
        mostrarNotificacion('✅ Efecto probado correctamente', '#3498db');
    }, 3000);
}

function iniciarAnimacionFiesta(modo, frecuencia) {
    // Detener animación anterior si existe
    if (intervaloFiesta) {
        clearInterval(intervaloFiesta);
    }
    
    const colores = window.databaseSubte.sistemaFiesta.coloresFiesta[modo] || ['#FF0000', '#00FF00'];
    let colorIndex = 0;
    
    intervaloFiesta = setInterval(() => {
        // Cambiar fondo del dashboard
        const dashboard = document.getElementById('dashboard-content');
        if (dashboard) {
            dashboard.style.background = colores[colorIndex];
            dashboard.style.transition = 'background 0.5s';
        }
        
        colorIndex = (colorIndex + 1) % colores.length;
    }, 1000 / frecuencia);
}

function verificarModoFiestaActivo() {
    const fiestaActiva = window.databaseSubte.sistemaFiesta.obtenerModoFiestaActivo();
    if (fiestaActiva) {
        modoFiestaActivo = fiestaActiva;
        iniciarAnimacionFiesta(fiestaActiva.modo, fiestaActiva.frecuencia);
    }
}

// ========== FUNCIONES AUXILIARES ==========
function mostrarNotificacion(mensaje, color) {
    // Eliminar notificaciones anteriores
    const notifsAnteriores = document.querySelectorAll('.notification');
    notifsAnteriores.forEach(notif => notif.remove());
    
    // Crear nueva notificación
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.style.background = color;
    notif.textContent = mensaje;
    
    // Botón para cerrar
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
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (notif.parentElement) {
            notif.remove();
        }
    }, 5000);
}

function actualizarDatosAutomaticamente() {
    // Simular cambios automáticos en los datos
    datosEstaciones.forEach(estacion => {
        // 10% de probabilidad de cambio de estado
        if (Math.random() < 0.1) {
            if (estacion.conexion.estado === 'conectado') {
                estacion.conexion.estado = 'desconectado';
                estacion.conexion.wifi.señal = 0;
            } else {
                estacion.conexion.estado = 'conectado';
                estacion.conexion.wifi.señal = 60 + Math.random() * 40;
            }
        }
        
        // Variar batería si está conectada
        if (estacion.conexion.estado === 'conectado') {
            estacion.dispositivo.bateria += (Math.random() * 4 - 2);
            estacion.dispositivo.bateria = Math.max(0, Math.min(100, estacion.dispositivo.bateria));
            
            // Actualizar estado según batería
            if (estacion.dispositivo.bateria > 70) {
                estacion.dispositivo.estado = 'normal';
            } else if (estacion.dispositivo.bateria > 40) {
                estacion.dispositivo.estado = 'alerta';
            } else {
                estacion.dispositivo.estado = 'critico';
            }
        }
    });
    
    // Actualizar estadísticas y marcadores
    actualizarEstadisticasConexion();
    if (mapa) actualizarMarcadores();
}

// Inicializar cuando cargue la página
window.onload = function() {
    console.log('✅ Sistema de Control Subtes BA cargado');
    
    // Verificar si Leaflet está cargado
    if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }
// ========== SISTEMA DE CONFIGURACIÓN WIFI ESP32 ==========

function mostrarConfigWifiEstacion(estacionId) {
    const estacion = datosEstaciones.find(e => e.id === estacionId);
    if (!estacion) return;
    
    const modalHTML = `
        <div class="modal-backdrop">
            <div class="modal-content" style="max-width: 600px;">
                <h2 style="color: #1a237e; text-align: center;">📡 CONFIGURAR WIFI - ${estacion.nombre}</h2>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0;">
                    <!-- Información actual -->
                    <div style="padding: 20px; background: #f8f9fa; border-radius: 10px;">
                        <h3 style="color: #5c6bc0; margin-bottom: 15px;">};
