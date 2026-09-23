# Respaldo externo de Sismed — piloto

Este proceso no requiere Railway Pro. Usa GitHub Actions y guarda archivos cifrados como artifacts de GitHub, fuera del servidor MySQL. No se guarda SQL ni contraseñas en el repositorio.

## Estado y activación

El código preparado NO significa que ya exista una copia de producción. Hasta completar el secreto y obtener una ejecución exitosa con un artifact descargable, el sistema no está respaldado.

1. Guardar `Sismed-clave-respaldo.pem` del paquete de recuperación en un lugar seguro y en una segunda ubicación privada. Es la clave privada: no subirla a GitHub, Railway ni enviarla por chat. Perderla hace irrecuperables las copias. El certificado `recipient.pem` del repositorio es público y solo permite cifrar.
2. En Railway, servicio MySQL → Variables: obtener la conexión **pública** `MYSQL_URL`. La dirección privada `*.railway.internal` no funciona desde GitHub. No pegar la URL en el chat, en un archivo del repositorio ni en los logs.
3. En GitHub, repositorio `Criistiian95/Sistema-de-Turnos` → Settings → Secrets and variables → Actions → New repository secret. Nombre: `BACKUP_DATABASE_URL`. Valor: URL MySQL pública. Preferir una conexión de usuario dedicado con permisos SELECT, SHOW VIEW y TRIGGER únicamente en la base de Sismed; no necesita permisos para escribir o borrar. La URL de Railway puede usar root: permite el piloto, pero concede más permisos de los necesarios.
4. Abrir Actions → **Respaldo externo MySQL** → Run workflow → main. Esperar la marca verde y verificar el artifact `sismed-cifrado-...`. Una ejecución verde de **Verificar recuperación de respaldo** solo verifica datos ficticios; no es una copia de producción.
5. Descargar el primer artifact y probar su recuperación en una base vacía de prueba antes del piloto. No restaurar sobre producción.

## Frecuencia, retención y límites

- Programado todos los días a las 07:17 UTC (04:17 Argentina). Se puede ejecutar manualmente antes y después de cada jornada.
- Retención solicitada: 7 días. Descargar las copias que se quieran conservar antes de su vencimiento. GitHub puede aplicar políticas adicionales.
- Una copia diaria puede perder hasta lo cargado desde la última copia exitosa. Mantener la agenda habitual durante el piloto.
- GitHub puede demorar u omitir ejecuciones programadas y desactivarlas tras 60 días sin actividad en un repositorio público. Revisar Actions diariamente durante el piloto y activar sus notificaciones de fallos. Este proceso no promete recuperación a una hora exacta ni vigilancia permanente.
- El repositorio es público: los artifacts pueden ser descargables por terceros con acceso de lectura. Solo se sube contenido cifrado AES-256-GCM con clave RSA-OAEP de recuperación separada. La clave privada nunca llega al runner de producción.
- Se copian tablas, datos, índices y disparadores de la base indicada, incluyendo hashes de contraseñas y sesiones. No se copian variables de Railway, usuarios/grants del servidor MySQL ni el volumen físico. El script de recuperación elimina sesiones para no reactivar ingresos antiguos.
- Usa mysqldump de MySQL 8.4 con transacción consistente (tablas InnoDB). No ejecutar migraciones/DDL durante el respaldo. No incluye rutinas ni eventos del servidor; Sismed v2 no los usa.
- La conexión pública exige TLS (`ssl-mode=REQUIRED`); cifra el tráfico pero no valida la identidad del certificado autofirmado de MySQL. Para una operación comercial estable conviene fijar una CA válida y usar VERIFY_IDENTITY.
- GitHub y Railway pueden cobrar recursos según plan y uso, especialmente transferencia de Railway. No se contrató ningún plan ni se garantiza costo cero.

## Recuperar una copia de forma segura

Requisitos: Linux (o WSL), Python 3.11+, Docker y OpenSSL 3. Instalar herramientas desde sus fuentes oficiales.

1. Descargar y descomprimir el artifact. Verificar `sha256sum -c archivo.sql.gz.cms.sha256` desde su carpeta.
2. Tener la clave privada y `backup.py` del paquete de recuperación. Primero se puede descifrar sin conectar a ninguna base:

```bash
python3 backup.py decrypt archivo.sql.gz.cms --key Sismed-clave-respaldo.pem --output recuperacion.sql
```

El descifrado valida la integridad antes de entregar SQL. El SQL contiene datos sensibles: conservarlo solo en almacenamiento privado y eliminarlo al terminar la recuperación.

3. Crear **otra base vacía**, cuyo nombre termine en `_restore`, por ejemplo `sismed_restore`. No usar la base `railway` de producción. Configurar `RESTORE_DATABASE_URL` de forma privada (no incluirla en capturas ni logs):

```bash
read -rsp 'URL MySQL de la base de prueba: ' RESTORE_DATABASE_URL
echo
export RESTORE_DATABASE_URL
docker pull mysql:8.4
python3 backup.py restore archivo.sql.gz.cms --key Sismed-clave-respaldo.pem
unset RESTORE_DATABASE_URL
```

El proceso rechaza destinos con tablas o cuyo nombre no termine en `_restore`. No borra producción. Una falla de importación puede dejar la base de prueba parcialmente cargada: usar una nueva base vacía al repetir.

4. Comparar pacientes, profesionales y turnos con el estado de la fecha del respaldo. Revisar claves foráneas, acceso y agenda. Solo después planificar por separado el cambio de la aplicación a la base recuperada.

## Referencias

- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/download-workflow-artifacts
- https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html

