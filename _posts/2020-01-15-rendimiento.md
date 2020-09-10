---
title: "Ejecución de scripts PHP y Python. Rendimiento"
date: 2020-01-15 00:00:00 +0800
categories: [Servicios de red e internet]
tags: [PHP]
---

## Módulo php5-apache2

Instalamos los paquete necesarios:

```
vagrant@apache:/var/www/html$ sudo apt install php7.3 php7.3-mysql apache2 libapache2-mod-php7.3

vagrant@apache:/var/www/html$ sudo apt install mariadb-client mariadb-server
```

Creamos la bd:

```
vagrant@apache:/var/www/html$ sudo mysql -u root -p
Enter password: 
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 48
Server version: 10.3.18-MariaDB-0+deb10u1 Debian 10

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> create database wordpress;
Query OK, 1 row affected (0.001 sec)

MariaDB [(none)]> use wordpress;
Database changed
MariaDB [wordpress]> create user 'wordpress'@'localhost';
Query OK, 0 rows affected (0.004 sec)

MariaDB [wordpress]> grant all privileges on wordpress.* to 'wordpress'@'localhost' identified by 'wordpress';
Query OK, 0 rows affected (0.001 sec)

MariaDB [wordpress]> flush privileges;
Query OK, 0 rows affected (0.001 sec)
```

```
vagrant@apache:/var/www/html$ curl -O https://wordpress.org/latest.tar.gz

vagrant@apache:/var/www/html$ tar xzvf latest.tar.gz
```

![](https://i.imgur.com/zoIRcIZ.png)

![](https://i.imgur.com/faIydnT.png)


Editamos el siguiente fichero para cambiar el tamaño de la subida del fichero

```
root@apache:/etc/php/7.3/apache2# nano php.ini 

    upload_max_filesize = 512M
    post_max_size = 512M
```

![](https://i.imgur.com/dIUIdgP.png)

![](https://i.imgur.com/XiVg4aL.png)

Pruebas:

```
root@apache:~# ab -t 10 -c 200 -k http://172.22.3.105/wordpress/index.php

This is ApacheBench, Version 2.3 <$Revision: 1843412 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 172.22.3.105 (be patient)
Finished 684 requests

Server Software:        Apache/2.4.38
Server Hostname:        172.22.3.105
Server Port:            80

Document Path:          /wordpress/index.php
Document Length:        0 bytes

Concurrency Level:      200
Time taken for tests:   10.442 seconds
Complete requests:      684
Failed requests:        0
Non-2xx responses:      684
Keep-Alive requests:    0
Total transferred:      170316 bytes
HTML transferred:       0 bytes
Requests per second:    65.50 [#/sec] (mean)
Time per request:       3053.315 [ms] (mean)
Time per request:       15.267 [ms] (mean, across all concurrent requests)
Transfer rate:          15.93 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0   32 167.6      0    1032
Processing:    46 1385 620.3   1319    4960
Waiting:       42 1383 619.5   1317    4960
Total:         52 1416 643.4   1325    4966

Percentage of the requests served within a certain time (ms)
  50%   1325
  66%   1458
  75%   1550
  80%   1628
  90%   1872
  95%   2358
  98%   3037
  99%   4862
 100%   4966 (longest request)
```

**Requests per second: 65.50 [#/sec] (mean)
Requests per second: 69.27 [#/sec] (mean)
Requests per second: 65.68 [#/sec] (mean)
Requests per second: 49.88 [#/sec] (mean)
Requests per second: 68.65 [#/sec] (mean)**

**Media**: 63,796

## PHP-FPM (socket unix) + apache2

Paquetes necesarios:

    vagrant@apache:/var/www$ sudo apt install php7.3-fpm php-common

```
vagrant@apache:/var/www$ sudo nano /etc/php/7.3/fpm/pool.d/www.conf

listen = /run/php/php7.3-fpm.sock
```

Añadimos al VirtulHost lo siguiente:

```
<VirtualHost /var/www/wordpress/>

        ServerAdmin webmaster@localhost
        DocumentRoot /var/www/html/wordpress
        servername www.apacheunix.com

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined

        <FilesMatch "\.php$">
                SetHandler "proxy:unix:/run/php/php7.3-fpm.sock|fcgi://127.0.0.1/" 
        </FilesMatch>

</VirtualHost>
```

Activamos y reiniciamos los servicios del php-fpm

```
vagrant@apache:/var/www$ sudo a2enconf php7.3-fpm

Enabling conf php7.3-fpm.
To activate the new configuration, you need to run:
  systemctl reload apache2

vagrant@apache:/var/www$ sudo systemctl restart php7.3-fpm.service 
```

![](https://i.imgur.com/nf4817U.png)

Para cambiar el tamaño máximo de subida de imagen cambiamos los siguientes parámetros:

```
vagrant@apache:/var/www/html$ sudo nano /etc/php/7.3/fpm/php.ini 

upload_max_filesize = 512M
post_max_size = 512M
```

![](https://i.imgur.com/DMiFeQi.png)

Pruebas:

```
vagrant@apache:~$ ab -t 10 -c 200 -k http://192.168.1.124/wordpress/index.php

This is ApacheBench, Version 2.3 <$Revision: 1843412 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 192.168.1.124 (be patient)
Finished 1075 requests

Server Software:        Apache/2.4.38
Server Hostname:        192.168.1.124
Server Port:            80

Document Path:          /wordpress/index.php
Document Length:        0 bytes

Concurrency Level:      200
Time taken for tests:   10.001 seconds
Complete requests:      1075
Failed requests:        0
Non-2xx responses:      1074
Keep-Alive requests:    1074
Total transferred:      307365 bytes
HTML transferred:       0 bytes
Requests per second:    107.48 [#/sec] (mean)
Time per request:       1860.742 [ms] (mean)
Time per request:       9.304 [ms] (mean, across all concurrent requests)
Transfer rate:          30.01 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    3  31.5      0    1028
Processing:    38 1633 850.5   1769    6172
Waiting:        0 1633 850.7   1769    6172
Total:         46 1636 855.6   1769    6181

Percentage of the requests served within a certain time (ms)
  50%   1769
  66%   1818
  75%   1839
  80%   1854
  90%   2432
  95%   3459
  98%   3835
  99%   4935
 100%   6181 (longest request)
```

**Requests per second: 107.48 [#/sec] (mean)
Requests per second: 107.74 [#/sec] (mean)
Requests per second: 108.97 [#/sec] (mean)
Requests per second: 107.77 [#/sec] (mean)
Requests per second: 103.37 [#/sec] (mean)**

**Media**: 107.066

## PHP-FPM (socket TCP) + apache2

Modificamos el siguiente fichero de configuración:

```
vagrant@apache:~$ sudo nano /etc/php/7.3/fpm/pool.d/www.conf 

;listen = /run/php/php7.3-fpm.sock
listen = 127.0.0.1:9000 
```

```
vagrant@apache:~$ sudo nano /etc/apache2/conf-available/php7.3-fpm.conf 

    <FilesMatch ".+\.ph(ar|p|tml)$">
#        SetHandler "proxy:unix:/run/php/php7.3-fpm.sock|fcgi://localhost" 
        SetHandler "proxy:fcgi://127.0.0.1:9000" 
    </FilesMatch>
```

Pruebas:

```
vagrant@apache:~$ ab -t 10 -c 200 -k http://192.168.1.124/wordpress/index.php

This is ApacheBench, Version 2.3 <$Revision: 1843412 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 192.168.1.124 (be patient)
Finished 1073 requests

Server Software:        Apache/2.4.38
Server Hostname:        192.168.1.124
Server Port:            80

Document Path:          /wordpress/index.php
Document Length:        0 bytes

Concurrency Level:      200
Time taken for tests:   10.016 seconds
Complete requests:      1073
Failed requests:        0
Non-2xx responses:      1072
Keep-Alive requests:    1072
Total transferred:      306737 bytes
HTML transferred:       0 bytes
Requests per second:    107.13 [#/sec] (mean)
Time per request:       1866.951 [ms] (mean)
Time per request:       9.335 [ms] (mean, across all concurrent requests)
Transfer rate:          29.91 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    3  31.5      0    1022
Processing:    24 1250 691.0   1176    7500
Waiting:        0 1250 691.1   1176    7500
Total:         27 1252 697.4   1176    7509

Percentage of the requests served within a certain time (ms)
  50%   1176
  66%   1226
  75%   1266
  80%   1412
  90%   1958
  95%   2256
  98%   2511
  99%   4467
 100%   7509 (longest request)
```

**Requests per second: 107.13 [#/sec] (mean)
Requests per second: 104.33 [#/sec] (mean)
Requests per second: 108.11 [#/sec] (mean)
Requests per second: 109.71 [#/sec] (mean)
Requests per second: 106.51 [#/sec] (mean)**

**Media**: 107,158

## PHP-FPM (socket unix) + nginx

```
vagrant@nginx:/var/www/html/wordpress$ sudo nano /etc/php/7.3/fpm/pool.d/www.conf

listen = /run/php/php7.3-fpm.sock
```

```
vagrant@nginx:~$ sudo nano /etc/nginx/sites-available/wordpress.conf 

server {
    listen 80;
    listen [::]:80;
    root /var/www/wordpress;
    index  index.php index.html index.htm;
    server_name  www.wordpressnginx.org;

     client_max_body_size 100M;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
    include snippets/fastcgi-php.conf;
    fastcgi_pass    unix:/var/run/php/php7.3-fpm.sock;
    fastcgi_param   SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

Editamos el siguiente fichero para cambiar el tamaño de la subida del fichero:

```
vagrant@nginx:~$ sudo nano /etc/php/7.3/fpm/php.ini 

upload_max_filesize = 512M
post_max_size = 512M
```

![](https://i.imgur.com/mUzzYsL.png)

Pruebas:

```
vagrant@nginx:~$ ab -t 10 -c 200 -k http://192.168.1.13/index.php

This is ApacheBench, Version 2.3 <$Revision: 1843412 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 192.168.1.13 (be patient)
Completed 5000 requests
Completed 10000 requests
Completed 15000 requests
Completed 20000 requests
Completed 25000 requests
Completed 30000 requests
Completed 35000 requests
Completed 40000 requests
Completed 45000 requests
Completed 50000 requests
Finished 50000 requests

Server Software:        nginx/1.14.2
Server Hostname:        192.168.1.13
Server Port:            80

Document Path:          /index.php
Document Length:        0 bytes

Concurrency Level:      200
Time taken for tests:   5.661 seconds
Complete requests:      50000
Failed requests:        49170
   (Connect: 0, Receive: 0, Length: 49170, Exceptions: 0)
Non-2xx responses:      50000
Keep-Alive requests:    48964
Total transferred:      16399370 bytes
HTML transferred:       8506410 bytes
Requests per second:    8832.08 [#/sec] (mean)
Time per request:       22.645 [ms] (mean)
Time per request:       0.113 [ms] (mean, across all concurrent requests)
Transfer rate:          2828.92 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.4      0      11
Processing:     0   21 113.7      6    1284
Waiting:        0   21 113.6      6    1284
Total:          0   21 113.8      6    1290

Percentage of the requests served within a certain time (ms)
  50%      6
  66%      7
  75%      9
  80%     10
  90%     14
  95%     19
  98%     32
  99%    875
 100%   1290 (longest request)
```

**Requests per second: 8832.08 [#/sec] (mean)
Requests per second: 7258.82 [#/sec] (mean)
Requests per second: 6625.03 [#/sec] (mean)
Requests per second: 6700.40 [#/sec] (mean)
Requests per second: 7078.03 [#/sec] (mean)**

**Media**: 7298,872

## PHP-FPM (socket TCP) + nginx

Solamente tendremos que editar lo siguiente:

```
    location ~ \.php$ {
    include snippets/fastcgi-php.conf;
#    fastcgi_pass    unix:/var/run/php/php7.3-fpm.sock;
    fastcgi_pass 127.0.0.1:9000;
    fastcgi_param   SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
```


Comentamos el anterior y añadimos el nuevo.

```
vagrant@nginx:/var/www$ sudo nano /etc/php/7.3/fpm/pool.d/www.conf

;listen = /run/php/php7.3-fpm.sock
listen = 127.0.0.1:9000
```

Pruebas:

```
vagrant@nginx:/var/www$ ab -t 10 -c 200 -k http://192.168.1.13/index.php

This is ApacheBench, Version 2.3 <$Revision: 1843412 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 192.168.1.13 (be patient)
Finished 1083 requests

Server Software:        nginx/1.14.2
Server Hostname:        192.168.1.13
Server Port:            80

Document Path:          /index.php
Document Length:        0 bytes

Concurrency Level:      200
Time taken for tests:   10.002 seconds
Complete requests:      1083
Failed requests:        0
Non-2xx responses:      1083
Keep-Alive requests:    0
Total transferred:      227430 bytes
HTML transferred:       0 bytes
Requests per second:    108.27 [#/sec] (mean)
Time per request:       1847.164 [ms] (mean)
Time per request:       9.236 [ms] (mean, across all concurrent requests)
Transfer rate:          22.20 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    2   4.4      0      18
Processing:    28 1214 487.8   1177    8923
Waiting:       28 1214 487.8   1177    8923
Total:         47 1216 486.1   1177    8929

Percentage of the requests served within a certain time (ms)
  50%   1177
  66%   1186
  75%   1195
  80%   1204
  90%   1235
  95%   2199
  98%   2383
  99%   2638
 100%   8929 (longest request)
```

**Requests per second: 108.27 [#/sec] (mean)
Requests per second: 109.05 [#/sec] (mean)
Requests per second: 109.02 [#/sec] (mean)
Requests per second: 108.23 [#/sec] (mean)
Requests per second: 108.18 [#/sec] (mean)**

**Media**: 108,55

## Rendimiento

**Nginx + PHP-FPM (Socket UNIX)** ha sido el que ha dado mejores resultados.

Vamos a aumentar el rendimiento con **memcached**.

Instalamos **memcached**:

```
root@nginx:~# apt install memcached
root@nginx:~# apt install php7.3-memcached
```

Iniciamos los servicios del mismo:

```
root@nginx:~# systemctl start memcached

root@nginx:~# systemctl status memcached

● memcached.service - memcached daemon
   Loaded: loaded (/lib/systemd/system/memcached.service; enabled; vendor preset: enabled)
   Active: active (running) since Mon 2020-01-20 18:21:48 GMT; 39s ago
     Docs: man:memcached(1)
 Main PID: 2379 (memcached)
    Tasks: 10 (limit: 545)
   Memory: 1.3M
   CGroup: /system.slice/memcached.service
           └─2379 /usr/bin/memcached -m 64 -p 11211 -u memcache -l 127.0.0.1 -P /var/run/memcached/memcached.pid

Jan 20 18:21:48 nginx systemd[1]: Started memcached daemon.
Jan 20 18:21:48 nginx systemd[1]: /lib/systemd/system/memcached.service:13: PIDFile= references path below legacy directory /var/run/, updating /var/r
```

Instalación del plugin:

```
root@nginx:/var/www/wordpress/wp-content/plugins# wget https://downloads.wordpress.org/plugin/w3-total-cache.0.12.0.zip

root@nginx:/var/www/wordpress/wp-content/plugins# unzip w3-total-cache.0.12.0.zip 

root@nginx:/var/www/wordpress/wp-content/plugins# ls
akismet  hello.php  index.php  w3-total-cache  w3-total-cache.0.12.0.zip
```

Pruebas:

```
vagrant@nginx:~$ ab -t 10 -c 200 -k http://192.168.1.13/index.php

This is ApacheBench, Version 2.3 <$Revision: 1843412 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 192.168.1.13 (be patient)
Completed 5000 requests
Completed 10000 requests
Completed 15000 requests
Completed 20000 requests
Completed 25000 requests
Completed 30000 requests
Completed 35000 requests
Completed 40000 requests
Completed 45000 requests
Completed 50000 requests
Finished 50000 requests

Server Software:        nginx/1.14.2
Server Hostname:        192.168.1.13
Server Port:            80

Document Path:          /index.php
Document Length:        0 bytes

Concurrency Level:      200
Time taken for tests:   7.409 seconds
Complete requests:      50000
Failed requests:        49482
   (Connect: 0, Receive: 0, Length: 49482, Exceptions: 0)
Non-2xx responses:      50000
Keep-Alive requests:    49177
Total transferred:      16436315 bytes
HTML transferred:       8560386 bytes
Requests per second:    6748.31 [#/sec] (mean)
Time per request:       29.637 [ms] (mean)
Time per request:       0.148 [ms] (mean, across all concurrent requests)
Transfer rate:          2166.36 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.6      0      12
Processing:     0   25 176.2      7    2416
Waiting:        0   25 176.1      7    2416
Total:          0   25 176.4      7    2425

Percentage of the requests served within a certain time (ms)
  50%      7
  66%      9
  75%     10
  80%     11
  90%     15
  95%     19
  98%     27
  99%    499
 100%   2425 (longest request)
```

**Requests per second: 6748.31 [#/sec] (mean)
Requests per second: 5808.03 [#/sec] (mean)
Requests per second: 6597.21 [#/sec] (mean)
Requests per second: 6772.13 [#/sec] (mean)
Requests per second: 6585.21 [#/sec] (mean)**

**Media**: 6502,178 (No hemos mejorado el resultado anterior)

## Instalación y configuración de varnish:

    root@nginx:~# apt install varnish

Cambiamos el puerto de escucha para que este en el 80:

```
vagrant@nginx:~$ sudo nano /etc/default/varnish

DAEMON_OPTS="-a :80 \
             -T localhost:6082 \
             -f /etc/varnish/default.vcl \
             -S /etc/varnish/secret \
             -s malloc,256m" 
```

Escucha:

```
vagrant@nginx:~$ sudo nano /lib/systemd/system/varnish.service

ExecStart=/usr/sbin/varnishd -j unix,user=vcache -F -a :80 -T localhost:6082 -f /etc/varnish/default.vcl -S /etc/varnish/secret -s malloc,256m
```

Reiniciamos los servicios:

```
root@nginx:~# systemctl daemon-reload
root@nginx:~# systemctl restart varnish
```

Pruebas:

```
ernesto@honda:~$ ab -t 10 -c 200 -k http://172.22.2.148/index.php

This is ApacheBench, Version 2.3 <$Revision: 1843412 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 172.22.2.148 (be patient)
Completed 5000 requests
Completed 10000 requests
Completed 15000 requests
Completed 20000 requests
Completed 25000 requests
Completed 30000 requests
Completed 35000 requests
Completed 40000 requests
Completed 45000 requests
Completed 50000 requests
Finished 50000 requests

Server Software:        nginx/1.14.2
Server Hostname:        172.22.2.148
Server Port:            80

Document Path:          /index.php
Document Length:        0 bytes

Concurrency Level:      200
Time taken for tests:   3.203 seconds
Complete requests:      50000
Failed requests:        0
Non-2xx responses:      50000
Keep-Alive requests:    50000
Total transferred:      14790374 bytes
HTML transferred:       0 bytes
Requests per second:    15612.40 [#/sec] (mean)
Time per request:       12.810 [ms] (mean)
Time per request:       0.064 [ms] (mean, across all concurrent requests)
Transfer rate:          4510.02 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.3      0       6
Processing:     0   12   6.9     12     296
Waiting:        0   12   6.8     12     291
Total:          0   12   7.0     12     297

Percentage of the requests served within a certain time (ms)
  50%     12
  66%     13
  75%     13
  80%     13
  90%     14
  95%     18
  98%     23
  99%     24
 100%    297 (longest request)

Requests per second: 15612.40 [#/sec] (mean)
Requests per second: 17072.40 [#/sec] (mean)
Requests per second: 16922.43 [#/sec] (mean)
Requests per second: 17306.85 [#/sec] (mean)
Requests per second: 16722.91 [#/sec] (mean)
```

**Media**: 16727,398 (Mejor resultado, hemos aumentado considerablemente el rendimiento del servidor con varnish).
