// ========== VARIABLES GLOBALES ==========
let datosEstaciones = [];
let mapa = null;
let marcadores = [];
let filtroActual = 'todas';
let intervaloFiesta = null;

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
    if (intervaloFiesta) {
        clearInterval(intervaloFiesta);
        intervaloFiesta = null;
    }
    document.getElementById('dashboard-content').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
}

// ========== INICIALIZACIÓN ==========
function iniciarSistema() {
    console.log('✅ Sistema iniciado');
    cargarDatosCompletos();
    actualizarEstadisticas();
    setTimeout(initMap, 600);
    setInterval(actualizarDatosSimulados, 30000);
}

// ========== CARGA DE DATOS COMPLETOS ==========
function cargarDatosCompletos() {
    datosEstaciones = [
        // Línea A
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
        // Línea B
        { id: 'B-01', nombre: 'Leandro N. Alem', linea: 'B', lat: -34.6020, lon: -58.3705, estadoLuces: false, bateria: 93, paneles: 88, regulador: 'OK', wifi: { ssid: 'SUBTE_B_01', señal: 90 } },
        { id: 'B-02', nombre: 'Florida', linea: 'B', lat: -34.6035, lon: -58.3720, estadoLuces: true, bateria: 78, paneles: 72, regulador: 'OK', wifi: { ssid: 'SUBTE_B_02', señal: 80 } },
        { id: 'B-03', nombre: 'Carlos Pellegrini', linea: 'B', lat: -34.6040, lon: -58.3740, estadoLuces: true, bateria: 88, paneles: 85, regulador: 'OK', wifi: { ssid: 'SUBTE_B_03', señal: 86 } },
        { id: 'B-04', nombre: 'Uruguay', linea: 'B', lat: -34.6045, lon: -58.3755, estadoLuces: false, bateria: 79, paneles: 74, regulador: 'OK', wifi: { ssid: 'SUBTE_B_04', señal: 77 } },
        { id: 'B-05', nombre: 'Callao', linea: 'B', lat: -34.6050, lon: -58.3770, estadoLuces: true, bateria: 96, paneles: 92, regulador: 'OK', wifi: { ssid: 'SUBTE_B_05', señal: 94 } },
        { id: 'B-06', nombre: 'Pueyrredón (Plaza Once)', linea: 'B', lat: -34.6060, lon: -58.4030, estadoLuces: true, bateria: 68, paneles: 59, regulador: '⚠️ Bajo', wifi: { ssid: 'SUBTE_B_06', señal: 71 } },
        { id: 'B-07', nombre: 'Carlos Gardel', linea: 'B', lat: -34.6070, lon: -58.4080, estadoLuces: false, bateria: 82, paneles: 77, regulador: 'OK', wifi: { ssid: 'SUBTE_B_07', señal: 79 } },
        // Línea C
        { id: 'C-01', nombre: 'Retiro', linea: 'C', lat: -34.5915, lon: -58.3755, estadoLuces: true, bateria: 97, paneles: 94, regulador: 'OK', wifi: { ssid: 'SUBTE_C_01', señal: 95 } },
        { id: 'C-02', nombre: 'General San Martín', linea: 'C', lat: -34.5950, lon: -58.3760, estadoLuces: true, bateria: 85, paneles: 81, regulador: 'OK', wifi: { ssid: 'SUBTE_C_02', señal: 82 } },
        { id: 'C-03', nombre: 'Lavalle', linea: 'C', lat: -34.5970, lon: -58.3770, estadoLuces: false, bateria: 74, paneles: 66, regulador: 'OK', wifi: { ssid: 'SUBTE_C_03', señal: 68 } },
        { id: 'C-04', nombre: 'Diagonal Norte', linea: 'C', lat: -34.6030, lon: -58.3780, estadoLuces: true, bateria: 88, paneles: 83, regulador: 'OK', wifi: { ssid: 'SUBTE_C_04', señal: 86 } },
        { id: 'C-05', nombre: 'Avenida de Mayo', linea: 'C', lat: -34.6085, lon: -58.3790, estadoLuces: true, bateria: 90, paneles: 86, regulador: 'OK', wifi: { ssid: 'SUBTE_C_05', señal: 88 } },
        { id: 'C-06', nombre: 'Moreno', linea: 'C', lat: -34.6105, lon: -58.3805, estadoLuces: false, bateria: 69, paneles: 61, regulador: '⚠️ Revisar', wifi: { ssid: 'SUBTE_C_06', señal: 0 } },
        { id: 'C-07', nombre: 'Independencia', linea: 'C', lat: -34.6150, lon: -58.3820, estadoLuces: true, bateria: 86, paneles: 82, regulador: 'OK', wifi: { ssid: 'SUBTE_C_07', señal: 80 } },
        { id: 'C-08', nombre: 'San Juan', linea: 'C', lat: -34.6200, lon: -58.3835, estadoLuces: false, bateria: 29, paneles: 9, regulador: 'FALLA', wifi: { ssid: 'SUBTE_C_08', señal: 0 } },
        { id: 'C-09', nombre: 'Constitución', linea: 'C', lat: -34.6270, lon: -58.3805, estadoLuces: true, bateria: 95, paneles: 91, regulador: 'OK', wifi: { ssid: 'SUBTE_C_09', señal: 93 } }
    ];
    console.log(`✅ Cargadas ${datosEstaciones.length} estaciones`);
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
    
    filtradas.forEach(e => {
        let color;
        if (e.wifi.señal === 0) {
            color = '#95a5a6';
        } else if (e.bateria > 70) {
            color = '#2ecc71';
        } else if (e.bateria > 40) {
            color = '#f39c12';
        } else {
            color = '#e74c3c';
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

// ========== ESTADÍSTICAS ==========
function actualizarEstadisticas() {
    let total = datosEstaciones.length;
    let conectadas = datosEstaciones.filter(e => e.wifi.señal > 0).length;
    let lucesEncendidas = datosEstaciones.filter(e => e.estadoLuces).length;
    
    document.getElementById('wifi-connected').innerText = conectadas;
    document.getElementById('wifi-disconnected').innerText = total - conectadas;
    document.getElementById('wifi-percentage').innerText = Math.round((conectadas / total) * 100) + '%';
    
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

// ========== CONTROL GLOBAL ==========
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

function encenderTodasLasLuces() {
    datosEstaciones.forEach(e => {
        if (e.wifi.señal > 0) e.estadoLuces = true;
    });
    actualizarMarcadores();
    actualizarEstadisticas();
    mostrarNotificacion('💡 Todas las luces encendidas', '#f39c12');
}

function apagarTodasLasLuces() {
    datosEstaciones.forEach(e => {
        e.estadoLuces = false;
    });
    actualizarMarcadores();
    actualizarEstadisticas();
    mostrarNotificacion('🌙 Todas las luces apagadas', '#95a5a6');
}

// ========== 🎉 MODO FIESTA SIMPLIFICADO ==========
function mostrarPanelFiestas() {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.onclick = () => modal.remove();

    const contenido = document.createElement('div');
    contenido.className = 'modal-content';
    contenido.onclick = e => e.stopPropagation();
    contenido.innerHTML = `
        <h2 style="color:#1a237e; text-align:center; margin-bottom:20px;">🎉 MODO FIESTA</h2>
        <p style="text-align:center; color:#666; margin-bottom:20px;">Configurá el parpadeo de las luces</p>
        
        <div style="background:#f8f9fa; padding:20px; border-radius:15px; margin-bottom:20px;">
            <h3 style="color:#1a237e; margin-bottom:15px;">⏱️ DURACIÓN</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
                <button class="duracion-btn" onclick="seleccionarDuracion(30, this)">30 seg</button>
                <button class="duracion-btn" onclick="seleccionarDuracion(60, this)">1 min</button>
                <button class="duracion-btn" onclick="seleccionarDuracion(300, this)">5 min</button>
                <button class="duracion-btn" onclick="seleccionarDuracion(0, this)">∞ Manual</button>
            </div>
            <div>
                <label style="color:#5c6bc0;">O personalizado (segundos):</label>
                <input type="number" id="duracionPersonalizada" min="5" max="7200" placeholder="Ej: 120" style="width:100%; padding:10px; border:2px solid #ddd; border-radius:6px; margin-top:5px;">
            </div>
        </div>

        <div style="background:#f8f9fa; padding:20px; border-radius:15px; margin-bottom:20px;">
            <h3 style="color:#1a237e; margin-bottom:15px;">⚡ VELOCIDAD DE INTERMITENCIA</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
                <button class="velocidad-btn" onclick="seleccionarVelocidad(0.5, this)">🐢 Lenta (0.5 Hz)</button>
                <button class="velocidad-btn" onclick="seleccionarVelocidad(1, this)">⚡ Normal (1 Hz)</button>
                <button class="velocidad-btn" onclick="seleccionarVelocidad(2, this)">🚀 Rápida (2 Hz)</button>
                <button class="velocidad-btn" onclick="seleccionarVelocidad(5, this)">💨 Muy rápida (5 Hz)</button>
            </div>
            <div>
                <label style="color:#5c6bc0;">Velocidad personalizada (Hz):</label>
                <input type="number" id="velocidadPersonalizada" min="0.2" max="10" step="0.1" placeholder="Ej: 1.5" style="width:100%; padding:10px; border:2px solid #ddd; border-radius:6px; margin-top:5px;">
            </div>
            <div style="margin-top:10px; text-align:center;">
                <span style="background:#1a237e; color:white; padding:5px 15px; border-radius:20px; font-size:0.9rem;">
                    Intervalo: <span id="intervaloDisplay">1000</span> ms
                </span>
            </div>
        </div>

        <div style="display:flex; gap:15px; margin-top:25px;">
            <button onclick="iniciarFiesta()" style="flex:2; padding:15px; background:#2ecc71; color:white; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">
                🎉 INICIAR FIESTA
            </button>
            <button onclick="detenerFiesta(); modal.remove();" style="flex:1; padding:15px; background:#e74c3c; color:white; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">
                ⏹️ DETENER
            </button>
            <button onclick="modal.remove()" style="flex:1; padding:15px; background:#666; color:white; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">
                ❌ CANCELAR
            </button>
        </div>
    `;

    modal.appendChild(contenido);
    document.body.appendChild(modal);

    // Estilos para botones del modal
    const style = document.createElement('style');
    style.innerHTML = `
        .duracion-btn, .velocidad-btn {
            padding: 12px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
            color: white;
        }
        .duracion-btn { background: #1a237e; }
        .velocidad-btn { background: #5c6bc0; }
        .duracion-btn:hover, .velocidad-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        }
        .duracion-btn.seleccionado, .velocidad-btn.seleccionado {
            border: 4px solid #f39c12;
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);

    // Valores por defecto
    window.duracionFiesta = 60;
    window.velocidadFiesta = 1;
    
    setTimeout(() => {
        const btnDuracion = document.querySelector('.duracion-btn[onclick*="60"]');
        if (btnDuracion) btnDuracion.classList.add('seleccionado');
        
        const btnVelocidad = document.querySelector('.velocidad-btn[onclick*="1"]');
        if (btnVelocidad) btnVelocidad.classList.add('seleccionado');
    }, 100);
}

function seleccionarDuracion(segundos, btn) {
    window.duracionFiesta = segundos;
    document.querySelectorAll('.duracion-btn').forEach(b => b.classList.remove('seleccionado'));
    btn.classList.add('seleccionado');
    document.getElementById('duracionPersonalizada').value = '';
}

function seleccionarVelocidad(velocidad, btn) {
    window.velocidadFiesta = velocidad;
    document.querySelectorAll('.velocidad-btn').forEach(b => b.classList.remove('seleccionado'));
    btn.classList.add('seleccionado');
    document.getElementById('velocidadPersonalizada').value = '';
    document.getElementById('intervaloDisplay').innerText = Math.round(1000 / velocidad);
}

function iniciarFiesta() {
    // Leer valores personalizados
    const durPersonalizada = document.getElementById('duracionPersonalizada')?.value;
    if (durPersonalizada && durPersonalizada > 0) {
        window.duracionFiesta = parseInt(durPersonalizada);
    }
    
    const velPersonalizada = document.getElementById('velocidadPersonalizada')?.value;
    if (velPersonalizada && velPersonalizada > 0) {
        window.velocidadFiesta = parseFloat(velPersonalizada);
    }

    const duracion = window.duracionFiesta || 60;
    const velocidad = window.velocidadFiesta || 1;

    // Guardar estados originales de luces
    window.estadosOriginales = datosEstaciones.map(e => e.estadoLuces);

    // Detener fiesta anterior si existe
    if (intervaloFiesta) {
        clearInterval(intervaloFiesta);
    }

    // Iniciar nueva fiesta (simple intermitencia)
    let encendido = false;
    intervaloFiesta = setInterval(() => {
        encendido = !encendido;
        
        // Aplicar a todas las estaciones conectadas
        datosEstaciones.forEach(e => {
            if (e.wifi.señal > 0) {
                e.estadoLuces = encendido;
            }
        });
        
        // Actualizar estadísticas y mapa
        actualizarMarcadores();
        actualizarEstadisticas();
        
    }, 1000 / velocidad);

    // Mostrar notificación
    const duracionTexto = duracion === 0 ? 'manual' : duracion + ' segundos';
    mostrarNotificacion(`🎉 Fiesta iniciada: ${velocidad}Hz, ${duracionTexto}`, '#9b59b6');

    // Programar fin si duración es > 0
    if (duracion > 0) {
        setTimeout(() => {
            detenerFiesta();
        }, duracion * 1000);
    }

    // Cerrar modal
    document.querySelector('.modal-backdrop')?.remove();
}

function detenerFiesta() {
    if (intervaloFiesta) {
        clearInterval(intervaloFiesta);
        intervaloFiesta = null;
    }
    
    // Restaurar fondo normal
    document.body.style.background = 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)';
    
    // Restaurar estados originales
    if (window.estadosOriginales) {
        datosEstaciones.forEach((e, i) => {
            if (i < window.estadosOriginales.length) {
                e.estadoLuces = window.estadosOriginales[i];
            }
        });
    } else {
        datosEstaciones.forEach(e => e.estadoLuces = false);
    }
    
    actualizarMarcadores();
    actualizarEstadisticas();
    mostrarNotificacion('⏹️ Modo fiesta detenido', '#95a5a6');
}

// ========== PANEL DE CONTROL INDIVIDUAL ==========
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
        </div>

        <div style="text-align:center; margin-top:20px;">
            <button class="close-btn" onclick="modal.remove()">CERRAR</button>
        </div>
    `;

    modal.appendChild(contenido);
    document.body.appendChild(modal);
}

// ========== CONTROL INDIVIDUAL ==========
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

// ========== NOTIFICACIONES ==========
function mostrarNotificacion(msg, color) {
    const n = document.createElement('div');
    n.className = 'notificacion';
    n.style.background = color;
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 3000);
}

// ========== SIMULACIÓN ==========
function actualizarDatosSimulados() {
    datosEstaciones.forEach(e => {
        if (Math.random() > 0.9) {
            e.wifi.señal = e.wifi.señal > 0 ? 0 : 80;
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

// CSS adicional
const style = document.createElement('style');
style.innerHTML = `
    .info-box { background:white; padding:15px; border-radius:10px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.05); }
    .info-box span { display:block; font-size:0.9rem; color:#5c6bc0; }
    .info-box strong { font-size:1.4rem; color:#1a237e; }
    .btn-on { flex:1; background:#2ecc71; color:white; padding:12px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; }
    .btn-off { flex:1; background:#e74c3c; color:white; padding:12px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; }
    .close-btn { background:#666; color:white; padding:10px 30px; border:none; border-radius:8px; cursor:pointer; }
    .map-btn.active { background:#2ecc71 !important; }
    .notificacion { position:fixed; top:20px; right:20px; color:white; padding:15px 25px; border-radius:10px; z-index:3000; font-weight:bold; animation:slideIn 0.5s; box-shadow:0 5px 15px rgba(0,0,0,0.3); }
    @keyframes slideIn {
