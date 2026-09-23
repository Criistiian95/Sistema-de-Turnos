# Historia clínica — primera versión

Uso: un único consultorio y su equipo profesional. No es un sistema multiempresa.

1. El administrador registra al profesional en **Agregar médico**.
2. En **Accesos profesionales**, crea una cuenta individual indicando matrícula, correo y contraseña; también puede habilitar una cuenta existente. No reutilizar la cuenta administradora.
3. El profesional inicia sesión, abre **Historia clínica** y busca por DNI a un paciente registrado.
4. Completa fecha de atención, motivo, antecedentes y alergias, evaluación, diagnóstico e indicaciones. Confirma el paciente y guarda.
5. Al volver a buscar ese DNI, consulta las atenciones anteriores y sus autores.

Los profesionales habilitados del consultorio pueden consultar sus historias compartidas. Administrador y recepción no tienen acceso clínico. No hay permisos por paciente ni aislamiento entre consultorios. Deshabilitar una cuenta revoca sus sesiones y el acceso clínico; conserva su acceso de recepción y las notas anteriores.

Las notas se agregan, no se editan ni eliminan. Las correcciones se documentan como una nueva nota identificando el registro corregido. Fecha de atención y fecha de carga se conservan por separado, junto con autor y matrícula. No incluye archivos adjuntos, firma digital, recetas, exportación ni certificación normativa.

Las lecturas, las cargas y los cambios de permisos se registran en clinical_audit. No se incluyen textos clínicos en los logs. Esta auditoría está en la misma base, no es un archivo externo inalterable. Las respuestas clínicas usan Cache-Control: no-store. Los borradores solo viven en memoria del navegador.

## Instalación

La migración 002-clinical agrega tres tablas y el rol Profesional. No modifica ni borra las tablas de pacientes o turnos. Se ejecuta mediante npm run db:migrate y está incluida en el arranque del Dockerfile. Una segunda ejecución no duplica tablas ni roles.

Antes de usar datos reales, confirmar una copia externa exitosa y una recuperación de prueba. El respaldo completo con mysqldump incluye automáticamente las nuevas tablas. La activación del secreto BACKUP_DATABASE_URL es un paso independiente de este módulo.

## Validación

npm test verifica los casos HTTP y relacionales en SQLite aislado. El workflow clinical.yml ejecuta además la migración y los casos clínicos con MySQL 8.4 en una base temporal. Se comprueban roles, altas, revocación, notas inmutables, autor confiable, reintentos, paginación y auditoría.
