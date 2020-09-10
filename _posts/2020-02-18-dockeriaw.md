---
title: "Implantación de aplicaciones web PHP en docker"
author: Ernesto Vázquez García
date: 2020-02-18 00:00:00 +0800
categories: [Implantación de aplicaciones web]
tags: [PHP, Docker]
---

Queremos ejecutar en un contenedor docker la aplicación web escrita en PHP: [bookMedik](https://github.com/evilnapsis/bookmedik).

***

## Tarea 1

**Ejecución de la aplicación web PHP bookMedik en docker**

* Queremos ejecutar en un contenedor docker la aplicación web escrita en PHP: bookMedik (https://github.com/evilnapsis/bookmedik).
* Es necesario tener un contenedor con mariadb donde vamos a crear la base de datos y los datos de la aplicación. El script para generar la base de datos y los registros lo encuentras en el repositorio y se llama schema.sql. Debes crear un usuario con su contraseña en la base de datos. La base de datos se llama bookmedik y se crea al ejecutar el script.
* Ejecuta el contenedor mariadb y carga los datos del script schema.sql. Para más información.
* El contenedor mariadb debe tener un volumen para guardar la base de datos.
* Crea una imagen docker con la aplicación desde una imagen base de debian o ubuntu. Ten en cuenta que el fichero de configuración de la base de datos (core\controller\Database.php) lo tienes que configurar utilizando las variables de entorno del contenedor mariadb. (Nota: Para obtener las variables de entorno en PHP usar la función getenv. Para más infomación).
* La imagen la tienes que crear en tu máquina con el comando docker build.
* Crea un contenedor a partir de la imagen anterior, enlazado con el contenedor mariadb, y comprueba que está funcionando (Usuario: admin, contraseña: admin)
* El contenedor que creas debe tener un volumen para guardar los logs de apache2.

***

Creamos la red del contenedor:

```
root@bookmedik:~/tarea1# docker network create bookmedik
156229b4609abda50303cc7cd7e355bbdf317087f4c511e1a6ca93addd592b89
```

Contenedor de la base de datos:

```
root@bookmedik:~/tarea1# docker run -d --name servidor_mysql --network bookmedik -e MYSQL_DATABASE=bookmedik -e MYSQL_USER=bookmedik -e MYSQL_PASSWORD=bookmedik -e MYSQL_ROOT_PASSWORD=asdasd mariadb
```

Cargamos los datos en la base de datos

```
root@bookmedik:~/tarea1/bookmedik# cat schema.sql | docker exec -i servidor_mysql /usr/bin/mysql -u root --password=asdasd bookmedik
```

```
root@bookmedik:~/tarea1# nano Dockerfile 

FROM debian
RUN apt-get update && apt-get install -y apache2 libapache2-mod-php7.3 php7.3 php7.3-mysql && apt-get clean && rm -rf /var/lib/apt/lists/*
RUN rm /var/www/html/index.html
ENV APACHE_SERVER_NAME www.bookmedikernesto.com
ENV MARIADB_USER bookmedik
ENV MARIADB_PASS bookmedik
ENV MARIADB_HOST servidor_mysql

EXPOSE 80

COPY ./bookmedik /var/www/html
ADD script.sh /usr/local/bin/script.sh

RUN chmod +x /usr/local/bin/script.sh

CMD ["/usr/local/bin/script.sh"]
```

Script:

```
root@docker:~# cat script.sh 
#!/bin/bash
sed -i 's/$this->user="root";/$this->user="'${MARIADB_USER}'";/g' /var/www/html/core/controller/Database.php
sed -i 's/$this->pass="";/$this->pass="'${MARIADB_PASS}'";/g' /var/www/html/core/controller/Database.php
sed -i 's/$this->host="localhost";/$this->host="'${MARIADB_HOST}'";/g' /var/www/html/core/controller/Database.php
apache2ctl -D FOREGROUND
```

Imagen y contenedor:

```
root@docker:~# docker build -t ernestovazquez/bookmedik:v1 .

root@bookmedik:~/tarea1# docker run -d --name bookmedik --network bookmedik -p 80:80 ernestovazquez/bookmedik:v1
```

![](https://i.imgur.com/KAsftEG.png)

Volumen de la base de datos:

```
root@docker:~# docker run -d --name servidor_mysql --network bookmedik -v /opt/bbdd_mariadb:/var/lib/mysql -e MYSQL_DATABASE=bookmedik -e MYSQL_USER=bookmedik -e MYSQL_PASSWORD=bookmedik -e MYSQL_ROOT_PASSWORD=bookmedik mariadb
```

Log para apache

```
root@docker:~# docker run -d --name bookmedik --network bookmedik -v /opt/logs_apache2:/var/log/apache2 -p 80:80 ernestovazquez/bookmedik:v1

root@docker:~/bookmedik# cat schema.sql | docker exec -i servidor_mysql /usr/bin/mysql -u root --password=asdasd bookmedik
```

Vemos de nuevo la web:

![](https://i.imgur.com/8uQH0Ae.png)

```
root@docker:~# docker ps
CONTAINER ID        IMAGE                         COMMAND                  CREATED             STATUS              PORTS                NAMES
e82d5e331fab        ernestovazquez/bookmedik:v1   "/usr/local/bin/scri…"   2 minutes ago       Up 2 minutes        0.0.0.0:80->80/tcp   bookmedik
f25dbff87579        mariadb                       "docker-entrypoint.s…"   3 minutes ago       Up 3 minutes        3306/tcp             servidor_mysql

root@docker:~# docker rm -f f25dbff87579
f25dbff87579
root@docker:~# docker rm -f e82d5e331fab
e82d5e331fab

root@docker:~# docker run -d --name servidor_mysql --network bookmedik -v /opt/bbdd_mariadb:/var/lib/mysql -e MYSQL_DATABASE=bookmedik -e MYSQL_USER=bookmedik -e MYSQL_PASSWORD=bookmedik -e MYSQL_ROOT_PASSWORD=asdasd mariadb
a59e9e77e97f3881bfec19853d0cad9ca7a738f42e2ee329310bc60fee4b659f

root@docker:~# docker run -d --name bookmedik --network bookmedik -v /opt/logs_apache2:/var/log/apache2 -p 80:80 ernestovazquez/bookmedik:v1
ae3d89739b7ad7ed843caa7ec4657f4699d2cd85e86f0b29625129209af2e4d6
```

![](https://i.imgur.com/t47Jnjj.png)

## Tarea 2

**Ejecución de una aplicación web PHP con imagenes de PHP y apache2 de DockerHub**

* Realiza la imagen docker de la aplicación a partir de la imagen oficial PHP que encuentras en docker hub. Lee la documentación de la imagen para configurar una imagen con apache2 y php, además seguramente tengas que instalar alguna extensión de php.
* Crea esta imagen en docker hub.
* Crea un script con docker compose que levante el escenario con los dos contenedores.

***

Ahora vamos a crear un script con docker compose que levante el escenario con los dos contenedores.

```
version: '3.1'

services:
  bookmedikt2:
    container_name: bookmedikt2
    image: php:7.4.3-apache
    restart: always
    environment:
      MARIADB_USER: bookmedik
      MARIADB_PASS: bookmedik
      MARIADB_HOST: mysqlt2
    ports:
      - 80:80
    volumes:
      - /opt/logs_apache2:/var/log/apache2
      - ./script.sh:/usr/local/bin/script.sh
      - ./bookmedik:/var/www/html
    command: >
      bash /usr/local/bin/script.sh
  mysqlt2:
    container_name: mysqlt2
    image: mariadb
    restart: always
    environment:
      MYSQL_DATABASE: bookmedik
      MYSQL_USER: bookmedik
      MYSQL_PASSWORD: bookmedik
      MYSQL_ROOT_PASSWORD: asdasd
    volumes:
      - /opt/mariat2:/var/lib/mysql
```

Dockerfile:

```
FROM php:7.4.3-apache
ENV MARIADB_USER bookmedik
ENV MARIADB_PASS bookmedik
ENV MARIADB_HOST mysqlt2
RUN docker-php-ext-install pdo pdo_mysql mysqli json
RUN a2enmod rewrite
EXPOSE 80
WORKDIR /var/www/html
COPY ./bookmedik /var/www/html
ADD script.sh /usr/local/bin/script.sh
RUN chmod +x /usr/local/bin/script.sh
CMD ["/usr/local/bin/script.sh"]
```

Añadimos la siguiente linea al script que hemos creado anteriormente:

    docker-php-ext-install pdo pdo_mysql mysqli json

Levantamos docker-compose:

```
root@docker:~/tarea2# docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES

root@docker:~/tarea2# docker-compose up -d
Creating bookmedikt2 ... done
Creating mysqlt2     ... done

root@docker:~/tarea2# docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                NAMES
03c7ae76bdd2        mariadb             "docker-entrypoint.s…"   39 seconds ago      Up 38 seconds       3306/tcp             mysqlt2
d6d8997f2cfc        php:7.4.3-apache    "docker-php-entrypoi…"   39 seconds ago      Up 38 seconds       0.0.0.0:80->80/tcp   bookmedikt2
```

![](https://i.imgur.com/vAlZ0cQ.png)

https://github.com/ernestovazquez/docker-tarea2

## Tarea 3

**Ejecución de un CMS en docker**


* En este caso queremos usar un contenedor que utilice nginx para servir la aplicación PHP. Puedes crear la imagen desde una imagen base debian o ubuntu o desde la imagen oficial de nginx.
* Vamos a crear otro contenedor que sirva php-fpm.
* Y finalmente nuestro contenedor con la aplicación.
* Crea un script con docker compose que levante el escenario con los tres contenedores.

A lo mejor te puede ayudar el siguiente enlace: Dockerise your PHP application with Nginx and PHP7-FPM

***

Creamos el docker-compose:

```
version: '3.1'

services:
  db:
    container_name: nginxdb           
    image: mariadb
    restart: always
    environment:
      MYSQL_USER: bookmedik
      MYSQL_PASSWORD: bookmedik
      MYSQL_DATABASE: bookmedik
      MYSQL_ROOT_PASSWORD: root
    volumes:
      - /opt/mariat3:/var/lib/mysql
```
Levantamos el contenedor:

```
root@docker:~/tarea3# docker-compose up -d
Creating network "tarea3_default" with the default driver
Creating nginxdb ... done
```
Comprobaciones:

```
root@docker:~/tarea3/bookmedik# cat schema.sql | docker exec -i nginxdb /usr/bin/mysql -u root --password=root
root@docker:~/tarea3/bookmedik# docker exec -it nginxdb bash
MariaDB [bookmedik]> show tables;
+---------------------+
| Tables_in_bookmedik |
+---------------------+
| category            |
| medic               |
| pacient             |
| payment             |
| reservation         |
| status              |
| user                |
+---------------------+
7 rows in set (0.001 sec)
```

Creación del Dockerfile:

```
root@docker:~/tarea3# nano Dockerfile

FROM php:7-fpm
RUN docker-php-ext-install mysqli
ENV MYSQL_USER bookmedik
ENV MYSQL_PASSWORD bookmedik
ENV MYSQL_HOST nginxdb           
ENV MYSQL_DB bookmedik
EXPOSE 9000
```
Creamos la imagen.

`root@docker:~/tarea3# docker build -t ernestovazquez/tarea3:v1 .`

Editamos el docker-compose:

```
root@docker:~/tarea3# nano docker-compose.yml 

  fpm:
    container_name: nginxfpm
    image: ernestovazquez/tarea3:v1
    volumes:
      - /opt/mariat3:/var/www/html
  app:
    container_name: bookmedik
    image: nginx:latest
    ports:
      - 80:80
    volumes:
      - /opt/mariat3:/var/www/html
      - ./bookmedik.conf:/etc/nginx/conf.d/default.conf
```

Por último levantamos los nuevos contenedores:

```
root@docker:~/tarea3# docker-compose up -d
```

## Tarea 4


* A partir de una imagen base (que no sea una imagen con el CMS), genera una imagen que despliegue un CMS PHP (que no sea wordpress). El contenedor que se crea a partir de esta imagen se tendrá que enlazar con un contenedor mariadb o postgreSQL.
* Crea los volúmenes necesarios para que la información que se guarda sea persistente.

***

## Tarea 5

**Ejecución de un CMS en docker con una imagen de DockerHub**

* Busca una imagen oficial de un CMS PHP en docker hub (distinto al que has instalado en la tarea anterior, ni wordpress), y crea los contenedores necesarios para servir el CMS, siguiendo la documentación de docker hub.

***

Creamos el docker-compose:

```
version: '3'
services:
  mediawiki:
    image: mediawiki
    restart: always
    ports:
      - 8080:80
    links:
      - database
    volumes:
      - /var/www/html/images
      - ./LocalSettings.php:/var/www/html/LocalSettings.php
  database:
    image: mariadb
    restart: always
    environment:
      MYSQL_DATABASE: my_wiki
      MYSQL_USER: wikiuser
      MYSQL_PASSWORD: example
      MYSQL_RANDOM_ROOT_PASSWORD: 'yes'
```

Lanzamos los contenedores con:

```
root@docker:~/mediawiki# docker-compose up -d
Creating mediawiki_database_1 ... done
Creating mediawiki_mediawiki_1 ... done
```

![](https://i.imgur.com/npeIROT.png)

![](https://i.imgur.com/reyDRZN.png)

![](https://i.imgur.com/Vshzxp9.png)

![](https://i.imgur.com/SOoIh4W.png)

Nos descargamos el fichero y lo ponemos en el mismo directorio que el docker-compose.

```
root@docker:~/mediawiki# ls
docker-compose.yml  LocalSettings.php
```

Cargamos de nuevo el docker-compose:

```
mediawiki_database_1 is up-to-date
Recreating mediawiki_mediawiki_1 ... done

root@docker:~/mediawiki# ls
docker-compose.yml  LocalSettings.php
```

![](https://i.imgur.com/OD7GAPW.png)

Ya tendremos nuestra página cargada e instalada.
