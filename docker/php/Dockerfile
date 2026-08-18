FROM php:8.4-cli-alpine

RUN apk add --no-cache \
        postgresql-dev \
        autoconf \
        g++ \
        make \
        libzip-dev \
        freetype-dev \
        libjpeg-turbo-dev \
        libpng-dev \
        libwebp-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install pdo pdo_pgsql pgsql bcmath zip gd \
    && pecl install redis \
    && docker-php-ext-enable redis

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY docker/php/php.ini /usr/local/etc/php/conf.d/app.ini

RUN addgroup -g 1000 app && adduser -u 1000 -G app -D app

WORKDIR /var/www/html

USER app

EXPOSE 8000

CMD php artisan serve --host=0.0.0.0 --port=8000
