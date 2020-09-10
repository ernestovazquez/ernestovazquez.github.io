---
title: "Implantación y despliegue de una aplicación web estática"
date: 2019-10-25 00:00:00 +0800
categories: [Implantación de aplicaciones web]
tags: [Hugo]
---

**1. Selecciona una combinación entre generador de páginas estáticas y servicio donde desplegar la página web. Escribe tu propuesta en redmine, cada propuesta debe ser original.**

Hugo y Github Pages

**2. Comenta la instalación del generador de página estática. Recuerda que el generador tienes que instalarlo en tu entorno de desarrollo. Indica el lenguaje en el que está desarrollado y el sistema de plantillas que utiliza.**

```
sudo apt-get install hugo
```

- Lenguaje en el que está desarrollado: Go
- Sistema de plantillas: Go

**3. Configura el generador para cambiar el nombre de tu página, el tema o estilo de la página,... Indica cualquier otro cambio de configuración que hayas realizado.**

Primero vamos a crear el directorio con el siguiente comando:

```
mkdir rookie
cd rookie/
ernesto@honda:~/rookie$ hugo new site .
```

Después ya puedes escribir el primer artículo eligiendo un nombre de fichero descriptivo:

```
hugo new post/nombre.md
```

Una vez dentro de la carpeta, debemos inicializar git con este comando

```
ernesto@honda:~/rookie$ git init
ernesto@honda:~/rookie$ git remote add origin master git remote add origin git@github.com:ernestovazquez/rookie.git
ernesto@honda:~/rookie$ git pull origin master
```

Editamos el fichero .gitignore:

```
ernesto@honda:~/rookie$ nano .gitignore

public/
```

Subimos los archivos a github:

```
ernesto@honda:~/rookie$ git add .
ernesto@honda:~/rookie$ git commit -m "Initial commit"
ernesto@honda:~/rookie$ git push -u origin master 
```

Lo siguiente que vamos a hacer es ponerle un tema a nuestra página, podemos buscar desde el siguiente enlace: **https://themes.gohugo.io/** puede ver una lista completa de temas que puede usar para diseñar su sitio.

Primero necesitamos inicializar nuestro repositorio de Github, agregar el tema themes/arabica y copiar el archivo de configuración predeterminado para ese tema.

```
ernesto@honda:~/rookie$ cd themes/
ernesto@honda:~/rookie/themes$ git clone https://github.com/nirocfz/arabica.git
ernesto@honda:~/rookie/themes$ cd ..
```

Cambiamos nuestro `config.toml` para generar nuestros archivos HTML

```
ernesto@honda:~/rookie$ nano config.toml

baseURL = "https://ernestovazquez.github.io/"
title = "De Rookie a Leyenda"
author = "Ernesto Vázquez"
paginate = 3
theme = "arabica"

[params]
description = "Ernesto Vázquez García"
```

Las páginas de Github no admiten de forma nativa a Hugo. Vamos a Github y creamos un nuevo repositorio y lo llamamos **ernestovazquez.github.io**

```
ernesto@honda:~$ git clone git@github.com:ernestovazquez/ernestovazquez.github.io.git
ernesto@honda:~$ cd ernestovazquez.github.io/
ernesto@honda:~/ernestovazquez.github.io$ git pull origin master 
ernesto@honda:~/ernestovazquez.github.io$ cd ../rookie/
```

Ahora vamos ha ejecutar hugo para enlazar los repositorios y que se pueda crear el html:

```
ernesto@honda:~/rookie$ hugo -d ../ernestovazquez.github.io/
ernesto@honda:~/rookie$ cd ../ernestovazquez.github.io/
ernesto@honda:~/ernestovazquez.github.io$ git add --all
ernesto@honda:~/ernestovazquez.github.io$ git commit -m "Archivos hugo"
ernesto@honda:~/ernestovazquez.github.io$ git push origin master
```

**4. Genera un sitio web estático con al menos 3 páginas. Deben estar escritas en Markdown y deben tener los siguientes elementos HTML: títulos, listas, párrafos, enlaces e imágenes. El código que estas desarrollando, configuración del generado, páginas en markdown,... debe estar en un repositorio Git (no es necesario que el código generado se guarde en el repositorio, evitalo usando el fichero .gitignore).**

https://github.com/ernestovazquez/ernestovazquez.github.io/tree/master/post

**5. Explica el proceso de despliegue utilizado por el servicio de hosting que vas a utilizar.**

Voy a utilizar el servicio de Github Pages, nos permite el alojamiento de websites estáticos de forma fácil y gratuita. 

El código se almacena de forma pública. GitHub aloja tu repositorio de código. Te permite alojar sitios web estáticos sin necesidad de tener conocimientos en servidores. El sitio web será publicadoen username.github.io (siendo username el nombre de usuario de la cuenta).

- Tener una cuenta de GitHub creada.
- Debes tener instalado git en tu equipo.
- El proyecto debe contar con un archivo index.html

### Crear repositorio.

Lo primero que se debe realizar es entrar a la página principal de GitHub y creamos dos repositorios, uno con el nombre del proyecto y otro con username.github.io (siendo username el nombre de usuario de la cuenta).

Una vez creado el repositorio tenemos que descargar el repositorio en tu maquina a través de ssh, que GitHub proporciona, ahí se subirán los archivos del sitio web al repositorio.

### Subir los archivos al repositorio en GitHub

```
$ git init
$ git add .
$ git commit -m “first commit”
$ git remote add origin git@github.com:ernestovazquez/rookie.git
$ git push -u origin master
```

### Configurar repositorio para ser publicado

El último paso es configurar el repositorio para ser publicado, en el repositorio ernestovazquez.github.io, vamos a Settings que se encuentra en el menú del repositorio.

Buscamos GitHub Pages, que se encuentra ubicada al final de la página, en ese apartado se podrá observar diversas configuraciones.

Solo debemos de seleccionar el branch master en la opción source, esperaremos unos minutos en lo que GitHub publica nuestro sitio.

Sólo con esos tres pasos, ya tendríamos nuestra página web personal accesible.

**6. Piensa algún método (script, scp, rsync, git,...) que te permita automatizar la generación de la página (integración continua) y el despliegue automático de la página en el entorno de producción, después de realizar un cambio de la página en el entorno de desarrollo. Muestra al profesor un ejemplo de como al modificar la página se realizala puesta en producción de forma automática.**

https://github.com/ernestovazquez/rookie/blob/master/hugo.sh
