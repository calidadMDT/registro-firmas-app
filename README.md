# Sistema de Registro con Firma Digital - Colombia

## Descripción
Aplicación web para capturar registros con firma digital y exportar a Excel con fecha/hora zona horaria de Colombia (UTC-5).

## Requisitos
- macOS con Visual Studio Code
- Navegador Chrome, Safari o Firefox

## Instalación Mac
1. Abrir Terminal en macOS
2. Crear carpeta: `mkdir registro-firmas-app && cd registro-firmas-app`
3. Crear archivos: `touch index.html styles.css app.js README.md`
4. Crear carpeta libs: `mkdir libs`
5. Descargar librerías manualmente en libs/
6. Pegar el código completo en cada archivo
7. Abrir con Live Server en VS Code

## Uso
1. Ejecutar con Live Server (extensión de VS Code)
2. Llenar formulario completo
3. Realizar firma (usa el trackpad o mouse)
4. Enviar registro
5. Descargar Excel cuando se necesite (archivo va a Descargas)

## Notas Mac
- Sin backend, todo funciona en frontend
- Datos almacenados localmente en el navegador
- Para uso en entornos controlados