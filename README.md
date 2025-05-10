🧭 maxi_rutas - Optimizador de Visitas IFCI
📌 Descripción general
maxi_rutas es una herramienta desarrollada por el área de IT de Maxiseguridad Industrial, orientada a mejorar la planificación y seguimiento de las visitas técnicas del equipo de IFCI (Instalaciones Fijas Contra Incendios). Este sistema busca automatizar recorridos, registrar datos clave de cada visita, y ofrecer métricas que permitan mejorar la eficiencia operativa.

🎯 Objetivo del proyecto
Optimizar y registrar las visitas a clientes de IFCI, permitiendo:

📅 Planificación automática de rutas según prioridades y ubicación.

⏱ Registro de ingreso y egreso en cada cliente (manual o automático).

🗺 Visualización de recorridos en mapa interactivo.

📊 Análisis de tiempos por cliente y por jornada.

🧾 Datos fundamentales requeridos
🧍 Datos del cliente
Campo	Descripción
Nombre del cliente	Identificación básica
Dirección	Usada para geolocalización en el mapa
Tipo de cliente	A / B / C o Industria / Comercial / Hogar
Prioridad	Alta, media, baja (según urgencia del servicio)
Frecuencia sugerida	Ej: semanal, mensual
Horario disponible	Rango de atención permitido
Observaciones	Información adicional para el técnico

📝 Datos por visita
Campo	Descripción
Técnico asignado	Usuario responsable de la visita
Cliente visitado	Relación con cliente previamente cargado
Fecha y hora de ingreso	Marcado al llegar (manual o GPS automático)
Fecha y hora de egreso	Marcado al salir
Duración total	Calculada automáticamente
Resultado / tarea realizada	Notas de servicio ejecutado
Ubicación real	Coordenadas GPS opcionales (si se registra desde el móvil)

⚙️ Funcionalidades clave del MVP
En una primera versión (mínimo producto viable), el sistema permitirá:

✅ Cargar clientes con su ubicación geográfica.

📆 Planificar rutas diarias/semanales automáticamente:

Ordena por prioridad y cercanía.

Muestra la ruta sugerida (Google Maps API).

📲 Registrar visitas desde el celular (check-in y check-out).

📈 Generar reportes de duración por cliente o recorrido.

🧪 Tecnologías sugeridas para el prototipo
Componente	Tecnología recomendada
Frontend	React.js (o HTML + JS simple para prototipo)
Backend	Node.js + Express
Base de datos	MySQL o SQLite
Mapas	Google Maps Platform
Registro	Botón en app o GPS automático

🔁 Flujo de uso sugerido
El área administrativa carga clientes y ubicaciones.

El sistema sugiere recorridos por técnico y día, priorizando cercanía y urgencia.

Se genera un mapa con la ruta editable.

El técnico accede desde su celular y marca:

"Inicio de visita" al llegar.

"Fin de visita" al terminar.

El sistema calcula:

Tiempo total.

Historial por cliente.

Métricas de eficiencia y cobertura.

🚀 Estado del proyecto
📌 En fase de diseño y prototipado funcional.
🛠 Se evaluará en campo con recorridos reales para iterar mejoras.
🔐 Pensado para ser una Progressive Web App (PWA) adaptable a escritorio y móviles.

