FROM ubuntu:22.04

# Evitar preguntas durante la instalación
ENV DEBIAN_FRONTEND=noninteractive

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    software-properties-common \
    curl \
    wget \
    git \
    unzip \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libssl-dev \
    libcurl4-openssl-dev \
    pkg-config \
    autoconf \
    build-essential \
    nginx \
    supervisor

# Instalar PHP 8.2 y extensiones necesarias
RUN add-apt-repository ppa:ondrej/php -y && \
    apt-get update && \
    apt-get install -y \
    php8.2 \
    php8.2-fpm \
    php8.2-mysql \
    php8.2-mbstring \
    php8.2-xml \
    php8.2-zip \
    php8.2-gd \
    php8.2-curl \
    php8.2-bcmath \
    php8.2-redis \
    php8.2-pdo

# Instalar Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Configurar directorio de trabajo
WORKDIR /var/www/html

# Copiar archivos de la aplicación
COPY . .

# Configurar permisos
RUN chown -R www-data:www-data /var/www/html/storage
RUN chown -R www-data:www-data /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage
RUN chmod -R 775 /var/www/html/bootstrap/cache

# Copiar configuración de PHP-FPM
COPY php-fpm.conf /etc/php/8.2/fpm/php-fpm.conf
COPY www.conf /etc/php/8.2/fpm/pool.d/www.conf

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/sites-available/default

# Copiar configuración de Supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Instalar dependencias de Composer
RUN composer install --no-dev --optimize-autoloader

# Generar key de aplicación (se sobreescribirá con variable de entorno)
# RUN php artisan key:generate

# Exponer puerto
EXPOSE 80

# Script de inicio
COPY start-container.sh /usr/local/bin/start-container.sh
RUN chmod +x /usr/local/bin/start-container.sh

CMD ["/usr/local/bin/start-container.sh"]