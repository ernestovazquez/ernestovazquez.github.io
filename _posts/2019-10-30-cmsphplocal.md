---
title: "Instalación local de un CMS PHP"
author: Ernesto Vázquez García
date: 2019-10-30 00:00:00 +0800
categories: [Implantación de aplicaciones web]
tags: [CMS]
---

**Tarea 1: Instalación de un servidor LAMP**

Creamos una instancia de vagrant basado en un box debian buster

```
# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://vagrantcloud.com/search.
  config.vm.box = "debian/buster64" 
  config.vm.hostname = "lamp" 
  config.vm.network :public_network,:bridge=>"wlan0" 
end
```

Paso 1: Actualizamos el sistema

    sudo apt update && sudo apt -y upgrade

Paso 2: Instalamos MariaDB

    sudo apt install -y mariadb-server mariadb-client

Paso 3: Instalamos Apache:

    sudo apt install -y apache2 apache2-utils

Paso 4: Instalamos PHP

    sudo apt install php libapache2-mod-php php-cli php-fpm php-json php-pdo php-mysql php-zip php-gd php-mbstring php-curl php-xml php-pear php-bcmath

Habilitamos el módulo Apache si aún no está habilitado.

    sudo a2enmod php7.3

Creamos un ejemplo para probar la instalación de la pila

    echo "<? php phpinfo ();?>" | sudo tee /var/www/html/phpinfo.php

![](https://i.imgur.com/GjgPeVQ.png)

**Tarea 2: Instalación de drupal en mi servidor local**

- Configura el servidor web con virtual hosting para que el CMS sea accesible desde la dirección: www.nombrealumno-drupal.org.

Primero instalamos drupal con:

    wget https://ftp.drupal.org/files/projects/drupal-8.7.8.zip

Creamos un nuevo fichero en `/etc/apache2/sites-available/`

    vagrant@lamp:/etc/apache2/sites-available$ sudo cp 000-default.conf drupal.conf

```
vagrant@lamp:/etc/apache2/sites-available$ sudo nano drupal.conf

<VirtualHost *:80>
        # The ServerName directive sets the request scheme, hostname and port that
        # the server uses to identify itself. This is used when creating
        # redirection URLs. In the context of virtual hosts, the ServerName
        # specifies what hostname must appear in the request's Host: header to
        # match this virtual host. For the default virtual host (this file) this
        # value is not decisive as it is used as a last resort host regardless.
        # However, you must set it for any further virtual host explicitly.

        ServerName www.ernesto-drupal.org

        ServerAdmin webmaster@localhost
        DocumentRoot /var/www/drupal

        # Available loglevels: trace8, ..., trace1, debug, info, notice, warn,
        # error, crit, alert, emerg.
        # It is also possible to configure the loglevel for particular
        # modules, e.g.
        #LogLevel info ssl:warn

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined

        # For most configuration files from conf-available/, which are
        # enabled or disabled at a global level, it is possible to
        # include a line for only one particular virtual host. For example the
        # following line enables the CGI configuration for this host only
        # after it has been globally disabled with "a2disconf".
        #Include conf-available/serve-cgi-bin.conf
</VirtualHost>

# vim: syntax=apache ts=4 sw=4 sts=4 sr noet
```

    sudo a2ensite drupal.conf

Copiamos drupal a `/var/www/drupal`

    vagrant@lamp:~$ sudo mv drupal-8.7.8 /var/www/drupal

Reiniciamos los servicios de apache2 y entramos en www.ernesto-drupal.org y configuramos

    vagrant@lamp:~$ sudo systemctl restart apache2

Configuraciones para el pleno funcionamiento:

```
cd /var/www/drupal/
cd ..
sudo chmod o+w sites/default
sudo nano ./sites/default/default.settings.php
sudo cp ./sites/default/default.settings.php ./sites/default/settings.php
sudo chmod 777 settings.php
sudo chmod 777 files/
```

![](https://i.imgur.com/pq2jJwS.png)

- Crea un usuario en la base de datos para trabajar con la base de datos donde se van a guardar los datos del CMS.

```
CREATE DATABASE basedrupal;

use basedrupal;

CREATE USER 'ernesto'@'localhost' IDENTIFIED BY 'ernesto';

GRANT ALL PRIVILEGES ON basedrupal to 'ernesto'@'localhost';

FLUSH PRIVILEGES;

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, CREATE TEMPORARY TABLES ON basedrupal.* TO 'ernesto'@'localhost' IDENTIFIED BY 'ernesto';
```

```
vagrant@lamp:~$ mysql -u ernesto -p
Enter password: 
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 21
Server version: 10.3.17-MariaDB-0+deb10u1 Debian 10

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> use basedrupal
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed

MariaDB [basedrupal]> 
```

He tenido que añadir la siguiente linea para tener permisos en drupal:

```
root@lamp:/etc/apache2/sites-available# nano drupal.conf 

        <Directory "/var/www/drupal">

        AllowOverride None

        AllowOverride All

        </directory>
```

- Realiza una configuración mínima de la aplicación (Cambia la plantilla, crea algún contenido, …)

Descargamos el tema en la carpeta themes y descomprimimos

```
vagrant@lamp:/var/www/drupal/themes$ wget https://ftp.drupal.org/files/projects/adminimal_theme-8.x-1.5.tar.gz

vagrant@lamp:/var/www/drupal/themes$ tar -xvf adminimal_theme-8.x-1.5.tar.gz 

vagrant@lamp:/var/www/drupal/themes$ sudo systemctl reload apache2
```

Dentro de la web de drupal, cambiamos el anterior tema por el nuevo en la pestaña de Appearance

![](https://i.imgur.com/pAYXJZC.png)

- Añadimos contenido.

![](https://i.imgur.com/5ejH0gl.png)

- Instala un módulo para añadir alguna funcionalidad a drupal.

```
vagrant@lamp:/var/www/drupal/modules$ wget https://ftp.drupal.org/files/projects/pathauto-8.x-1.5.tar.gz

vagrant@lamp:/var/www/drupal/modules$ tar -xvf pathauto-8.x-1.5.tar.gz 
```

![](https://i.imgur.com/J2D8mB7.png)

**Tarea 3: Configuración multinodo**

- Realiza un copia de seguridad de la base de datos.

El método que vamos a utilizar para crear copias de seguridad de MySQL es el siguiente:

```
vagrant@lamp:~$ mysqldump --single-transaction -u ernesto -p basedrupal > backup.sql
Enter password: 
```

- Crea otra máquina con vagrant, conectada con una red interna a la anterior y configura un servidor de base de datos.

Máquina 1:

```
    config.vm.box = "debian/buster64" 
    config.vm.hostname = "lamp" 
    config.vm.network :public_network,:bridge=>"wlan0" 
    config.vm.network "private_network", ip: "192.168.100.1",
      virtualbox__intnet: "redinterna" 
```

Máquina 2:

```
  config.vm.define :clientelamp do |clientelamp|
    clientelamp.vm.box = "debian/buster64" 
    clientelamp.vm.hostname = "clientelamp" 
    clientelamp.vm.network "public_network",:bridge=>"wlan0" 
    clientelamp.vm.network "private_network", ip: "192.168.100.2",
      virtualbox__intnet: "redinterna" 
  end
```

- Crea un usuario en la base de datos para trabajar con la nueva base de datos.

```
MariaDB [(none)]> CREATE USER 'ernesto' IDENTIFIED BY 'ernesto';
MariaDB [(none)]> GRANT USAGE ON *.* TO 'ernesto'@localhost IDENTIFIED BY 'ernesto';
MariaDB [(none)]> GRANT USAGE ON *.* TO 'ernesto'@'%' IDENTIFIED BY 'ernesto';
MariaDB [(none)]> GRANT ALL privileges ON `basedrupal`.* TO 'ernesto'@localhost;
MariaDB [(none)]> FLUSH PRIVILEGES;
        Query OK, 0 rows affected (0.001 sec)

MariaDB [(none)]> create database basedrupal;
        Query OK, 1 row affected (0.001 sec)
```

- Restaura la copia de seguridad en el nuevo servidor de base datos.

```
mysql --user=ernesto --password basedrupal < backup.sql
        Enter password: 
```

- Desinstala el servidor de base de datos en el servidor principal.

`vagrant@lamp:~$ sudo apt-get --purge remove mysql-common`

- Realiza los cambios de configuración necesario en drupal para que la página funcione.

    vagrant@lamp:/var/www/drupal/sites/default$ sudo nano settings.php

Cambiamos el host a la ip de la red interna del cliente.

```
$databases['default']['default'] = array (
  'database' => 'basedrupal',
  'username' => 'ernesto',
  'password' => 'ernesto',
  'prefix' => '',
  'host' => '192.168.100.2',
  'port' => '3306',
  'namespace' => 'Drupal\\Core\\Database\\Driver\\mysql',
  'driver' => 'mysql',
```

    vagrant@clientelamp:/etc/mysql$ sudo nano mariadb.conf.d/50-server.cnf

```
[mysqld]

#
# * Basic Settings
#
user                    = mysql
pid-file                = /run/mysqld/mysqld.pid
socket                  = /run/mysqld/mysqld.sock
#port                   = 3306
basedir                 = /usr
datadir                 = /var/lib/mysql
tmpdir                  = /tmp
lc-messages-dir         = /usr/share/mysql
#skip-external-locking

# Instead of skip-networking the default is now to listen only on
# localhost which is more compatible and is not less secure.
bind-address            = 0.0.0.0
```

![](https://i.imgur.com/M0XeYCo.png)

**Tarea 4: Instalación de otro CMS PHP**

Descargamos de la página oficial el CMS PHP.

    https://www.mediawiki.org/wiki/Download/es

Copiamos la configuración.

```
vagrant@lamp:/etc/apache2/sites-available$ sudo cp drupal.conf mediawiki.conf

        ServerName www.ernesto-mediawiki.org
        ServerAdmin webmaster@localhost
        DocumentRoot /var/www/mediawiki

        <Directory "/var/www/mediawiki">
        AllowOverride None
        AllowOverride All
        </directory>
```

    sudo a2ensite mediawiki.conf

Copiamos mediawiki a /var/www/mediawiki

    vagrant@lamp:~$ sudo mv mediawiki-1.33.1 /var/www/mediawiki/

Reiniciamos los servicios de apache2.

    vagrant@lamp:~$ sudo systemctl restart apache2

Creamos una nueva base de datos en MariaDB llamada basemediawiki

Y ya tendríamos nuestra instalación terminada

![](https://i.imgur.com/Nse8oO0.png)

Vamos a cambiarle el logo a nuestra página

    vagrant@lamp:/var/www/mediawiki$ sudo nano LocalSettings.php
    
![](https://i.imgur.com/qDH2118.png)

Cambiamos la ruta y poner el nuevo logo.

![](https://i.imgur.com/GzuUAuH.png)


- Instala un servidor de correo electrónico en tu servidor. Debes configurar un servidor relay de correo, para ello en el fichero /etc/postfix/main.cf , debes poner la siguiente línea:

    relayhost = babuino-smtp.gonzalonazareno.org

Primero instalamos postfix

    vagrant@lamp:~$ sudo apt-get install postfix

Editamos el archivo que hemos comentado previamente.

```
smtpd_relay_restrictions = permit_mynetworks permit_sasl_authenticated defer_unauth_destination
myhostname = lamp.gonzalonazareno.org
alias_maps = hash:/etc/aliases
alias_database = hash:/etc/aliases
myorigin = /etc/mailname
mydestination = $myhostname, ernestomediawiki.gonzalonazareno.org, lamp, localhost.localdomain, localhost
relayhost = babuino-smtp.gonzalonazareno.org
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128
mailbox_size_limit = 0
recipient_delimiter = +
inet_interfaces = all
inet_protocols = all
```

Y reiniciamos postfix

    vagrant@lamp:~$ sudo systemctl restart postfix

Vamos a enviar un correo de ejemplo, como el de restablecer contraseña

Para ello, vamos a iniciar sesión y darle a he olvidado la contraseña

![](https://i.imgur.com/5DstbWG.png)

Y nos enviará un correo con la nueva contraseña.

![](https://i.imgur.com/bvoDW7D.png)

