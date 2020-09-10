---
title: "Introducción al despliegue de aplicaciones python"
author: Ernesto Vázquez García
date: 2019-11-20 00:00:00 +0800
categories: [Implantación de aplicaciones web]
tags: [Python]
---

Clonamos el repositorio:

    ernesto@honda:~/Documentos$ git clone https://github.com/josedom24/django_tutorial.git

Creamos la maquina virtual

    ernesto@honda:~/virtualenv$ python3 -m venv practicadjango

Lo activamos:

    ernesto@honda:~/virtualenv$ source practicadjango/bin/activate

Instalamos dependencias:

    (practicadjango) ernesto@honda:~/Documentos/django_tutorial$ pip install -r requirements.txt

```
(practicadjango) ernesto@honda:~/Documentos/django_tutorial$ nano django_tutorial/settings.py

# Database

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}
```

Creamos la base de datos:

```
(practicadjango) ernesto@honda:~/Documentos/django_tutorial$ python manage.py migrate

Operations to perform:
  Apply all migrations: admin, auth, contenttypes, polls, sessions
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying admin.0001_initial... OK
  Applying admin.0002_logentry_remove_auto_add... OK
  Applying admin.0003_logentry_add_action_flag_choices... OK
  Applying contenttypes.0002_remove_content_type_name... OK
  Applying auth.0002_alter_permission_name_max_length... OK
  Applying auth.0003_alter_user_email_max_length... OK
  Applying auth.0004_alter_user_username_opts... OK
  Applying auth.0005_alter_user_last_login_null... OK
  Applying auth.0006_require_contenttypes_0002... OK
  Applying auth.0007_alter_validators_add_error_messages... OK
  Applying auth.0008_alter_user_username_max_length... OK
  Applying auth.0009_alter_user_last_name_max_length... OK
  Applying polls.0001_initial... OK
  Applying sessions.0001_initial... OK
```

Creamos usuario administrador:

```
(practicadjango) ernesto@honda:~/Documentos/django_tutorial$ python3 manage.py createsuperuser

Nombre de usuario (leave blank to use 'ernesto'): admin
Dirección de correo electrónico: 
Password: 
Password (again): 
Esta contraseña es demasiado corta. Debe contener al menos 8 caracteres.
Esta contraseña es demasiado común.
Bypass password validation and create user anyway? [y/N]: y
Superuser created successfully.
```

Iniciamos el servidor web:

    (practicadjango) ernesto@honda:~/Documentos/django_tutorial$ python manage.py runserver

![](https://i.imgur.com/hIwpdOF.png)

![](https://i.imgur.com/A48hl4n.png)

Creamos las preguntas y accedemos a /polls:

![](https://i.imgur.com/Ahyq0dI.png)

- Instala en el servidor los servicios necesarios (apache2). Instala el módulo de apache2 para ejecutar código python.

```
debian@django:~$ sudo apt install apache2
debian@django:~$ sudo apt install apache2-dev
debian@django:~$ sudo apt install libapache2-mod-wsgi-py3
debian@django:~$ sudo apt install python3-pip
debian@django:~$ sudo pip3 install mod_wsgi
```

Clonamos y subimos el repositorio a GitHub:

```
(practicadjango) ernesto@honda:~/Documentos$ git clone git@github.com:ernestovazquez/django.git
(practicadjango) ernesto@honda:~/Documentos/django$ git add django_tutorial/
(practicadjango) ernesto@honda:~/Documentos/django$ git commit -m "copiado de django" 
(practicadjango) ernesto@honda:~/Documentos/django$ git push
```

Hacemos un pull para bajar los ficheros nuevos:

    debian@django:~/django$ git pull

Configuración de apache2

```
        ServerName www.django-ernesto.iesgn.org

        ServerAdmin webmaster@localhost
        DocumentRoot /var/www/django/django_tutorial
        WSGIDaemonProcess django-ernesto.iesgn.org python-path=/var/www/django/django_tutorial
        WSGIScriptAlias / /var/www/django/django_tutorial/django_tutorial/wsgi.py

        <Directory /var/www/django/django_tutorial>
          <Files wsgi.py>
            WSGIProcessGroup django-ernesto.iesgn.org
            WSGIApplicationGroup %{GLOBAL}
            Require all granted
          </Files>
        </Directory>
```

Editamos el setting.conf

```
root@django:/var/www/django/django_tutorial/django_tutorial# sudo nano settings.py

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = ["www.django-ernesto.iesgn.org"]
```

Creamos el usuario administrador:

```
root@django:/var/www/django/django_tutorial# python3 manage.py createsuperuser

Nombre de usuario (leave blank to use 'root'):     
Dirección de correo electrónico: 
Password: 
Password (again): 
La contraseña es demasiado similar a la de nombre de usuario.
Esta contraseña es demasiado corta. Debe contener al menos 8 caracteres.
Esta contraseña es demasiado común.
Bypass password validation and create user anyway? [y/N]: y
Superuser created successfully.
```

![](https://i.imgur.com/kCsq849.png)

Cambio static:

```
root@django:/var/www/django/django_tutorial# nano django_tutorial/settings.py

STATIC_ROOT = '/var/www/django/django_tutorial/static'
```

    root@django:/var/www/django/django_tutorial# python3 manage.py collectstatic

```
        Alias /static /var/www/django/django_tutorial/static

        <Directory /var/www/django/static>
          Require all granted
        </Directory>
```

![](https://i.imgur.com/0eRLmGa.png)


