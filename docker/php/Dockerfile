FROM php:8.4-cli-alpine

RUN sed -i 's|dl-cdn.alpinelinux.org|dl-4.alpinelinux.org|g' /etc/apk/repositories \
    && apk add --no-cache \
        postgresql-dev \
    && docker-php-ext-install pdo pdo_pgsql pgsql bcmath \
    && pecl install redis \
    && docker-php-ext-enable redis

COPY docker/php/php.ini /usr/local/etc/php/conf.d/app.ini

WORKDIR /var/www/html

EXPOSE 8000

CMD php artisan serve --host=0.0.0.0 --port=8000
