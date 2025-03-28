// Variables globales
let map;
let busMarker;
let routePath;
let simulationInterval;
let isAtStop = false;
let stopTimeout;
let busId = "1234";
let currentPointIndex = 0;
let busSpeed = 5; // metros por segundo (más lento para mejor visualización)
let routePoints = [];
let currentRouteId = "ruta1";

// Rutas predefinidas (coordenadas aproximadas de calles en Aguascalientes)
const routes = {
    ruta1: [
        {lat: 21.8818, lng: -102.2916}, // Centro - Inicio
        {lat: 21.8825, lng: -102.2925},
        {lat: 21.8832, lng: -102.2934},
        {lat: 21.8839, lng: -102.2943},
        {lat: 21.8846, lng: -102.2951},
        {lat: 21.8853, lng: -102.2959},
        {lat: 21.8860, lng: -102.2967},
        {lat: 21.8867, lng: -102.2975},
        {lat: 21.8874, lng: -102.2983},
        {lat: 21.8881, lng: -102.2991},
        {lat: 21.8888, lng: -102.2999},
        {lat: 21.8895, lng: -102.3007},
        {lat: 21.8902, lng: -102.3015},
        {lat: 21.8909, lng: -102.3023},
        {lat: 21.8916, lng: -102.3031},
        {lat: 21.8923, lng: -102.3039},
        {lat: 21.8930, lng: -102.3047},
        {lat: 21.8937, lng: -102.3055},
        {lat: 21.8944, lng: -102.3063},
        {lat: 21.8951, lng: -102.3071},
        {lat: 21.8958, lng: -102.3079},
        {lat: 21.8965, lng: -102.3087}, // Norte - Final
    ],
    
    ruta2: [
        {lat: 21.8798, lng: -102.2717}, // Este - Inicio
        {lat: 21.8798, lng: -102.2737},
        {lat: 21.8798, lng: -102.2757},
        {lat: 21.8798, lng: -102.2777},
        {lat: 21.8798, lng: -102.2797},
        {lat: 21.8798, lng: -102.2817},
        {lat: 21.8798, lng: -102.2837},
        {lat: 21.8798, lng: -102.2857},
        {lat: 21.8798, lng: -102.2877},
        {lat: 21.8798, lng: -102.2897},
        {lat: 21.8798, lng: -102.2917},
        {lat: 21.8798, lng: -102.2937},
        {lat: 21.8798, lng: -102.2957},
        {lat: 21.8798, lng: -102.2977},
        {lat: 21.8798, lng: -102.2987}, // Oeste - Final
    ],
    
    ruta3: [
        {lat: 21.9127, lng: -102.3164}, // Universidad - Inicio
        {lat: 21.9117, lng: -102.3154},
        {lat: 21.9107, lng: -102.3144},
        {lat: 21.9097, lng: -102.3134},
        {lat: 21.9087, lng: -102.3124},
        {lat: 21.9077, lng: -102.3114},
        {lat: 21.9067, lng: -102.3104},
        {lat: 21.9057, lng: -102.3094},
        {lat: 21.9047, lng: -102.3084},
        {lat: 21.9037, lng: -102.3094},
        {lat: 21.9027, lng: -102.3104},
        {lat: 21.9017, lng: -102.3114},
        {lat: 21.9007, lng: -102.3124},
        {lat: 21.9017, lng: -102.3134},
        {lat: 21.9027, lng: -102.3144},
        {lat: 21.9037, lng: -102.3154},
        {lat: 21.9047, lng: -102.3164},
        {lat: 21.9057, lng: -102.3174},
        {lat: 21.9067, lng: -102.3184},
        {lat: 21.9077, lng: -102.3174},
        {lat: 21.9087, lng: -102.3164},
        {lat: 21.9097, lng: -102.3154},
        {lat: 21.9107, lng: -102.3144},
        {lat: 21.9117, lng: -102.3154},
        {lat: 21.9127, lng: -102.3164}, // Regreso a Universidad - Final
    ]
};

// Inicializar el mapa de Google
function initMap() {
    const aguascalientesCenter = {lat: 21.8818, lng: -102.2916};
    
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
        center: aguascalientesCenter,
    });
    
    // Crear el marcador del autobús
    busMarker = new google.maps.Marker({
        position: routes.ruta1[0],
        map: map,
        icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 5,
            fillColor: "#3498db",
            fillOpacity: 1,
            strokeColor: "#2980b9",
            rotation: 0
        },
        title: "Autobús " + busId
    });
    
    // Mostrar la ruta inicial
    displayRoute(currentRouteId);
    
    // Configurar los eventos de los botones
    document.getElementById("route-select").addEventListener("change", function() {
        currentRouteId = this.value;
        displayRoute(currentRouteId);
        resetSimulation();
    });
    
    document.getElementById("bus-id").addEventListener("input", function() {
        if (this.value.length === 4 && /^\d+$/.test(this.value)) {
            busId = this.value;
            document.getElementById("display-bus-id").textContent = busId;
        }
    });
    
    document.getElementById("start-simulation").addEventListener("click", startSimulation);
    document.getElementById("stop-simulation").addEventListener("click", stopSimulation);
}

// Mostrar una ruta seleccionada
function displayRoute(routeId) {
    // Limpiar la ruta anterior si existe
    if (routePath) {
        routePath.setMap(null);
    }
    
    // Obtener los puntos de la ruta
    routePoints = routes[routeId];
    
    // Crear y mostrar la nueva ruta
    routePath = new google.maps.Polyline({
        path: routePoints,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 3
    });
    
    routePath.setMap(map);
    
    // Centrar el mapa en el inicio de la ruta
    map.setCenter(routePoints[0]);
    
    // Mover el marcador del autobús al inicio de la ruta
    busMarker.setPosition(routePoints[0]);
    
    // Agregar marcadores para las paradas
    addStopMarkers(routeId);
    
    // Registrar cambio de ruta
    logActivity("Ruta cambiada a: " + document.getElementById("route-select").options[document.getElementById("route-select").selectedIndex].text);
}

// Determinar si un punto es una parada (cada 4 puntos aproximadamente)
function isStopPoint(index) {
    return index % 4 === 0;
}

// Agregar marcadores para las paradas
function addStopMarkers(routeId) {
    // Eliminar marcadores anteriores
    if (window.stopMarkers) {
        for (let marker of window.stopMarkers) {
            marker.setMap(null);
        }
    }
    
    window.stopMarkers = [];
    
    // Agregar nuevos marcadores para cada parada
    routePoints.forEach((position, index) => {
        if (isStopPoint(index)) {
            const marker = new google.maps.Marker({
                position: position,
                map: map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 5,
                    fillColor: "#FF0000",
                    fillOpacity: 1,
                    strokeColor: "#FF0000"
                },
                title: "Parada " + (window.stopMarkers.length + 1)
            });
            
            window.stopMarkers.push(marker);
        }
    });
}

// Iniciar la simulación
function startSimulation() {
    // Cambiar estado de los botones
    document.getElementById("start-simulation").disabled = true;
    document.getElementById("stop-simulation").disabled = false;
    document.getElementById("route-select").disabled = true;
    document.getElementById("bus-id").disabled = true;
    
    // Actualizar estado
    document.getElementById("bus-status").textContent = "En movimiento";
    
    // Reiniciar el índice de posición
    currentPointIndex = 0;
    
    // Registrar inicio de simulación
    logActivity("Simulación iniciada para el autobús " + busId);
    
    // Iniciar el movimiento del autobús
    moveAlongRoute();
}

// Calcular el ángulo de rotación entre dos puntos
function calculateHeading(from, to) {
    // Calcular la diferencia en coordenadas
    const deltaLat = to.lat - from.lat;
    const deltaLng = to.lng - from.lng;
    
    // Calcular el ángulo en radianes y convertir a grados
    let angle = Math.atan2(deltaLng, deltaLat) * 180 / Math.PI;
    
    return angle;
}

// Mover el autobús a lo largo de la ruta
function moveAlongRoute() {
    // Intervalo para actualizar la posición del autobús (cada segundo)
    simulationInterval = setInterval(() => {
        // Si el autobús está en una parada, no moverse
        if (isAtStop) return;
        
        // Verificar si hemos llegado al final de la ruta
        if (currentPointIndex >= routePoints.length - 1) {
            // Reiniciar la ruta
            currentPointIndex = 0;
            logActivity("Autobús " + busId + " ha completado la ruta y comienza de nuevo");
        }
        
        // Obtener la posición actual
        const currentPoint = routePoints[currentPointIndex];
        
        // Actualizar la posición del marcador
        busMarker.setPosition(currentPoint);
        
        // Actualizar las coordenadas mostradas
        document.getElementById("bus-coords").textContent = 
            currentPoint.lat.toFixed(4) + ", " + currentPoint.lng.toFixed(4);
        
        // Registrar la posición en el log (no en cada punto para no saturar)
        if (currentPointIndex % 4 === 0) {
            logActivity("Autobús " + busId + ": " + 
                        currentPoint.lat.toFixed(4) + ", " + 
                        currentPoint.lng.toFixed(4));
        }
        
        // Calcular la rotación para el icono del autobús
        if (currentPointIndex < routePoints.length - 1) {
            const nextPoint = routePoints[currentPointIndex + 1];
            const heading = calculateHeading(currentPoint, nextPoint);
            
            // Actualizar la rotación del icono
            busMarker.setIcon({
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 5,
                fillColor: "#3498db",
                fillOpacity: 1,
                strokeColor: "#2980b9",
                rotation: heading
            });
        }
        
        // Verificar si estamos en una parada
        if (isStopPoint(currentPointIndex)) {
            // Estamos en una parada, esperar 20 segundos
            isAtStop = true;
            document.getElementById("bus-status").textContent = 
                "En parada " + (Math.floor(currentPointIndex / 4) + 1);
            
            logActivity("Autobús " + busId + " detenido en parada " + 
                      (Math.floor(currentPointIndex / 4) + 1) + " por 20 segundos");
            
            stopTimeout = setTimeout(() => {
                isAtStop = false;
                document.getElementById("bus-status").textContent = "En movimiento";
                logActivity("Autobús " + busId + " reanuda marcha");
                
                // Al reanudar, avanzar al siguiente punto
                currentPointIndex++;
            }, 20000); // 20 segundos
        } else {
            // Si no es una parada, avanzar al siguiente punto
            currentPointIndex++;
        }
        
    }, 1000); // Actualizar cada segundo
}

// Detener la simulación
function stopSimulation() {
    // Limpiar el intervalo y el timeout
    clearInterval(simulationInterval);
    if (stopTimeout) clearTimeout(stopTimeout);
    
    // Cambiar estado de los botones
    document.getElementById("start-simulation").disabled = false;
    document.getElementById("stop-simulation").disabled = true;
    document.getElementById("route-select").disabled = false;
    document.getElementById("bus-id").disabled = false;
    
    // Actualizar estado
    document.getElementById("bus-status").textContent = "Detenido";
    
    // Registrar detención
    logActivity("Simulación detenida para el autobús " + busId);
}

// Reiniciar la simulación
function resetSimulation() {
    // Detener la simulación si está en curso
    if (!document.getElementById("start-simulation").disabled) {
        stopSimulation();
    }
    
    // Reiniciar el índice de posición
    currentPointIndex = 0;
    isAtStop = false;
    
    // Mover el marcador del autobús al inicio de la ruta
    if (routePoints.length > 0) {
        busMarker.setPosition(routePoints[0]);
    }
    
    // Limpiar las coordenadas mostradas
    document.getElementById("bus-coords").textContent = "-";
}

// Registrar actividad en el log
function logActivity(message) {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    const logEntry = document.createElement("div");
    logEntry.className = "log-entry";
    logEntry.textContent = `[${timeString}] ${message}`;
    
    const logsContainer = document.getElementById("logs");
    logsContainer.insertBefore(logEntry, logsContainer.firstChild);
}