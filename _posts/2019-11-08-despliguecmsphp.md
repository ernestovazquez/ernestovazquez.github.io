---
title: "Despliegue tradicional de CMS PHP"
author: Ernesto Vázquez García
date: 2019-11-08 00:00:00 +0800
categories: [Implantación de aplicaciones web]
tags: [CMS, PHP]
---

**Tarea 1: Elección del escenario que vas a montar.**

Dos servicios de hosting distintos

**Tarea 2: Elección de un hosting compartido.**

- CMS: Joomla!
- Servicio de hosting: https://es.000webhost.com/
- Dominio: https://prestashopernesto.000webhostapp.com/Joomla_3.9.12-Stable-Full_Package/index.php

![](https://i.imgur.com/rLRlpSr.png)

- Sube los ficheros al hosting compartido por FTP.

Vamos a utilizar Filezilla

Para ello vamos al los ajustes del hosting

![](https://i.imgur.com/IQ67pJG.png)

Y ponemos el acceso en Filezilla

![](https://i.imgur.com/Lmd9GDS.png)

Entramos a Joomla para instalarlo y configurar la base de datos de forma adecuada.

![](https://i.imgur.com/kVB915a.png)

Creamos la base de datos en el hosting:

![](https://i.imgur.com/qd11zWl.png)

![](https://i.imgur.com/Pi7T3yn.png)

Terminamos la configuración de la instalación

![](https://i.imgur.com/kq8hoFi.png)

![](https://i.imgur.com/8Ic67uB.png)

Ya estaría instalado

![](https://i.imgur.com/gy9n1Gh.png)

![](https://i.imgur.com/LJeJ471.png)

Vamos a cambiar la plantilla y crear un contenido:

- Crear el nuevo articulo:

![](https://i.imgur.com/89IfEFG.png)

- Cambiar la plantilla:

![](https://i.imgur.com/JFk1ghc.png)

![](https://i.imgur.com/EjnkJGS.png)

- Instala un módulo para añadir alguna funcionalidad al CMS PHP.

Vamos a instalar un modulo de votaciones del articulo:

![](https://i.imgur.com/XPCPc9X.png)

**Migración de la aplicación web.**

- Elige otro servicio de hosting para PHP: InfinityFree
- Realiza el proceso de migración.

Entramos en el el primer host y le damos a Manage Databases

![](https://i.imgur.com/h7PVFHQ.png)

Exportamos la base de datos:

![](https://i.imgur.com/vnoAXhl.png)

Importamos en el nuevo hosting dicha base de datos:

![](https://i.imgur.com/ydxxRcc.png)

Una vez terminado, miramos la estructura para ver si esta todo subido.

![](https://i.imgur.com/WeNZawb.png)

Ahora descargamos Joomla desde FTP del anterior hosting, para pasarlo al nuevo hosting.

Descargamos por ftp Joomla! del anterior hosting y lo subimos al nuevo

![](https://i.imgur.com/cf1eNlK.png)

Configuramos la base de datos que hemos importado del anterior hosting y ya tendremos acceso: http://ernestomigracion.epizy.com/Joomla_3.9.12-Stable-Full_Package/

![](https://i.imgur.com/VgFUu1B.png)

