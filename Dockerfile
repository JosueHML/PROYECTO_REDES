# Imagen base de PHP con Apache
FROM php:8.1-apache

# Copiar los archivos del proyecto al contenedor
COPY . /var/www/html/

# Dar permisos
RUN chown -R www-data:www-data /var/www/html

# Habilitar mod_rewrite para Laravel o uso de .htaccess
RUN a2enmod rewrite
