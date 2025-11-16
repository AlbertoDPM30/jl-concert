#!/bin/sh

host="mysql_db"
port=3306

until nc -z $host $port; do
    echo "Esperando a MySQL en $host:$port..."
    sleep 2
done

echo "MySQL está listo - ejecutando comando"
exec "$@"