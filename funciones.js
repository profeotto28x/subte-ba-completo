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
                        <h3 style="color: #5c6bc0; margin-bottom: 15px;">// ========== SISTEMA DE CONFIGURACIÓN WIFI ESP32 ==========

function mostrarConfigWifiEstacion(estacionId) {
    const estacion = datosEstaciones.find(e => e.id === estacionId);
    if (!estacion) return;
    
    const modalHTML = `
        <div class="modal-backdrop">
            <div class="modal-content" style="max-width: 600px;">
                <h2 style="color: #1a237e; text-align: center;">📡 CONFIGURAR WIFI - ${estacion.nombre}</h2>
                <p style="text-align: center; color: #666; margin-bottom: 25px;">Línea ${estacion.linea} • ID: ${estacion.id}</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0;">
                    <!-- Información actual -->
                    <div style="padding: 20px; background: #f8f9fa; border-radius: 10px;">
                        <h3 style="color: #5c6bc0; margin-bottom: 15px;">📊 ESTADO ACTUAL</h3>
                        <p><strong>Conexión:</strong> <span style="color: ${estacion.conexion.estado === 'conectado' ? '#2ecc71' : '#e74c3c'}">${estacion.conexion.estado.toUpperCase()}</span></p>
                        <p><strong>Señal WiFi:</strong> ${estacion.conexion.wifi.señal}%</p>
                        <p><strong>IP asignada:</strong> ${estacion.conexion.wifi.ip || 'No asignada'}</p>
                        <p><strong>Batería:</strong> ${estacion.dispositivo.bateria}%</p>
                        <p><strong>SSID actual:</strong> ${estacion.conexion.wifi.ssid}</p>
                    </div>
                    
                    <!-- Configuración -->
                    <div style="padding: 20px; background: #f8f9fa; border-radius: 10px;">
                        <h3 style="color: #5c6bc0; margin-bottom: 15px;">⚙️ NUEVA CONFIGURACIÓN</h3>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: #5c6bc0;">Nombre red (SSID)</label>
                            <input type="text" id="wifi-ssid" placeholder="Ej: MiCasa_WiFi" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px;" value="${estacion.conexion.wifi.ssid}">
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: #5c6bc0;">Contraseña WiFi</label>
                            <input type="password" id="wifi-password" placeholder="Ingrese la contraseña" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px;">
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: #5c6bc0;">Modo conexión</label>
                            <select id="wifi-mode" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px;">
                                <option value="auto">Auto-conectar</option>
                                <option value="manual">Manual (solo cuando hay comandos)</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <!-- CÓDIGO QR PARA ESCANEAR -->
                <div style="text-align: center; margin: 25px 0; padding: 20px; background: #fff; border-radius: 10px; border: 2px dashed #ddd;">
                    <h3 style="color: #1a237e; margin-bottom: 15px;">📱 CÓDIGO QR PARA ESP32</h3>
                    <div id="qrcode-container" style="display: inline-block; padding: 15px; background: white; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
                        <div id="qrcode-${estacionId}" style="width: 200px; height: 200px; margin: 0 auto;"></div>
                    </div>
                    <p style="margin-top: 15px; color: #666; font-size: 0.9rem;">Escanear con celular para enviar configuración al ESP32</p>
                </div>
                
                <!-- BOTONES DE ACCIÓN -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 25px;">
                    <button onclick="probarConexionWifi('${estacionId}')" style="padding: 12px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        🔍 Probar conexión
                    </button>
                    
                    <button onclick="guardarConfigWifi('${estacionId}')" style="padding: 12px; background: #2ecc71; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        💾 Guardar configuración
                    </button>
                    
                    <button onclick="enviarConfigESP32('${estacionId}')" style="padding: 12px; background: #9b59b6; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        📤 Enviar a ESP32
                    </button>
                </div>
                
                <!-- REDES DISPONIBLES -->
                <div style="margin-top: 30px; padding: 20px; background: #f0f8ff; border-radius: 10px;">
                    <h3 style="color: #1a237e; margin-bottom: 15px;">📶 REDES WIFI DISPONIBLES CERCA</h3>
                    <div id="redes-disponibles-${estacionId}" style="max-height: 200px; overflow-y: auto;">
                        <p style="text-align: center; color: #666; padding: 20px;">Buscando redes disponibles...</p>
                    </div>
                    <button onclick="escanearRedes('${estacionId}')" style="margin-top: 15px; padding: 10px 20px; background: #1a237e; color: white; border: none; border-radius: 8px; cursor: pointer; width: 100%;">
                        🔄 Escanear redes nuevamente
                    </button>
                </div>
                
                <!-- BOTÓN CERRAR -->
                <div style="text-align: center; margin-top: 30px;">
                    <button onclick="cerrarModalWifi()" style="padding: 12px 40px; background: #666; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        ❌ Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Crear y mostrar modal
    const modal = document.createElement('div');
    modal.id = 'modal-wifi';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    
    // Generar código QR
    generarQRCode(estacionId, estacion);
    
    // Escanear redes disponibles
    setTimeout(() => escanearRedes(estacionId), 500);
}

function cerrarModalWifi() {
    const modal = document.getElementById('modal-wifi');
    if (modal) modal.remove();
}

function generarQRCode(estacionId, estacion) {
    const qrContainer = document.getElementById(`qrcode-${estacionId}`);
    if (!qrContainer) return;
    
    // Datos para el código QR
    const datosWifi = {
        estacion: estacion.id,
        nombre: estacion.nombre,
        ssid: estacion.conexion.wifi.ssid,
        timestamp: new Date().toISOString(),
        accion: "config_wifi"
    };
    
    const datosString = JSON.stringify(datosWifi);
    
    // Generar código QR simple (sin librería externa para demo)
    qrContainer.innerHTML = `
        <div style="width: 200px; height: 200px; display: grid; grid-template-columns: repeat(20, 1fr); grid-template-rows: repeat(20, 1fr);">
            ${Array.from({length: 400}).map((_, i) => {
                const row = Math.floor(i / 20);
                const col = i % 20;
                // Patrón simple de QR (en producción usar librería como qrcode.js)
                const shouldFill = (row + col) % 3 === 0 || 
                                  (row * col) % 7 === 0 ||
                                  (row + estacionId.charCodeAt(0)) % 5 === 0;
                return `<div style="background: ${shouldFill ? '#000' : '#fff'}; border: 1px solid #f0f0f0;"></div>`;
            }).join('')}
        </div>
        <div style="text-align: center; margin-top: 10px; font-size: 0.8rem; color: #666;">
            ID: ${estacion.id.substring(0, 8)}
        </div>
    `;
}

function escanearRedes(estacionId) {
    const container = document.getElementById(`redes-disponibles-${estacionId}`);
    if (!container) return;
    
    // Simular escaneo de redes (en producción sería una API real)
    const redesSimuladas = [
        { nombre: 'Fibertel_WiFi_2.4G', señal: 85, seguridad: 'WPA2', canal: 6 },
        { nombre: 'Personal_WiFi', señal: 72, seguridad: 'WPA2', canal: 11 },
        { nombre: 'SUBTE_ADMIN', señal: 95, seguridad: 'WPA2-Enterprise', canal: 1 },
        { nombre: 'Casa_Vecina', señal: 45, seguridad: 'WPA', canal: 3 },
        { nombre: 'Libre_BA', señal: 60, seguridad: 'Abierta', canal: 9 }
    ];
    
    container.innerHTML = redesSimuladas.map(red => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-bottom: 8px; background: white; border-radius: 8px; border-left: 4px solid ${red.señal > 70 ? '#2ecc71' : red.señal > 40 ? '#f39c12' : '#e74c3c'};">
            <div>
                <strong>${red.nombre}</strong><br>
                <small>Canal ${red.canal} • ${red.seguridad}</small>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: bold; color: ${red.señal > 70 ? '#2ecc71' : red.señal > 40 ? '#f39c12' : '#e74c3c'}">
                    ${red.señal}%
                </div>
                <button onclick="seleccionarRed('${estacionId}', '${red.nombre}')" style="margin-top: 5px; padding: 5px 10px; background: #1a237e; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                    Seleccionar
                </button>
            </div>
        </div>
    `).join('');
}

function seleccionarRed(estacionId, ssid) {
    document.getElementById('wifi-ssid').value = ssid;
    mostrarNotificacion(`✅ Red ${ssid} seleccionada`, '#2ecc71');
}

function probarConexionWifi(estacionId) {
    const ssid = document.getElementById('wifi-ssid').value;
    const password = document.getElementById('wifi-password').value;
    
    if (!ssid) {
        mostrarNotificacion('❌ Ingrese un SSID para probar', '#e74c3c');
        return;
    }
    
    // Simular prueba de conexión
    mostrarNotificacion(`🔍 Probando conexión a ${ssid}...`, '#3498db');
    
    setTimeout(() => {
        const exito = Math.random() > 0.3; // 70% de éxito
        if (exito) {
            mostrarNotificacion(`✅ Conexión exitosa a ${ssid}`, '#2ecc71');
            
            // Actualizar estado en la estación
            const estacion = datosEstaciones.find(e => e.id === estacionId);
            if (estacion) {
                estacion.conexion.estado = 'conectado';
                estacion.conexion.wifi.señal = 80 + Math.random() * 20;
                estacion.conexion.wifi.ip = `192.168.1.${Math.floor(100 + Math.random() * 155)}`;
                actualizarEstadisticasConexion();
                if (mapa) actualizarMarcadores();
            }
        } else {
            mostrarNotificacion(`❌ No se pudo conectar a ${ssid}`, '#e74c3c');
        }
    }, 2000);
}

function guardarConfigWifi(estacionId) {
    const ssid = document.getElementById('wifi-ssid').value;
    const password = document.getElementById('wifi-password').value;
    const modo = document.getElementById('wifi-mode').value;
    
    if (!ssid || !password) {
        mostrarNotificacion('❌ Complete SSID y contraseña', '#e74c3c');
        return;
    }
    
    // Guardar en la estación
    const estacion = datosEstaciones.find(e => e.id === estacionId);
    if (estacion) {
        estacion.conexion.wifi.ssid = ssid;
        estacion.conexion.wifi.modo = modo;
        
        // Guardar en localStorage para persistencia
        const configsGuardadas = JSON.parse(localStorage.getItem('subte-wifi-configs')) || {};
        configsGuardadas[estacionId] = {
            ssid: ssid,
            modo: modo,
            guardado: new Date().toISOString()
        };
        localStorage.setItem('subte-wifi-configs', JSON.stringify(configsGuardadas));
        
        mostrarNotificacion(`✅ Configuración WiFi guardada para ${estacion.nombre}`, '#2ecc71');
    }
}

function enviarConfigESP32(estacionId) {
    const ssid = document.getElementById('wifi-ssid').value;
    const password = document.getElementById('wifi-password').value;
    
    if (!ssid || !password) {
        mostrarNotificacion('❌ Complete SSID y contraseña', '#e74c3c');
        return;
    }
    
    // Simular envío a ESP32
    mostrarNotificacion('📤 Enviando configuración al ESP32...', '#9b59b6');
    
    // Datos que se enviarían al ESP32
    const datosESP32 = {
        comando: "CONFIG_WIFI",
        estacion: estacionId,
        wifi: {
            ssid: ssid,
            password: password,
            intentos_reconexion: 10,
            timeout: 30
        },
        timestamp: new Date().toISOString()
    };
    
    console.log('Datos para ESP32:', datosESP32);
    
    // Simular respuesta del ESP32 después de 2 segundos
    setTimeout(() => {
        const exito = Math.random() > 0.2; // 80% de éxito
        if (exito) {
            mostrarNotificacion('✅ Configuración recibida por ESP32', '#2ecc71');
            
            // Mostrar código de ejemplo para Arduino
            mostrarCodigoArduino(ssid, password, estacionId);
        } else {
            mostrarNotificacion('❌ Error al comunicar con ESP32', '#e74c3c');
        }
    }, 2000);
}

function mostrarCodigoArduino(ssid, password, estacionId) {
    const codigoHTML = `
        <div style="margin-top: 20px; padding: 20px; background: #2c3e50; border-radius: 10px; color: white; font-family: monospace; font-size: 0.9rem; overflow-x: auto;">
            <h4 style="color: #3498db; margin-bottom: 10px;">📟 CÓDIGO ARDUINO PARA ESP32</h4>
            <pre style="margin: 0; white-space: pre-wrap;">
// Configuración WiFi para ${estacionId}
const char* SSID = "${ssid}";
const char* PASSWORD = "${password}";

void setup() {
    Serial.begin(115200);
    
    // Conectar a WiFi
    WiFi.begin(SSID, PASSWORD);
    Serial.print("Conectando a ");
    Serial.println(SSID);
    
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    
    Serial.println("\\n¡Conectado!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
}

void loop() {
    // Tu código aquí
    delay(1000);
}
            </pre>
            <p style="margin-top: 10px; color: #95a5a6; font-size: 0.8rem;">
                Copiar este código en el Arduino IDE para programar el ESP32
            </p>
        </div>
    `;
    
    // Agregar al modal si existe
    const modal = document.getElementById('modal-wifi');
    if (modal) {
        const container = modal.querySelector('.modal-content');
        if (container) {
            // Buscar si ya existe una sección de código
            let codigoSection = container.querySelector('.codigo-arduino-section');
            if (!codigoSection) {
                codigoSection = document.createElement('div');
                codigoSection.className = 'codigo-arduino-section';
                container.appendChild(codigoSection);
            }
            codigoSection.innerHTML = codigoHTML;
        }
    }
}

// Modificar la función mostrarDetallesEstacion para agregar botón WiFi
// REEMPLAZÁ la función mostrarDetallesEstacion con esta versión mejorada:

function mostrarDetallesEstacion(estacionId) {
    const estacion = datosEstaciones.find(e => e.id === estacionId);
    if (!estacion) return;
    
    const detallesHTML = `
        <div style="min-width: 300px; padding: 15px;">
            <h3 style="color: #1a237e; margin-bottom: 10px;">🚇 ${estacion.nombre}</h3>
            <p><strong>📍 Línea:</strong> ${estacion.linea}</p>
            <p><strong>🔌 Estado:</strong> <span style="color: ${estacion.conexion.estado === 'conectado' ? '#2ecc71' : '#e74c3c'}">${estacion.conexion.estado.toUpperCase()}</span></p>
            <p><strong>📶 WiFi:</strong> ${estacion.conexion.wifi.señal}%</p>
            <p><strong>🔋 Batería:</strong> ${estacion.dispositivo.bateria}%</p>
            <p><strong>🌡️ Temp:</strong> ${estacion.dispositivo.temperatura.toFixed(1)}°C</p>
            <p><strong>📡 Red:</strong> ${estacion.conexion.wifi.ssid}</p>
            <p><strong>🏠 IP:</strong> ${estacion.conexion.wifi.ip || 'No asignada'}</p>
            
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button onclick="mostrarConfigWifiEstacion('${estacionId}')" style="flex: 1; padding: 10px; background: #1a237e; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    📡 Configurar WiFi
                </button>
                <button onclick="controlarLucesEstacion('${estacionId}')" style="flex: 1; padding: 10px; background: #f39c12; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    💡 Controlar Luces
                </button>
            </div>
        </div>
    `;
    
    // Mostrar como alerta personalizada
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
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
        max-height: 90vh;
        overflow-y: auto;
    `;
    
    alertDiv.innerHTML = detallesHTML;
    
    // Botón cerrar
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 15px;
        background: transparent;
        border: none;
        font-size: 1.5rem;
        color: #666;
        cursor: pointer;
        padding: 5px 10px;
    `;
    closeBtn.onclick = () => alertDiv.remove();
    
    // Fondo oscuro
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
        alertDiv.remove();
        backdrop.remove();
    };
    
    alertDiv.appendChild(closeBtn);
    document.body.appendChild(backdrop);
    document.body.appendChild(alertDiv);
}

function controlarLucesEstacion(estacionId) {
    const estacion = datosEstaciones.find(e => e.id === estacionId);
    if (!estacion) return;
    
    const estaEncendida = estacion.iluminacion.encendida;
    
    const controlHTML = `
        <div style="min-width: 300px; padding: 20px; text-align: center;">
            <h3 style="color: #1a237e; margin-bottom: 15px;">💡 Control de Luces</h3>
            <p style="margin-bottom: 20px;">${estacion.nombre} - Línea ${estacion.linea}</p>
            
            <div style="font-size: 4rem; margin: 20px 0; color: ${estaEncendida ? '#f39c12' : '#95a5a6'}">
                ${estaEncendida ? '💡' : '🌙'}
            </div>
            
            <p style="font-weight: bold; color: ${estaEncendida ? '#f39c12' : '#95a5a6'}">
                ${estaEncendida ? 'LUCES ENCENDIDAS' : 'LUCES APAGADAS'}
            </p>
            
            <div style="display: flex; gap: 10px; margin-top: 30px;">
                <button onclick="encenderLuzEstacion('${estacionId}')" style="flex: 1; padding: 12px; background: #2ecc71; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                    🔆 ENCENDER
                </button>
                <button onclick="apagarLuzEstacion('${estacionId}')" style="flex: 1; padding: 12px; background: #e74c3c; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                    🌙 APAGAR
                </button>
            </div>
            
            <div style="margin-top: 20px;">
                <button onclick="ponerEnModoAuto('${estacionId}')" style="width: 100%; padding: 10px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    🤖 MODO AUTOMÁTICO
                </button>
            </div>
        </div>
    `;
    
    // Mostrar modal similar al anterior
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
        z-index: 1001;
    `;
    modal.innerHTML = controlHTML;
    
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
    `;
    backdrop.onclick = () => {
        modal.remove();
        backdrop.remove();
    };
    
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
}

function encenderLuzEstacion(estacionId) {
    const estacion = datosEstaciones.find(e => e.id === estacionId);
    if (estacion) {
        estacion.iluminacion.encendida = true;
        estacion.iluminacion.modo = 'manual';
        mostrarNotificacion(`💡 Luces encendidas en ${estacion.nombre}`, '#f39c12');
    }
    // Cerrar modal automáticamente
    document.querySelectorAll('div[style*="fixed"]').forEach(el => {
        if (el.innerHTML.includes('Control de Luces')) {
            el.remove();
            document.querySelector('div[style*="background: rgba(0,0,0,0.5)"]').remove();
        }
    });
}

function apagarLuzEstacion(estacionId) {
    const estacion = datosEstaciones.find(e => e.id === estacionId);
    if (estacion) {
        estacion.iluminacion.encendida = false;
        estacion.iluminacion.modo = 'manual';
        mostrarNotificacion(`🌙 Luces apagadas en ${estacion.nombre}`, '#95a5a6');
    }
    // Cerrar modal
    document.querySelectorAll('div[style*="fixed"]').forEach(el => {
        if (el.innerHTML.includes('Control de Luces')) {
            el.remove();
            document.querySelector('div[style*="background: rgba(0,0,0,0.5)"]').remove();
        }
    });
}

function ponerEnModoAuto(estacionId) {
    const estacion = datosEstaciones.find(e => e.id === estacionId);
    if (estacion) {
        estacion.iluminacion.modo = 'auto';
        mostrarNotificacion(`🤖 Modo automático activado en ${estacion.nombre}`, '#3498db');
    }
    // Cerrar modal
    document.querySelectorAll('div[style*="fixed"]').forEach(el => {
        if (el.innerHTML.includes('Control de Luces')) {
            el.remove();
            document.querySelector('div[style*="background: rgba(0,0,0,0.5)"]').remove();
        }
    });
}

// Cargar configuraciones guardadas al iniciar
function cargarConfiguracionesGuardadas() {
    const configs = JSON.parse(localStorage.getItem('subte-wifi-configs')) || {};
    Object.keys(configs).forEach(estacionId => {
        const estacion = datosEstaciones.find(e => e.id === estacionId);
        if (estacion && configs[estacionId].ssid) {
            estacion.conexion.wifi.ssid = configs[estacionId].ssid;
            estacion.conexion.wifi.modo = configs[estacionId].modo || 'auto';
        }
    });
}

// Modificar la función inicializarSistema para cargar configuraciones
// BUSCÁ esta línea en inicializarSistema:
//     // 5. Iniciar actualizaciones automáticas
// Y AGREGÁ esto ANTES:

//     // 5. Cargar configuraciones WiFi guardadas
//     cargarConfiguracionesGuardadas();
//     
//     // 6. Iniciar actualizaciones automáticas

// La función inicializarSistema debería quedar así:
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
    
    // 5. Cargar configuraciones WiFi guardadas
    cargarConfiguracionesGuardadas();
    
    // 6. Iniciar actualizaciones automáticas
    setInterval(actualizarDatosAutomaticamente, 10000);
}};
