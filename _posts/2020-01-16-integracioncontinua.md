---
title: "Introducción a la integración continua"
author: Ernesto Vázquez García
date: 2020-01-16 00:00:00 +0800
categories: [Implantación de aplicaciones web]
tags: [Integración Continua]
---

Vamos a crear el repositorio donde vamos a trabajar.
También vamos a crear la rama gh-pages, donde estarán los ficheros generados por Hugo.

Fichero **.travis.yml**:

```
ernesto@honda:~/blog$ sudo nano .travis.yml

install:
  - wget https://github.com/gohugoio/hugo/releases/download/v0.53/hugo_0.53_Linux-64bit.deb && sudo dpkg -i hugo*.deb
  - git clone https://github.com/ernestovazquez/hugo.git

script:
  - rm hugo*.deb
  - hugo new site sitio
  - mkdir -p sitio/content/post
  - mkdir -p sitio/static/img
  - mv content/post/* sitio/content/post
  - mv static/img/* sitio/static/img
  - mv config.toml sitio/
  - cd sitio/themes && git clone https://github.com/nirocfz/arabica && cd ..
  - hugo -t arabica
  - rm -rf themes/arabica

deploy:
  provider: pages
  local-dir: sitio/public
  skip-cleanup: true
  github-token: $GH_TOKEN
  keep-history: true
  on:
    branch: master
  fqdn: ernestovazquez.es
```

Fichero **config.toml**:

```
ernesto@honda:~/blog$ sudo nano config.toml

baseURL = "https://ernestovazquez.es" 
title = "De Rookie a Leyenda" 
author = "Ernesto Vázquez" 
paginate = 3
theme = "arabica" 

[params]
description = "Ernesto Vázquez García" 
twitter = "ernestovazgar" 
```

Pasamos los ficheros Markdown que vamos a utilizar.

```
ernesto@honda:~$ ls blog/content/post/

oraclevspostgresql.md  servidorest1.md  servidorest3.md  servidorest6.md  servidorest8.md
resources              servidorest2.md  servidorest5.md  servidorest7.md
```

Generamos el **TOKEN**

Nos dirigimos a **Settings, Developer settings y Personal access tokens**

![](https://i.imgur.com/UxfBPOD.png)

Vamos a Travis y entramos en los ajustes del repositorio:

![](https://i.imgur.com/0g5jdY7.png)

Generamos un fichero de pruebas:

```
ernesto@honda:~/blog$ sudo nano content/post/pruebatravis.md 
[sudo] password for ernesto: 
ernesto@honda:~/blog$ git add *
ernesto@honda:~/blog$ git commit -m "prueba" 
[master b897f97] prueba
 1 file changed, 3 insertions(+), 2 deletions(-)
ernesto@honda:~/blog$ git push
Enumerando objetos: 9, listo.
Contando objetos: 100% (9/9), listo.
Compresión delta usando hasta 4 hilos
Comprimiendo objetos: 100% (4/4), listo.
Escribiendo objetos: 100% (5/5), 449 bytes | 449.00 KiB/s, listo.
Total 5 (delta 2), reusado 0 (delta 0)
remote: Resolving deltas: 100% (2/2), completed with 2 local objects.
To github.com:ernestovazquez/blog.git
   31cee85..b897f97  master -> master
```

Se inica travis automaticamente:

![](https://i.imgur.com/MpeAFt0.png)

Una vez pasado la integración podremos ver la página.

![](https://i.imgur.com/9nla4pC.png)

Ahora lo primero que vamos a hacer es clonar el repositorio:

    ernesto@honda:~/GitHub$ git clone https://github.com/josedom24/django_tutorial.git

Creamos el entorno virtual

    ernesto@honda:~/virtualenv$ python3 -m venv django_tutorial

Ahora tenemos que instalar el requirement :

```
(django_tutorial) ernesto@honda:~/GitHub/django_tutorial$ ls
django_tutorial  manage.py  polls  README.md  requirements.txt
```

    (django_tutorial) ernesto@honda:~/GitHub/django_tutorial$ pip install -r requirements.txt 

Realizaremos los test:

```
(django_tutorial) ernesto@honda:~/GitHub/django_tutorial$ python3 manage.py test
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
..........
----------------------------------------------------------------------
Ran 10 tests in 0.041s

OK
Destroying test database for alias 'default'...
```

Vamos a modificar el fichero para que falle, para ello vamos a cambiar la siguiente linea: 
***<p>No polls are available.</p>***

```
(django_tutorial) ernesto@honda:~/GitHub/django_tutorial$ nano polls/templates/polls/index.html

    <p>No hay encuestas disponibles.</p>
```

Vamos a realizar los test para ver el fallo:

```
(django_tutorial) ernesto@honda:~/GitHub/django_tutorial$ python3 manage.py test

Creating test database for alias 'default'...
System check identified no issues (0 silenced).
..F.F.....
======================================================================
FAIL: test_future_question (polls.tests.QuestionIndexViewTests)
----------------------------------------------------------------------
Traceback (most recent call last):
  File "/home/ernesto/GitHub/django_tutorial/polls/tests.py", line 79, in test_future_question
    self.assertContains(response, "No polls are available.")
  File "/home/ernesto/virtualenv/django_tutorial/lib/python3.7/site-packages/django/test/testcases.py", line 454, in assertContains
    self.assertTrue(real_count != 0, msg_prefix + "Couldn't find %s in response" % text_repr)
AssertionError: False is not true : Couldn't find 'No polls are available.' in response

======================================================================
FAIL: test_no_questions (polls.tests.QuestionIndexViewTests)
----------------------------------------------------------------------
Traceback (most recent call last):
  File "/home/ernesto/GitHub/django_tutorial/polls/tests.py", line 57, in test_no_questions
    self.assertContains(response, "No polls are available.")
  File "/home/ernesto/virtualenv/django_tutorial/lib/python3.7/site-packages/django/test/testcases.py", line 454, in assertContains
    self.assertTrue(real_count != 0, msg_prefix + "Couldn't find %s in response" % text_repr)
AssertionError: False is not true : Couldn't find 'No polls are available.' in response

----------------------------------------------------------------------
Ran 10 tests in 0.029s

FAILED (failures=2)
Destroying test database for alias 'default'...
```

Como podemos ver, nos salta los errores.

Ahora vamosa realizar las pruebas con **travis**, para ello, he realizado un **fork** del repositorio.

    (django_tutorial) ernesto@honda:~$ git clone git@github.com:ernestovazquez/django_tutorial.git

Editamos el dichero .travis.tml:

```
(django_tutorial) ernesto@honda:~/django_tutorial$ nano .travis.yml

language: python
python:
  - "3.8" 
install:
  - pip3 install -r requirements.txt
script: python3 manage.py test
```

Subimos los cambios al repositorio:

```
(django_tutorial) ernesto@honda:~/django_tutorial$ git add .travis.yml 

(django_tutorial) ernesto@honda:~/django_tutorial$ git commit -m "djangotest" 
[master 0c2f66c] djangotest
 1 file changed, 6 insertions(+)
 create mode 100644 .travis.yml

(django_tutorial) ernesto@honda:~/django_tutorial$ git push -u origin master
Enumerando objetos: 4, listo.
Contando objetos: 100% (4/4), listo.
Compresión delta usando hasta 4 hilos
Comprimiendo objetos: 100% (3/3), listo.
Escribiendo objetos: 100% (3/3), 382 bytes | 382.00 KiB/s, listo.
Total 3 (delta 1), reusado 0 (delta 0)
remote: Resolving deltas: 100% (1/1), completed with 1 local object.
To github.com:ernestovazquez/django_tutorial.git
   d363e55..0c2f66c  master -> master
Rama 'master' configurada para hacer seguimiento a la rama remota 'master' de 'origin'.
```

Como podemos observar en la foto, se ha realizado correctamente los cambios de forma automatica.

![](https://i.imgur.com/OLGeHcR.png)

Ahora vamos a agregar el error como antes para ver si travis muestra el error:

```
(django_tutorial) ernesto@honda:~/django_tutorial$ nano polls/templates/polls/index.html

{% else %}
    <p>No hay encuestas disponibles.</p>
{% endif %}
```

Ahora subimos el fichero y observamos travis.

```
(django_tutorial) ernesto@honda:~/django_tutorial$ git add polls/templates/polls/index.html 

(django_tutorial) ernesto@honda:~/django_tutorial$ git commit -m "No hay encuestas disponibles" 
[master 9f37e56] No hay encuestas disponibles
 1 file changed, 2 insertions(+), 2 deletions(-)

(django_tutorial) ernesto@honda:~/django_tutorial$ git push -u origin master
Enumerando objetos: 11, listo.
Contando objetos: 100% (11/11), listo.
Compresión delta usando hasta 4 hilos
Comprimiendo objetos: 100% (6/6), listo.
Escribiendo objetos: 100% (6/6), 610 bytes | 610.00 KiB/s, listo.
Total 6 (delta 3), reusado 0 (delta 0)
remote: Resolving deltas: 100% (3/3), completed with 3 local objects.
To github.com:ernestovazquez/django_tutorial.git
   0c2f66c..9f37e56  master -> master
Rama 'master' configurada para hacer seguimiento a la rama remota 'master' de 'origin'.
```

![](https://i.imgur.com/Gy4Hlvy.png)

Como podemos observar nos dice el mismo fallo que antes.

Ahora solamente tendremos que cambiarlo y ya tendremos integración continua corriendo con la aplicación.

![](https://i.imgur.com/Z1L2kbm.png)

