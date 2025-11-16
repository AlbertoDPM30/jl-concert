#!/bin/bash

# Ejecutar migraciones y seeders
echo "Ejecutando migraciones..."
php artisan migrate --force

echo "Ejecutando seeders..."
php artisan db:seed --force

# Optimizar Laravel
echo "Optimizando Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Configurar permisos de storage
chown -R www-data:www-data /var/www/html/storage
chmod -R 775 /var/www/html/storage

# Iniciar servicios con Supervisor
echo "Iniciando servicios..."
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf