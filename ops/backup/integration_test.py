"""Disposable MySQL 8.4 round trip. Never connects to Railway."""
import os
from pathlib import Path
import secrets
import subprocess
import tempfile
import time
from backup import create, restore


password = secrets.token_hex(24)
name = "sismed-backup-test-" + secrets.token_hex(5)
os.environ["MYSQL_ROOT_PASSWORD"] = password
os.environ["MYSQL_PWD"] = password


def run(*args, **kwargs):
    return subprocess.run(args, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, **kwargs).stdout


def sql(statement, database=None):
    command = ["docker", "exec", "-i", "-e", "MYSQL_PWD", name, "mysql", "-uroot", "-N", "-B"]
    if database:
        command.append(database)
    return run(*command, input=statement.encode())


try:
    run("docker", "run", "-d", "--name", name, "-p", "127.0.0.1::3306", "-e", "MYSQL_ROOT_PASSWORD",
        "-e", "MYSQL_ROOT_HOST=%", "mysql:8.4")
    for attempt in range(60):
        try:
            sql("SELECT 1")
            break
        except subprocess.CalledProcessError:
            time.sleep(2)
    else:
        raise RuntimeError("MySQL de prueba no inició.")
    port = run("docker", "port", name, "3306").decode().strip().rsplit(":", 1)[1]
    sql("CREATE DATABASE pilot; CREATE DATABASE pilot_restore;")
    # Load the actual application schema, constraints and seed data.
    os.environ["DATABASE_URL"] = f"mysql://root:{password}@127.0.0.1:{port}/pilot"
    run("node", "backend/scripts/migrate.js")
    sql("INSERT INTO patients (DNI,name,lastname,phone,street,location) VALUES "
        "('00000001','Prueba Ñ','Respaldo','000','Calle prueba','Prueba'); "
        "INSERT INTO doctors(tuition,name,lastname,specialties_id) VALUES ('TEST','Doctor','Prueba',1); "
        "INSERT INTO shifts(paciente_id,doctor_id,fecha,especialidad,estado_turno,observaciones,active_slot) "
        "VALUES ('00000001','TEST','2030-01-01 10:00:00',1,1,'Prueba','TEST:2030-01-01T10:00:00Z');", "pilot")
    with tempfile.TemporaryDirectory() as work:
        directory = Path(work)
        run("openssl", "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", str(directory / "key"),
            "-out", str(directory / "cert"), "-days", "1", "-subj", "/CN=test")
        os.environ["BACKUP_DATABASE_URL"] = os.environ["DATABASE_URL"]
        create(directory / "out", directory / "cert")
        archive = next((directory / "out").glob("*.cms"))
        os.environ["RESTORE_DATABASE_URL"] = f"mysql://root:{password}@127.0.0.1:{port}/pilot_restore"
        restore(archive, directory / "key")
        for table in ["roles", "users", "patients", "doctors", "specialties", "shifts", "sismed_migrations"]:
            assert sql(f"SELECT * FROM {table} ORDER BY 1", "pilot") == sql(f"SELECT * FROM {table} ORDER BY 1", "pilot_restore")
        try:
            restore(archive, directory / "key")
        except ValueError:
            pass
        else:
            raise AssertionError("No se rechazó una base destino no vacía")
    print("OK: esquema real y datos ficticios recuperados; destino no vacío rechazado.")
finally:
    subprocess.run(["docker", "rm", "-fv", name], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
