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
    cargarDatos();
    actualizarEstadisticas();
    setTimeout(initMap, 600);
    setInterval(actualizarDatosSimulados, 30000);
}

function cargarDatos() {
    datosEstaciones = [
        // Línea A
        { id: 'A-01', nombre: 'Plaza de Mayo', linea: 'A', lat: -34.6083, lon: -58.3712,
          estadoLuces: false, bateria: 87, paneles: 82, regulador: 'OK', wifi: { ssid: 'SUBTE_A_01', señal: 92 } },
        { id: 'A-02', nombre: 'Perú', linea: 'A', lat: -34.6085, lon: -58.3725,
          estadoLuces: true, bateria: 72, paneles: 65, regulador: 'OK', wifi: { ssid: 'SUBTE_A_02', señal: 84 } },
        { id: 'A-03', nombre: 'Piedras', linea: 'A', lat: -34.6090, lon: -58.3740,
          estadoLuces: false, bateria: 45, paneles: 30, regulador: '⚠️ Revisar', wifi: { ssid: 'SUBTE_A_03', señal: 0 } },
        { id: 'A-04', nombre: 'Lima', linea: 'A', lat: -34.6095, lon: -58.3755,
          estadoLuces: true, bateria: 95, paneles: 90, regulador: 'OK', wifi: { ssid: 'SUBTE_A_04', señal: 88 } },
        { id: 'A-05', nombre: 'Sáenz Peña', linea: 'A', lat: -34.6100, lon: -58.3770,
          estadoLuces: false, bateria: 33, paneles: 12, regulador: 'FALLA', wifi: { ssid: 'SUBTE_A_05', señal: 0 } },
        { id: 'A-06', nombre: 'Congreso', linea: 'A', lat: -34.6105, lon: -58.3785,
          estadoLuces: true, bateria: 89, paneles: 85, regulador: 'OK', wifi: { ssid: 'SUBTE_A_06', señal: 90 } },
        { id: 'A-07', nombre: 'Pasco', linea: 'A', lat: -34.6110, lon: -58.3800,
          estadoLuces: true, bateria: 91, paneles: 87, regulador: 'OK', wifi: { ssid: 'SUBTE_A_07', señal: 86 } },
        { id: 'A-08', nombre: 'Alberti', linea: 'A', lat: -34.6115, lon: -58.3815,
          estadoLuces: false, bateria: 77, paneles: 72, regulador: 'OK', wifi: { ssid: 'SUBTE_A_08', señal: 79 } },
        { id: 'A-09', nombre: 'Plaza Miserere', linea: 'A', lat: -34.6120, lon: -58.3830,
          estadoLuces: true, bateria: 82, paneles: 78, regulador: 'OK', wifi: { ssid: 'SUBTE_A_09', señal: 83 } },
        { id: 'A-10', nombre: 'Loria', linea: 'A', lat: -34.6125, lon: -58.3845,
          estadoLuces: true, bateria: 86, paneles: 81, regulador: 'OK', wifi: { ssid: 'SUBTE_A_10', señal: 81 } },

        // Línea B
        { id: 'B-01', nombre: 'Leandro N. Alem', linea: 'B', lat: -34.6020, lon: -58.3705,
          estadoLuces: false, bateria: 93, paneles: 88, regulador: 'OK', wifi: { ssid: 'SUBTE_B_01', señal: 90 } },
        { id: 'B-02', nombre: 'Florida', linea: 'B', lat: -34.6035, lon: -58.3720,
          estadoLuces: true, bateria: 78, paneles: 72, regulador: 'OK', wifi: { ssid: 'SUBTE_B_02', señal: 80 } },
        { id: 'B-03', nombre: 'Carlos Pellegrini', linea: 'B', lat: -34.6040, lon: -58.3740,
          estadoLuces: true, bateria: 88, paneles: 85, regulador: 'OK', wifi: { ssid: 'SUBTE_B_03', señal: 86 } },
        { id: 'B-04', nombre: 'Uruguay', linea: 'B', lat: -34.6045, lon: -58.3755,
          estadoLuces: false, bateria: 79, paneles: 74, regulador: 'OK', wifi: { ssid: 'SUBTE_B_04', señal: 77 } },
        { id: 'B-05', nombre: 'Callao', linea: 'B', lat: -34.6050, lon: -58.3770,
          estadoLuces: true, bateria: 96, paneles: 92, regulador: 'OK', wifi: { ssid: 'SUBTE_B_05', señal: 94 } },
        { id: 'B-06', nombre: 'Pueyrredón (Plaza Once)', linea: 'B', lat: -34.6060, lon: -58.4030,
          estadoLuces: true, bateria: 68, paneles: 59, regulador: '⚠️ Bajo', wifi: { ssid: 'SUBTE_B_06', señal: 71 } },
        { id: 'B-07', nombre: 'Carlos Gardel', linea: 'B', lat: -34.6070, lon: -58.4080,
          estadoLuces: false, bateria: 82, paneles: 77, regulador: 'OK', wifi: { ssid: 'SUBTE_B_07', señal: 79 } },

        // Línea C
        { id: 'C-01', nombre: 'Retiro', linea: 'C', lat: -34.5915, lon: -58.3755,
          estadoLuces: true, bateria: 97, paneles: 94, regulador: 'OK', wifi: { ssid: 'SUBTE_C_01', señal: 95 } },
        { id: 'C-02', nombre: 'General San Martín', linea: 'C', lat: -34.5950, lon: -58.3760,
          estadoLuces: true, bateria: 85, paneles: 81, regulador: 'OK', wifi: { ssid: 'SUBTE_C_02', señal: 82 } },
        { id: 'C-03', nombre: 'Lavalle', linea: 'C', lat: -34.5970, lon: -58.3770,
          estadoLuces: false, bateria: 74, paneles: 66, regulador: 'OK', wifi: { ssid: 'SUBTE_C_03', señal: 68 } },
        { id: 'C-04', nombre: 'Diagonal Norte', linea: 'C', lat: -34.6030, lon: -58.3780,
          estadoLuces: true, bateria: 88, paneles: 83, regulador: 'OK', wifi: { ssid: 'SUBTE_C_04', señal: 86 } },
        { id: 'C-05', nombre: 'Avenida de Mayo', linea: 'C', lat: -34.6085, lon: -58.3790,
          estadoLuces: true, bateria: 90, paneles: 86, regulador: 'OK', wifi: { ssid: 'SUBTE_C_05', señal: 88 } },
        { id: 'C-06', nombre: 'Moreno', linea: 'C', lat: -34.6105, lon: -58.3805,
          estadoLuces: false, bateria: 69, paneles: 61, regulador: '⚠️ Revisar', wifi: { ssid: 'SUBTE_C_06', señal: 0 } },
        { id: 'C-07', nombre: 'Independencia', linea: 'C', lat: -34.6150, lon: -58.3820,
          estadoLuces: true, bateria: 86, paneles: 82, regulador: 'OK', wifi: { ssid: 'SUBTE_C_07', señal: 80 } },
        { id: 'C-08', nombre: 'San Juan', linea: 'C', lat: -34.6200, lon: -58.3835,
          estadoLuces: false, bateria: 29, paneles: 9, regulador: 'FALLA', wifi: { ssid: 'SUBTE_C_08', señal: 0 } },
        { id: 'C-09', nombre: 'Constitución', linea: 'C', lat: -34.6270, lon: -58.3805,
          estadoLuces: true, bateria: 95, paneles: 91, regulador: 'OK', wifi: { ssid: 'SUBTE_C_09', señal: 93 } }
    ];
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
        let color = e.wifi.señal === 0 ? '#95a5a6' :
                    e.bateria > 70 ? '#2ecc71' :
                    e.bateria > 40 ? '#f39c12' : '#e74c3c';
        let icono = L.divIcon({
            html: `<div style="background:${color}; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20]
        });
        let m = L.marker([e.lat, e.lon], { icon: icono }).addTo(mapa)
            .bindPopup(`<b>${e.nombre}</b><br>Línea ${e.linea}<br><button onclick="verDetalles('${e.id}')">🔍 Ver detalles</button>`);
        marcadores.push(m);
    });
}

function filtrarEstaciones() {
    if (filtroActual === 'todas') return datosEstaciones;
    if (filtroActual === 'problemas') return datosEstaciones.filter(e => e.wifi.señal === 0 || e.bateria < 40 || e.regulador !== 'OK');
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
    document.getElementById('wifi-connected').innerText = conectadas;
    document.getElementById('wifi-disconnected').innerText = total - conectadas;
    document.getElementById('wifi-percentage').innerText = Math.round((conectadas / total) * 100) + '%';
    document.getElementById('estado-general').innerHTML = `<span style="background:#2ecc71; color:white; padding:8px 15px; border-radius:20px;">✅ ${conectadas} de ${total} conectadas</span>`;
}

function conectarTodas() {
    datosEstaciones.forEach(e => {
        e.wifi.señal = 85;
        e.bateria = 90;
        e.paneles = 85;
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

    // Agregar CSS dinámico
    const style = document.createElement('style');
    style.innerHTML = `
        .info-box { background:white; padding:15px; border-radius:10px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.05); }
        .info-box span { display:block; font-size:0.9rem; color:#5c6bc0; }
        .info-box strong { font-size:1.4rem; color:#1a237e; }
        .btn-on { flex:1; background:#2ecc71; color:white; padding:12px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; }
        .btn-off { flex:1; background:#e74c3c; color:white; padding:12px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; }
        .wifi-btn { width:100%; background:#3498db; color:white; padding:12px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; }
        .close-btn { background:#666; color:white; padding:10px 30px; border:none; border-radius:8px; cursor:pointer; }
    `;
    document.head.appendChild(style);
}

// ========== CONTROL DE LUCES ==========
function encenderLuz(id) {
    const e = datosEstaciones.find(e => e.id === id);
    if (e) {
        e.estadoLuces = true;
        mostrarNotificacion(`💡 Luces encendidas en ${e.nombre}`, '#f39c12');
        actualizarMarcadores();
    }
}

function apagarLuz(id) {
    const e = datosEstaciones.find(e => e.id === id);
    if (e) {
        e.estadoLuces = false;
        mostrarNotificacion(`🌙 Luces apagadas en ${e.nombre}`, '#95a5a6');
        actualizarMarcadores();
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
    e.wifi.señal = 85;
    mostrarNotificacion(`✅ ${e.nombre} conectada a "${ssid}"`, '#2ecc71');
    actualizarEstadisticas();
    actualizarMarcadores();
}

// ========== MODO FIESTA ==========
function mostrarPanelFiestas() {
    alert('🎉 MODO FIESTA activado por 5 segundos');
    let colores = ['#FF0000', '#00FF00'], i = 0;
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
    n.style.cssText = `position:fixed; top:20px; right:20px; background:${color}; color:white; padding:15px 25px; border-radius:10px; z-index:1002; font-weight:bold; box-shadow:0 5px 15px rgba(0,0,0,0.3);`;
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 4000);
}

// ========== SIMULACIÓN ==========
function actualizarDatosSimulados() {
    datosEstaciones.forEach(e => {
        if (Math.random() > 0.9) e.wifi.señal = e.wifi.señal ? 0 : 80;
        if (e.wifi.señal > 0) {
            e.bateria = Math.min(100, Math.max(0, e.bateria + (Math.random() * 4 - 2)));
            e.paneles = Math.min(100, Math.max(0, e.paneles + (Math.random() * 4 - 2)));
            e.regulador = e.bateria > 40 && e.paneles > 30 ? 'OK' : (e.bateria > 20 ? '⚠️ Revisar' : 'FALLA');
        }
    });
    actualizarEstadisticas();
    actualizarMarcadores();
}
