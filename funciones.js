v// funciones.js - VERSIÓN CORREGIDA Y FUNCIONAL

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
    console.log('✅ Inicializando sistema...');
    
    // 1. Cargar datos de estaciones
    cargarDatosEstaciones();
    
    // 2. Actualizar estadísticas
    actualizarEstadisticasConexion();
    
    // 3. Inicializar mapa
    setTimeout(() => {
        if (typeof L !== 'undefined') {
            initMap();
        } else {
            console.log('⚠️ Leaflet no está cargado');
        }
    }, 1000);
    
    // 4. Verificar modo fiesta activo
    verificarModoFiestaActivo();
    
    // 5. Iniciar actualizaciones automáticas
    setInterval(actualizarDatosAutomaticamente, 10000);
    
    console.log('✅ Sistema inicializado correctamente');
}

function cargarDatosEstaciones() {
    if (window.databaseSubte && window.databaseSubte.generarDatosEstadoInicial) {
        datosEstaciones = window.databaseSubte.generarDatosEstadoInicial();
        console.log(`✅ Cargadas ${datosEstaciones.length} estaciones`);
    } else {
        console.log('⚠️ databaseSubte no está disponible, usando datos de prueba');
        datosEstaciones = [
            {
                id: 'A-01',
                nombre: 'Plaza de Mayo',
                linea: 'A',
                lat: -34.6083,
                lon: -58.3712,
                conexion: { estado: 'conectado', wifi: { señal: 85, ssid: 'SUBTE_A_01', ip: '192.168.1.100' } },
                dispositivo: { bateria: 90, estado: 'normal', temperatura: 26.5 }
            },
            {
                id: 'B-06',
                nombre: 'Plaza Once',
                linea: 'B',
                lat: -34.6060,
                lon: -58.4030,
                conexion: { estado: 'conectado', wifi: { señal: 78, ssid: 'SUBTE_B_06', ip: '192.168.1.106' } },
                dispositivo: { bateria: 65, estado: 'alerta', temperatura: 28.2 }
            }
        ];
    }
}

// ========== SISTEMA DE CONEXIÓN WIFI ==========
function actualizarEstadisticasConexion() {
    if (!datosEstaciones.length) {
        console.log('⚠️ No hay datos de estaciones');
        return;
    }
    
    const total = datosEstaciones.length;
    const conectadas = datosEstaciones.filter(e => e.conexion.estado === 'conectado').length;
    const porcentaje = Math.round((conectadas / total) * 100);
    
    // Actualizar números
    const wifiConnected = document.getElementById('wifi-connected');
    const wifiDisconnected = document.getElementById('wifi-disconnected');
    const wifiPercentage = document.getElementById('wifi-percentage');
    
    if (wifiConnected) wifiConnected.textContent = conectadas;
    if (wifiDisconnected) wifiDisconnected.textContent = total - conectadas;
    if (wifiPercentage) wifiPercentage.textContent = `${porcentaje}%`;
    
    // Actualizar estado general
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
    console.log('🔌 Conectando todas las estaciones...');
    
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
    const botones = document.querySelectorAll('.map-btn');
    if (botones.length > 0 && event && event.target) {
        botones.forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }
    
    mostrarNotificacion(`🗺️ Mostrando: ${tipo === 'todas' ? 'Todas las estaciones' : 'Línea ' + tipo}`, '#3498db');
}

// ========== MAPA INTERACTIVO ==========
function initMap() {
    console.log('🗺️ Inicializando mapa...');
    
    // Verificar si el contenedor del mapa existe
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.log('❌ No se encontró el contenedor del mapa');
        return;
    }
    
    // Crear mapa centrado en Buenos Aires
    mapa = L.map('map').setView([-34.6037, -58.3816], 13);
    
    // Agregar capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(mapa);
    
    // Agregar marcadores
    actualizarMarcadores();
    
    console.log('✅ Mapa inicializado correctamente');
}

function actualizarMarcadores() {
    if (!mapa) {
        console.log('⚠️ Mapa no está inicializado');
        return;
    }
    
    // Limpiar marcadores anteriores
    if (marcadores.length > 0) {
        marcadores.forEach(marker => mapa.removeLayer(marker));
        marcadores = [];
    }
    
    // Verificar que hay datos
    if (!datosEstaciones || datosEstaciones.length === 0) {
        console.log('⚠️ No hay datos de estaciones para mostrar');
        return;
    }
    
    // Agregar nuevos marcadores
    datosEstaciones.forEach(estacion => {
        // Verificar que la estación tenga coordenadas
        if (!estacion.lat || !estacion.lon) {
            console.log(`⚠️ Estación ${estacion.nombre} no tiene coordenadas`);
            return;
        }
        
        // Determinar color según estado
        let color, estadoTexto;
        if (estacion.dispositivo && estacion.dispositivo.estado) {
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
        } else {
            color = '#95a5a6';
            estadoTexto = '🔌 Desconocido';
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
                📶 WiFi: ${estacion.conexion?.wifi?.señal || 0}%<br>
                🔋 Batería: ${estacion.dispositivo?.bateria || 0}%<br>
                <button onclick="mostrarDetallesEstacion('${estacion.id}')" style="margin-top: 8px; padding: 6px 12px; background: #1a237e; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Ver detalles
                </button>
            `);
        
        marcadores.push(marker);
    });
    
    console.log(`✅ ${marcadores.length} marcadores agregados al mapa`);
}

function mostrarDetallesEstacion(estacionId) {
    const estacion = datosEstaciones.find(e => e.id === estacionId);
    if (!estacion) {
        mostrarNotificacion('❌ No se encontró la estación', '#e74c3c');
        return;
    }
    
    const detallesHTML = `
        <div style="min-width: 300px; padding: 20px;">
            <h3 style="color: #1a237e; margin-bottom: 15px;">🚇 ${estacion.nombre}</h3>
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
            
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="this.parentElement.parentElement.parentElement.remove(); document.querySelector('div[style*=\"background: rgba(0,0,0,0.5)\"]').remove()" style="padding: 8px 20px; background: #666; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    ❌ Cerrar
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
    
    document.body.appendChild(backdrop);
    document.body.appendChild(alertDiv);
}

// ========== SISTEMA DE FIESTAS ==========
function mostrarPanelFiestas() {
    console.log('🎉 Mostrando panel de fiestas...');
    
    const modalHTML = `
        <div class="modal-backdrop">
            <div class="modal-content" style="max-width: 500px;">
                <h2 style="color: #1a237e; text-align: center;">🎉 MODO FIESTA</h2>
                <p style="text-align: center; color: #666; margin-bottom: 25px;">Seleccione un efecto de luces</p>
                
                <div style="margin: 20px 0;">
                    <button onclick="activarFiesta('navidad')" style="width: 100%; padding: 15px; background: #FF0000; color: white; border: none; border-radius: 8px; margin-bottom: 10px; cursor: pointer; font-weight: bold;">
                        🎄 ACTIVAR NAVIDAD
                    </button>
                    <p style="font-size: 0.9rem; color: #666; text-align: center;">Rojo y verde alternante</p>
                </div>
                
                <div style="margin: 20px 0; padding: 20px; background: #f0f8ff; border-radius: 10px;">
                    <h3 style="color: #1a237e; margin-bottom: 10px;">🇦🇷 DÍA DE LA INDEPENDENCIA</h3>
                    <p style="margin-bottom: 15px;">Celeste y blanco patriótico</p>
                    <button onclick="activarFiesta('independencia')" style="width: 100%; padding: 15px; background: #75AADB; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                        🇦🇷 ACTIVAR INDEPENDENCIA
                    </button>
                </div>
                
                <div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <h3 style="color: #1a237e; margin-bottom: 10px;">⚙️ CONFIGURACIÓN</h3>
                    
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
                    ${modoFiestaActivo.modo ? modoFiestaActivo.modo.toUpperCase() : 'DESCONOCIDO'} - ${modoFiestaActivo.frecuencia || 1}Hz
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
    console.log(`🎉 Activando modo fiesta: ${modo}`);
    
    const frecuenciaInput = document.getElementById('fiestaFreq');
    const duracionInput = document.getElementById('fiestaDuration');
    
    if (!frecuenciaInput || !duracionInput) {
        mostrarNotificacion('❌ No se pudo leer la configuración', '#e74c3c');
        return;
    }
    
    const frecuencia = parseFloat(frecuenciaInput.value);
    const duracion = parseInt(duracionInput.value);
    
    // Activar en todas las estaciones
    datosEstaciones.forEach(estacion => {
        if (!estacion.iluminacion) {
            estacion.iluminacion = {};
        }
        estacion.iluminacion.modo = 'fiesta';
        estacion.iluminacion.fiesta = {
            modo: modo,
            frecuencia: frecuencia,
            activo: true
        };
    });
    
    // Guardar configuración
    modoFiestaActivo = {
        modo: modo,
        frecuencia: frecuencia,
        activo: true,
        inicio: new Date().toISOString()
    };
    
    // Iniciar animación
    iniciarAnimacionFiesta(modo, frecuencia);
    
    // Mostrar notificación
    mostrarNotificacion(`🎉 Modo ${modo.toUpperCase()} activado!`, '#2ecc71');
    
    // Cerrar modal
    cerrarModalFiesta();
}

function desactivarFiesta() {
    console.log('⏹️ Desactivando modo fiesta');
    
    datosEstaciones.forEach(estacion => {
        if (estacion.iluminacion) {
            estacion.iluminacion.modo = 'normal';
            if (estacion.iluminacion.fiesta) {
                estacion.iluminacion.fiesta.activo = false;
            }
        }
    });
    
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
    console.log('🔦 Probando efecto de fiesta');
    
    const frecuenciaInput = document.getElementById('fiestaFreq');
    if (!frecuenciaInput) {
        mostrarNotificacion('❌ No se pudo leer la frecuencia', '#e74c3c');
        return;
    }
    
    const frecuencia = parseFloat(frecuenciaInput.value);
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
    console.log(`🎬 Iniciando animación: ${modo} a ${frecuencia}Hz`);
    
    // Detener animación anterior si existe
    if (intervaloFiesta) {
        clearInterval(intervaloFiesta);
    }
    
    const colores = modo === 'independencia' ? ['#75AADB', '#FFFFFF'] : ['#FF0000', '#00FF00'];
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
    console.log('🔍 Verificando modo fiesta activo...');
    // Por ahora siempre devuelve null, en una versión completa leería de localStorage
    modoFiestaActivo = null;
}

// ========== CONFIGURACIÓN WIFI (versión simplificada) ==========
function mostrarConfigWifiEstacion(estacionId) {
    console.log(`📡 Mostrando configuración WiFi para: ${estacionId}`);
    
    const estacion = datosEstaciones.find(e => e.id === estacionId);
    if (!estacion) {
        mostrarNotificacion('❌ No se encontró la estación', '#e74c3c');
        return;
    }
    
    const modalHTML = `
        <div class="modal-backdrop">
            <div class="modal-content" style="max-width: 500px;">
                <h2 style="color: #1a237e; text-align: center;">📡 CONFIGURAR WIFI</h2>
                <p style="text-align: center; color: #666; margin-bottom: 20px;">${estacion.nombre} - Línea ${estacion.linea}</p>
                
                <div style="padding: 20px; background: #f8f9fa; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="color: #5c6bc0; margin-bottom: 15px;">⚙️ CONFIGURACIÓN ACTUAL</h3>
                    <p><strong>SSID:</strong> ${estacion.conexion.wifi.ssid}</p>
                    <p><strong>Estado:</strong> ${estacion.conexion.estado}</p>
                    <p><strong>Señal:</strong> ${estacion.conexion.wifi.señal}%</p>
                    <p><strong>IP:</strong> ${estacion.conexion.wifi.ip || 'No asignada'}</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; color: #5c6bc0;">Nuevo SSID:</label>
                    <input type="text" id="nuevo-ssid" placeholder="Nombre de la red WiFi" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px;" value="${estacion.conexion.wifi.ssid}">
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; color: #5c6bc0;">Contraseña:</label>
                    <input type="password" id="nuevo-password" placeholder="Contraseña WiFi" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px;">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 30px;">
                    <button onclick="probarConexionWifiSimple('${estacionId}')" style="padding: 12px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        🔍 Probar
                    </button>
                    
                    <button onclick="guardarConfigWifiSimple('${estacionId}')" style="padding: 12px; background: #2ecc71; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        💾 Guardar
                    </button>
                </div>
                
                <div style="text-align: center; margin-top: 25px;">
                    <button onclick="cerrarModalWifi()" style="padding: 10px 30px; background: #666; color: white; border: none; border-radius: 8px; cursor: pointer;">
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
}

function cerrarModalWifi() {
    const modal = document.getElementById('modal-wifi');
    if (modal) modal.remove();
}

function probarConexionWifiSimple(estacionId) {
    const ssidInput = document.getElementById('nuevo-ssid');
    if (!ssidInput || !ssidInput.value) {
        mostrarNotificacion('❌ Ingrese un SSID para probar', '#e74c3c');
        return;
    }
    
    const ssid = ssidInput.value;
    mostrarNotificacion(`🔍 Probando conexión a ${ssid}...`, '#3498db');
    
    // Simular prueba de conexión
    setTimeout(() => {
        const exito = Math.random() > 0.3; // 70% de éxito
        if (exito) {
            mostrarNotificacion(`✅ Conexión exitosa a ${ssid}`, '#2ecc71');
        } else {
            mostrarNotificacion(`❌ No se pudo conectar a ${ssid}`, '#e74c3c');
        }
    }, 2000);
}

function guardarConfigWifiSimple(estacionId) {
    const ssidInput = document.getElementById('nuevo-ssid');
    const passwordInput = document.getElementById('nuevo-password');
    
    if (!ssidInput || !ssidInput.value || !passwordInput || !passwordInput.value) {
        mostrarNotificacion('❌ Complete SSID y contraseña', '#e74c3c');
        return;
    }
    
    const estacion = datosEstaciones.find(e => e.id === estacionId);
    if (estacion) {
        estacion.conexion.wifi.ssid = ssidInput.value;
        mostrarNotificacion(`✅ Configuración WiFi guardada para ${estacion.nombre}`, '#2ecc71');
        cerrarModalWifi();
    }
}

function controlarLucesEstacion(estacionId) {
    console.log(`💡 Controlando luces de: ${estacionId}`);
    
    const estacion = datosEstaciones.find(e => e.id === estacionId);
    if (!estacion) {
        mostrarNotificacion('❌ No se encontró la estación', '#e74c3c');
        return;
    }
    
    // Toggle del estado de luces
    if (!estacion.iluminacion) {
        estacion.iluminacion = {};
    }
    
    const nuevaEstado = !estacion.iluminacion.encendida;
    estacion.iluminacion.encendida = nuevaEstado;
    estacion.iluminacion.modo = 'manual';
    
    mostrarNotificacion(
        nuevaEstado ? `💡 Luces encendidas en ${estacion.nombre}` : `🌙 Luces apagadas en ${estacion.nombre}`,
        nuevaEstado ? '#f39c12' : '#95a5a6'
    );
}

// ========== FUNCIONES AUXILIARES ==========
function mostrarNotificacion(mensaje, color) {
    console.log(`📢 Notificación: ${mensaje}`);
    
    // Eliminar notificaciones anteriores
    const notifsAnteriores = document.querySelectorAll('.notification-custom');
    notifsAnteriores.forEach(notif => notif.remove());
    
    // Crear nueva notificación
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
    if (!datosEstaciones || datosEstaciones.length === 0) return;
    
    datosEstaciones.forEach(estacion => {
        // 10% de probabilidad de cambio de estado
        if (Math.random() < 0.1) {
            if (estacion.conexion.estado === 'conectado') {
                estacion.conexion.estado = 'desconectado';
                if (estacion.conexion.wifi) {
                    estacion.conexion.wifi.señal = 0;
                }
            } else {
                estacion.conexion.estado = 'conectado';
                if (estacion.conexion.wifi) {
                    estacion.conexion.wifi.señal = 60 + Math.random() * 40;
                }
            }
        }
        
        // Variar batería si está conectada
        if (estacion.conexion.estado === 'conectado' && estacion.dispositivo) {
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

// ========== INICIALIZACIÓN AUTOMÁTICA ==========
console.log('✅ Sistema de Control Subtes BA - funciones.js cargado');

// Verificar si Leaflet está cargado
if (!document.querySelector('link[href*="leaflet"]')) {
    console.log('📦 Cargando Leaflet CSS...');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    
    // También cargar el JS si no está
    if (!window.L) {
        console.log('📦 Cargando Leaflet JS...');
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
            console.log('✅ Leaflet cargado, inicializando mapa...');
