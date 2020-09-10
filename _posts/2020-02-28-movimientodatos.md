---
title: "Movimiento de datos"
date: 2020-02-28 00:00:00 +0800
categories: [Bases de datos]
tags: [Oracle, PostgreSQL, MySQL]
---

## Alumno 1 (Ernesto Vázquez García)

**1. Realiza una exportación del esquema de SCOTT usando la consola Enterprise Manager, con las siguientes condiciones:**
**• Exporta tanto la estructura de las tablas como los datos de las mismas.**
**• Excluye la tabla BONUS y los departamentos sin empleados.**
**• Realiza una estimación previa del tamaño necesario para el fichero de exportación.**
**• Programa la operación para dentro de 5 minutos.**
**• Genera un archivo de log en el directorio raíz.
Realiza ahora la operación con Oracle Data Pump.**

Para realizar la exportación primero tenemos que entrar en la consola de Enterprise Manager.

Nos dirigimos a la pestaña de **Movimiento de Datos** y entramos en **Exportar a Archivos de Exportación**

![](https://i.imgur.com/CDFjUSe.png)


A continuación vamos a marcar el **tipo de exportación**:

![](https://i.imgur.com/cxE91Do.png)

En esta pantalla vamos a elegir que esquema queremos exportar en nuestro caso seleccionamos el **esquema de SCOTT**:

![](https://i.imgur.com/SFhR3ek.png)

A continuación vamos a desplegar las opciones avanzadas para poder seleccionar la tabla bonus.

Para ello, seleccionamos lo siguiente:

- Tipo de Objeto: **TABLE**
- Expresión de Nombre de Objeto: **='BONUS'**

![](https://i.imgur.com/etrojbm.png)

Ahora vamos a darle nombre al trabajo y podemos planificar la hora y fecha de inicio. Aquí podremos programar la operación para dentro de 5 minutos.

![](https://i.imgur.com/oy4mEPJ.png)

Una vez le demos a **Siguiente** nos aparecerá un **resumen** de los datos que vamos a realizar.

![](https://i.imgur.com/5zhoCam.png)

Por último nos aparecerá una pantalla de carga, y una vez finalize el proceso nos pararecerá la siguiente pantalla.

![](https://i.imgur.com/Dzq7yxR.png)

Para verificar que se ha creado el fichero de importación nos vamos a la siguiente carpeta:

![](https://i.imgur.com/KtBVHQQ.png)

![](https://i.imgur.com/AA46Aul.png)

Como podemos apreciar se ha exportado las tablas deseadas.

Para exportarlo con Oracle Data Pump podremos hacerlo con el siguiente comando:

    expdp system/dios dumpfile=EXP_SCOTT.DMP schemas=scott directory=DATA_PUMP_DIR
    
![](https://i.imgur.com/1wmWWnR.png)

**2. Importa el fichero obtenido anteriormente usando Enterprise Manager pero en un usuario distinto de la misma base de datos.**

Este paso se puede hacer por Enterprise Manager o por la terminal.

En nuestro caso vamos a elegir **Enterprise Manager**. Para ello, nos dirigimos a **Importar de Archivos de Exportación.**

Nos conectamos con otro usuario y accedemos a la misma pestaña que antes.

![](https://i.imgur.com/7CIo48M.png)

Como se puede apreciar me he conectado con el usuario: **ERNESTO.** El cual no tiene ninguna tabla introducida.

Ahora entramos en la pestaña de **Importar de Archivos de Exportación**

![](https://i.imgur.com/XpmuAow.png)

En la siguiente pantalla vamos a tener que agregar el esquema anterior.

![](https://i.imgur.com/6yFqdBp.png)

Aqui podremos ver el nombre del fichero de log y el directorio donde se guarda dicho fichero.

![](https://i.imgur.com/Ph0Hc0j.png)

![](https://i.imgur.com/F11FNdH.png)

![](https://i.imgur.com/nDWxxE9.png)

Ya tendremos en el nuevo usuario el esquema de SCOTT realizando una importación.

Para **importar** un esquema de la base de datos con **Oracle Data Pump** podremos lo siguiente.

    impdp ernesto/ernesto dumpfile=EXP_SCOTT.DMP schemas=scott directory=DATA_PUMP_DIR remap_schema=scott:ernesto

**3. Realiza una exportación de la estructura de todas las tablas de la base de datos usando el comando expdp de Oracle Data Pump probando todas las posibles opciones que ofrece dicho comando y documentándolas adecuadamente.**

Primero vamos a vamos a ver las diferentes opciones que nos ofrece el comando expdp, para ello vamos a ver el manual.

    expdp HELP=Y

![](https://i.imgur.com/GB9TmhU.png)

Como podemos apreciar estas son las diferentes opciones que tiene el comando **expdp.**

A continuación vamos a comentar todas las opciones que nos ofrece esta herramienta.

- **ATTACH**: Nombre de un Job existente para conectarte. Esta opción necesita los privilegios **EXP_FULL_DATABASE** para otros esquemas.
- **COMPRESSION**: Comprime el contenido del archivo.
- **CONSISTENT**: Copia de seguridad de lectura consistente.
- **CONTENT**: Especifica datos para cargar.
- **DIRECTORY**: Nombre del objeto que apunta a un directorio.
- **DUMPFILE**: El nombre del archivo de datos de exportación.
- **ESTIMATE**: Solamente calcule el espacio en disco requerido.
- **ESTIMATE_ONLY**: Se utiliza para calcular el espacio en disco solo para datos.
- **EXCLUDE**: Excluye de la exportación de la base de datos un tipo de objeto.
- **FILESIZE**: El tamaño máximo de archivo permitido para cualquier archivo de volcado de exportación.
- **FLASHBACK_TIME**: Al igual que en **CONSISTENT**, permite una exportación consistente de lectura
- **FULL**: Exportación completa de la base de datos. Esta opción necesita los privilegios **EXP_FULL_DATABASE**.
- **INCLUDE**: Al contrario que **EXCLUDE**, esta opción es para incluir específicamente en la exportación.
- **JOB_NAME**: Parecido al parámetro **ATTACH**, Nombre por el que se puede hacer referencia al trabajo de exportación.
- **LOGFILE**: El nombre del archivo de registro de exportación.
- **NOLOGFILE**: Para suprimir la creación del archivo en la exportación.
- **PARALLEL**: El número máximo de subprocesos concurrentes para la exportación.
- **PARFILE**: Nombre del archivo de parámetros específicos del sistema operativo.
- **QUERY**: Filtrado de datos y nombres de objetos durante la exportación.
- **REUSE_DUMPFILES**: Sobrescribir los archivos existentes del volcado de la exportación
- **SAMPLE**: Porcentaje de datos a exportar.
- **SCHEMAS**: El esquema que queremos exportar. Esta opción necesita los privilegios **EXP_FULL_DATABASE**
- **STATUS**: El estado dl trabajo en frecuencia.
- **TABLES**: Lista de tablas para una exportación.
- **TABLESPACES**: Lista de espacios de tabla para una exportación.
- **TRANSPORT_FULL_CHECK**: Verifica los segmentos de almacenamiento de todas las tablas.
- **TRANSPORT_TABLESAPCES**: Lista de espacios de tablas desde los que se descargarán los metadatos.

> Estas opciones se pueden concatenar para tener mayor número de parámetros y opciones para tener la exportación deseada.

Vamos a realizar una exportación de ejemplo

![](https://i.imgur.com/Hk0ckfl.png)

**4. Intenta realizar operaciones similares de importación y exportación con las herramientas proporcionadas con MySQL desde línea de comandos, documentando el proceso.**

Primero tenemos que agregar unas tablas a la base de datos que queremos exportar para realizar la prueba.

Para ello hacemos lo siguiente:

```
MariaDB [(none)]> CREATE DATABASE exportacion;
Query OK, 1 row affected (0.001 sec)

MariaDB [(none)]> use exportacion;
Database changed

MariaDB [exportacion]> show tables;
+-----------------------+
| Tables_in_exportacion |
+-----------------------+
| animales              |
| clientes              |
+-----------------------+
2 rows in set (0.001 sec)
```

Realizaremos la exportacion:

```
vagrant@mysql:~$ mysqldump -u ernesto -p exportacion > exportacion.sql
Enter password: 

vagrant@mysql:~$ ls
exportacion.sql
```
Tendremos que crear la nueva base de datos para la importacion.

```
vagrant@mysql:~$ sudo mysql -u root -p
Enter password: 
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 62
Server version: 10.3.18-MariaDB-0+deb10u1 Debian 10

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> CREATE DATABASE importacion;
Query OK, 1 row affected (0.001 sec)

MariaDB [(none)]> Bye
```

Importación a otra base de datos.

```
vagrant@mysql:~$ mysql -u ernesto -p importacion < exportacion.sql 
Enter password: 

vagrant@mysql:~$ sudo mysql -u ernesto -p importacion
Enter password: 
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 65
Server version: 10.3.18-MariaDB-0+deb10u1 Debian 10

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [importacion]> show tables;
+-----------------------+
| Tables_in_importacion |
+-----------------------+
| animales              |
| clientes              |
+-----------------------+
2 rows in set (0.001 sec)
```

![](https://i.imgur.com/4vqq0bG.png)

Referencia: [Artículo sobre MySQL](https://www.stackscale.com/es/blog/importar-exportar-bases-datos-mysql-mariadb/)

**5. Realiza operaciones de importación y exportación de colecciones en MongoDB.**

Primero vamos a crear un usuario y una base de datos con algunas colecciones dentro para la exportación.

```
> use peliculas
switched to db peliculas

> db.peliculas.save({titulo:'Batman el caballero oscuro'});
WriteResult({ "nInserted" : 1 })

> db.peliculas.find();
{ "_id" : ObjectId("5e54d0003488f9e6b3ffc688"), "titulo" : "Batman el caballero oscuro" }

> show dbs;
admin      0.000GB
config     0.000GB
local      0.000GB
peliculas  0.000GB

> db
peliculas

> db.createUser(
... {
... user: "ernesto",
... pwd: "ernesto",
... roles: ["dbOwner"]
... }
... )
Successfully added user: { "user" : "ernesto", "roles" : [ "dbOwner" ] }
```

Ahora si muestro los usuarios tendremos la siguiente información:

```
> show users
{
	"_id" : "peliculas.ernesto",
	"userId" : UUID("0079cc4b-bd5c-4978-b6a7-8b32aed32965"),
	"user" : "ernesto",
	"db" : "peliculas",
	"roles" : [
		{
			"role" : "dbOwner",
			"db" : "peliculas"
		}
	],
	"mechanisms" : [
		"SCRAM-SHA-1",
		"SCRAM-SHA-256"
	]
}
```

Ahora vamos a realizar la exportación de dicha colección.

```
vagrant@mongodb:~$ mongodump -d peliculas -o exportacion -u ernesto -p ernesto
2020-02-25T07:53:26.070+0000	writing peliculas.peliculas to 
2020-02-25T07:53:26.071+0000	done dumping peliculas.peliculas (1 document)

vagrant@mongodb:~$ ls
exportacion
```

```
vagrant@mongodb:~/exportacion$ tree
.
└── peliculas
    ├── peliculas.bson
    └── peliculas.metadata.json

1 directory, 2 files
```

Como se puede apreciar se ha realizado correctamente la exportación.

Ahora vamos a importar la colección en otra base de datos. También se puede importar a otro servidor/máquina local que tenga un nombre de usuario y una contraseña.

    vagrant@mongodb:~$ mongorestore -d importacion exportacion/peliculas/ -u ernesto -p ernesto


## Alumno 2 (Juan Diego Abadía Noguera)

**1. Realiza una exportación del esquema de SCOTT usando la consola Enterprise Manager, con las siguientes condiciones:**

**- Exporta tanto la estructura de las tablas como los datos de las mismas.**
**- Excluye la tabla SALGRADE y los departamentos que no tienen empleados.**
**- Programa la operación para dentro de 15 minutos.**
**- Genera un archivo de log en el directorio raíz de ORACLE.**

**Realiza ahora la operación con Oracle Data Pump.**

> He instalado varias veces Oracle 11g y salia un error que no funcionaba el Enterprise Manager. 

**2. Importa el fichero obtenido anteriormente usando Enterprise Manager pero en un usuario distinto de otra base de datos.**

> He instalado varias veces Oracle 11g y salia un error que no funcionaba el Enterprise Manager.

**3. Realiza una exportación de la estructura y los datos de todas las tablas de la base de datos usando el comando expdp de Oracle Data Pump encriptando la información. Prueba todas las posibles opciones que ofrece dicho comando y documentándolas adecuadamente.**

- Creamos un directorio donde se guardara la exportación. No se crea en el sistema
```
SQL> CREATE DIRECTORY orcl_full AS 'C:\Data Pump\full export';

Directorio creado.
```

- Le damos permiso de lectura y escritura al usuario juandi sobre el directorio creado anteriormente
```
SQL> GRANT read, write ON DIRECTORY orcl_full TO juandi;

Concesi¾n terminada correctamente.
```

- Asignamos el rol de DATAPUMP_EXP_FULL_DATABASE para poder realizar una exportación completa
```
SQL> GRANT DATAPUMP_EXP_FULL_DATABASE TO juandi;

Concesi¾n terminada correctamente.
```

- Podemos realizar la expoxtación con estas opciones
```
C:\Windows\system32>expdp juandi/juandi DIRECTORY=orcl_full DUMPFILE=orclfull.dmp LOGFILE=full_exp.log FULL=YES ENCRYPTION=all ENCRYPTION_MODE=password ENCRYPTION_PASSWORD=juandi;
```
> * juandi/juandi => Nombre de usuario/Contraseña
> * DIRECTORY=orcl_full => Directorio donde se guardara la exportación
> * DUMPFILE=orclfull.dmp => Contienen los datos de las tablas, metadatos de objetos de base de datos e información de control. Además de eso, estos archivos están escritos en formato binario y los archivos de volcado solo pueden importarse mediante impdp
> * LOGFILE=full_exp.log => Fichero de logs
> * FULL=YES => Para realizar la exportación completa de la base de datos
> * ENCRYPTION=all => Para decidir que queremos encriptar. Podemos encriptar: ALL(Todo) | DATA_ONLY(Solo los datos) | ENCRYPTED_COLUMNS_ONLY(Solo las columnas) | METADATA_ONLY(Solo los metadatos) | NONE(nada)
> * ENCRYPTION_MODE=password => Para decidir el modo de encriptar los datos. Podemos seleccionar entre: DUAL(Paracido a Clave Privada/Clave Publica) | PASSWORD(Especificando una contraseña) | TRANSPARENT (Crea un archivo cifrado y tiene que abrirse con Oracle Encryption Wallet)
> ENCRYPTION_PASSWORD=juandi => Especificamos la contraseña

- Podemos especificar mas opciones
> COMPRESSION => Para comprimir los datos de la exportación. Podemos Comprimir por: ALL(Todo) | DATA_ONLY(Solo los datos) | METADATA_ONLY(Solo los metadatos) | NONE(Nada)
```
C:\Windows\system32>expdp juandi/juandi schemas=juandi directory=juandi dumpfile=juandi.dmp logfile=expdpjuandi.log compression=all
```

> TRANSPORTABLE => Debe usarse durante una exportación en modo tabla. Con especificarse ALWAYS(Siempre, si realizas uan exportación completa y esta especificado el proceso fallara) | NEVER(Nunca, por defecto)
```
C:\Windows\system32>expdp juandi/juandi tables=JUANDI.ASPECTOS directory=juandi dumpfile=juandi.dmp logfile=expdpjuandi.log transportable=ALWAYS
```
> PARTITION_OPTIONS => Para particionar la exportación. Podemos particionar por: none (No particiona) | departition (Por cada partición crea una tabla) | merge (Combina todas las particiones en una tabla)
```
expdp juandi/juandi directory=juandi dumpfile=expdpjuandi.dmp logfile=juandi.log tables=juandi.aspectos partition_options=merge
```
> REUSE_DUMPFILES => Para evitar que se emitan errores si la exportación intenta escribir en un archivo de volcado que ya existe. Opciones: Y | N
```
C:\Windows\system32>expdp juandi/juandi full=yes directory=juandi dumpfile=juandi.dmp logfile=expdpjuandi.log compression=all reuse_dumpfiles=y
```

- Para consultar los directorios creados en el diccionario de datos
```
SQL> select directory_name,directory_path from dba_directories;

DIRECTORY_NAME
------------------------------
DIRECTORY_PATH
--------------------------------------------------------------------------------

ORCL_FULL
C:\Data Pump\full export

SUBDIR
C:\app\Oracle\product\11.2.0\dbhome_1\demo\schema\order_entry\/2002/Sep

SS_OE_XMLDIR
C:\app\Oracle\product\11.2.0\dbhome_1\demo\schema\order_entry\


DIRECTORY_NAME
------------------------------
DIRECTORY_PATH
--------------------------------------------------------------------------------

LOG_FILE_DIR
C:\app\Oracle\product\11.2.0\dbhome_1\demo\schema\log\

DATA_FILE_DIR
C:\app\Oracle\product\11.2.0\dbhome_1\demo\schema\sales_history\

XMLDIR
c:\ade\aime_dadvfh0169\oracle/rdbms/xml


DIRECTORY_NAME
------------------------------
DIRECTORY_PATH
--------------------------------------------------------------------------------

MEDIA_DIR
C:\app\Oracle\product\11.2.0\dbhome_1\demo\schema\product_media\

DATA_PUMP_DIR
C:\app\Oracle/admin/orcl/dpdump/

ORACLE_OCM_CONFIG_DIR
C:\app\Oracle\product\11.2.0\dbhome_1/ccr/state


9 filas seleccionadas.
```
[Documentación Oficial](https://docs.oracle.com/database/121/SUTIL/GUID-5F7380CE-A619-4042-8D13-1F7DDE429991.htm#SUTIL200)
[Documentación de algunas opciones](https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1#encryption_mode)

**4. Intenta realizar operaciones similares de importación y exportación con las herramientas proporcionadas con Postgres desde línea de comandos, documentando el proceso.**

Para **exportar** podemos usar el comando **pg_dump**
    
- Exportar una base de datos a un archivo .sql, en este caso exportar la base de datos postgres(la base de datos postgres contiene dos tablas llamada medicamentos y categorias)
```
postgres@debian:~$ pg_dump postgres > postgres.sql
postgres@debian:~$ cat postgres.sql
--
-- PostgreSQL database dump
--

-- Dumped from database version 11.7 (Debian 11.7-0+deb10u1)
-- Dumped by pg_dump version 11.7 (Debian 11.7-0+deb10u1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias (
    codigo character varying(10) NOT NULL,
    nombre character varying(20),
    CONSTRAINT nomnonull CHECK ((nombre IS NOT NULL))
);


ALTER TABLE public.categorias OWNER TO postgres;

--
-- Name: medicamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicamentos (
    codigo character varying(10) NOT NULL,
    nombrecomercial character varying(40),
    laboratorio character varying(40),
    financiadoss character varying(2),
    necesitareceta character varying(2),
    CONSTRAINT codmedicamento CHECK (((codigo)::text ~ '^[AEIOU]{1}[BCDFGHJKLMNPQRSTVWXYZ]{1}[0-9]$'::text)),
    CONSTRAINT necreceta CHECK (((necesitareceta)::text = ANY ((ARRAY['SI'::character varying, 'Si'::character varying, 'NO'::character varying, 'No'::character varying])::text[]))),
    CONSTRAINT nomcomnonull CHECK ((nombrecomercial IS NOT NULL))
);


ALTER TABLE public.medicamentos OWNER TO postgres;

--
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorias (codigo, nombre) FROM stdin;
1       CÓDIGO ATC A
2       CÓDIGO ATC B
3       CÓDIGO ATC C
4       CÓDIGO ATC D
5       CÓDIGO ATC G
6       CÓDIGO ATC H
7       CÓDIGO ATC J
8       CÓDIGO ATC L
9       CÓDIGO ATC M
10      CÓDIGO ATC N
11      CÓDIGO ATC P
12      CÓDIGO ATC R
13      CÓDIGO ATC S
14      CÓDIGO ATC V
\.


--
-- Data for Name: medicamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicamentos (codigo, nombrecomercial, laboratorio, financiadoss, necesitareceta) FROM stdin;
AD6     ADCETRIS        TAKEDA PHARMA A/S       SI      SI
EX4     NEXAVAR BAYER AG        NO      SI
OL5     DOLOMIDINA      ESTEVE  SI      SI
AL8     ALACAPSIN       ALFASIGMA ESPAÑA, S.L.  SI      SI
IF3     CANDIFIX        ARAFARMA        NO      SI
UC7     FLUCONAZOL APOTEX       APOTEX ESPAÑA S.L.      SI      SI
\.


--
-- Name: categorias pk_categoria; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT pk_categoria PRIMARY KEY (codigo);


--
-- Name: medicamentos pk_medicamento; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicamentos
    ADD CONSTRAINT pk_medicamento PRIMARY KEY (codigo);


--
-- PostgreSQL database dump complete
```

- Exportar una base de datos a un formato personalizado
```
postgres@debian:~$ pg_dump -Fc postgres > postgres.dump
postgres@debian:~$ cat postgres.dump
     '    !                x           postgres    11.7 (Debian 11.7-0+deb10u1)    11.7 (Debian 11.7-0+deb10u1) ^           0    0   ENCODING   ENCODING        SET client_encoding = 'UTF8';
                       false            _           0    0
   STDSTRINGS
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                       false            `           0    0
   SEARCHPATH
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                       false            a           1262    13101   postgres   DATABASE     z   CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'es_ES.UTF-8' LC_CTYPE = 'es_ES.UTF-8';
    DROP DATABASE postgres;
            postgres    false            b           0    0    DATABASE postgres    COMMENT     N   COMMENT ON DATABASE postgres IS 'default administrative connection database';
                 postgres    false    2913                        1259    16392
   categorias    TABLE        CREATE TABLE public.categorias (
    codigo character varying(10) NOT NULL,
    nombre character varying(20),
    CONSTRAINT nomnonull CHECK ((nombre IS NOT NULL))
);
    DROP TABLE public.categorias;
       public        postgres    false                        1259    16384    medicamentos    TABLE     Z 
```
> -Fp => Salida simple, como en el primer ejemplo. Por defecto si no se especifica nada.
> -Fc => Salida personalizada, permite la selección manual y la reordenación de los elementos durante la restauración.
> -Fd => Salida a un directorio, esto creará un archivo .gz para cada tabla y un archivo del contenido de las tablas
> -Ft => Salida a un archivo .tar

- Exportar a un directorio
```
postgres@debian:~$ pg_dump -Fd postgres -f postgres
postgres@debian:~$ ls postgres
2906.dat.gz  2907.dat.gz  toc.dat
```

- Exportar solo una tabla de una base de datos, con la opción -t (nombre de la tabla)
```
postgres@debian:~$ pg_dump -t medicamentos postgres > tablamedecamentos.sql
postgres@debian:~$ cat tablamedecamentos.sql
--
-- PostgreSQL database dump
--

-- Dumped from database version 11.7 (Debian 11.7-0+deb10u1)
-- Dumped by pg_dump version 11.7 (Debian 11.7-0+deb10u1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: medicamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicamentos (
    codigo character varying(10) NOT NULL,
    nombrecomercial character varying(40),
    laboratorio character varying(40),
    financiadoss character varying(2),
    necesitareceta character varying(2),
    CONSTRAINT codmedicamento CHECK (((codigo)::text ~ '^[AEIOU]{1}[BCDFGHJKLMNPQRSTVWXYZ]{1}[0-9]$'::text)),
    CONSTRAINT necreceta CHECK (((necesitareceta)::text = ANY ((ARRAY['SI'::character varying, 'Si'::character varying, 'NO'::character varying, 'No'::character varying])::text[]))),
    CONSTRAINT nomcomnonull CHECK ((nombrecomercial IS NOT NULL))
);


ALTER TABLE public.medicamentos OWNER TO postgres;

--
-- Data for Name: medicamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicamentos (codigo, nombrecomercial, laboratorio, financiadoss, necesitareceta) FROM stdin;
AD6     ADCETRIS        TAKEDA PHARMA A/S       SI      SI
EX4     NEXAVAR BAYER AG        NO      SI
OL5     DOLOMIDINA      ESTEVE  SI      SI
AL8     ALACAPSIN       ALFASIGMA ESPAÑA, S.L.  SI      SI
IF3     CANDIFIX        ARAFARMA        NO      SI
UC7     FLUCONAZOL APOTEX       APOTEX ESPAÑA S.L.      SI      SI
\.


--
-- Name: medicamentos pk_medicamento; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicamentos
    ADD CONSTRAINT pk_medicamento PRIMARY KEY (codigo);


--
-- PostgreSQL database dump complete
--
```

- Exportar todas las tablas que empiecen por med y con -T si hubiera alguna tabla mas que empiece por med, la excluiriamos
```
postgres@debian:~$ pg_dump -t 'med*' -T categorias postgres > excepcion.sql
postgres@debian:~$ cat excepcion.sql
--
-- PostgreSQL database dump
--

-- Dumped from database version 11.7 (Debian 11.7-0+deb10u1)
-- Dumped by pg_dump version 11.7 (Debian 11.7-0+deb10u1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: medicamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicamentos (
    codigo character varying(10) NOT NULL,
    nombrecomercial character varying(40),
    laboratorio character varying(40),
    financiadoss character varying(2),
    necesitareceta character varying(2),
    CONSTRAINT codmedicamento CHECK (((codigo)::text ~ '^[AEIOU]{1}[BCDFGHJKLMNPQRSTVWXYZ]{1}[0-9]$'::text)),
    CONSTRAINT necreceta CHECK (((necesitareceta)::text = ANY ((ARRAY['SI'::character varying, 'Si'::character varying, 'NO'::character varying, 'No'::character varying])::text[]))),
    CONSTRAINT nomcomnonull CHECK ((nombrecomercial IS NOT NULL))
);


ALTER TABLE public.medicamentos OWNER TO postgres;

--
-- Data for Name: medicamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicamentos (codigo, nombrecomercial, laboratorio, financiadoss, necesitareceta) FROM stdin;
AD6     ADCETRIS        TAKEDA PHARMA A/S       SI      SI
EX4     NEXAVAR BAYER AG        NO      SI
OL5     DOLOMIDINA      ESTEVE  SI      SI
AL8     ALACAPSIN       ALFASIGMA ESPAÑA, S.L.  SI      SI
IF3     CANDIFIX        ARAFARMA        NO      SI
UC7     FLUCONAZOL APOTEX       APOTEX ESPAÑA S.L.      SI      SI
\.


--
-- Name: medicamentos pk_medicamento; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicamentos
    ADD CONSTRAINT pk_medicamento PRIMARY KEY (codigo);


--
-- PostgreSQL database dump complete
--
```

Para exportar podemos utilizar pg_restore y psql (Lo que vamos a importar ha sido creado en el paso anterior)

- Importar un archivo .sql
```
postgres@debian:~$ createdb importaciones
postgres@debian:~$ psql -d importaciones -f postgres.sql
SET
SET
SET
SET
SET
 set_config
------------

(1 fila)

SET
SET
SET
SET
SET
SET
CREATE TABLE
ALTER TABLE
CREATE TABLE
ALTER TABLE
COPY 14
COPY 6
ALTER TABLE
ALTER TABLE
postgres@debian:~$ psql importaciones
psql (11.7 (Debian 11.7-0+deb10u1))
Digite «help» para obtener ayuda.

importaciones=# \d
           Listado de relaciones
 Esquema |    Nombre    | Tipo  |  Dueño
---------+--------------+-------+----------
 public  | categorias   | tabla | postgres
 public  | medicamentos | tabla | postgres
(2 filas)
```

- Importar una archivo personalizado
```
postgres@debian:~$ createdb importacionespersonalizada
postgres@debian:~$ pg_restore -d importacionespersonalizada postgres.dump
postgres@debian:~$ psql importacionespersonalizada
psql (11.7 (Debian 11.7-0+deb10u1))
Digite «help» para obtener ayuda.

importacionespersonalizada=# \d
           Listado de relaciones
 Esquema |    Nombre    | Tipo  |  Dueño
---------+--------------+-------+----------
 public  | categorias   | tabla | postgres
 public  | medicamentos | tabla | postgres
(2 filas)
```

- Importar una exportación de directorio
```
postgres@debian:~$ pg_restore -d importacionesdirectorio postgres
postgres@debian:~$ psql importacionesdirectorio
psql (11.7 (Debian 11.7-0+deb10u1))
Digite «help» para obtener ayuda.

importacionesdirectorio=# \d
           Listado de relaciones
 Esquema |    Nombre    | Tipo  |  Dueño
---------+--------------+-------+----------
 public  | categorias   | tabla | postgres
 public  | medicamentos | tabla | postgres
(2 filas)
```


- Algunas opciones interesante para importar y exportar
    - -h: Para indicar el nombre del servidor o IP que queremos conectarnos
    - -U: Para indicar el usuario que nos conectaremos
    - -W: Para que solicite la contraseña cuando nos conectemos
    - -n: Para indicar una expresión regular como por ejemplo: -n 'm*tos'. Que empiece por m y acabe por tos 

Podemos utilizar una aplicación web para administrar Postgresql llamada **phppgadmin**
![](https://i.imgur.com/iihx8E9.png)

**5. Exporta los documentos de una colección de MongoDB que cumplan una determinada condición e impórtalos en otra base de datos.**

- Creamos una base de datos con algunas colecciones
```
> use CiudadesEspaña
switched to db CiudadesEspaña
> db.CiudadesEspaña.save({Ciudad:'Sevilla'})
WriteResult({ "nInserted" : 1 })
> db.CiudadesEspaña.save({Ciudad:'Madrid'})
WriteResult({ "nInserted" : 1 })
> db.CiudadesEspaña.save({Ciudad:'Valencia'})
WriteResult({ "nInserted" : 1 })
> db.CiudadesEspaña.save({Ciudad:'Bilbao'})
WriteResult({ "nInserted" : 1 })
> db.CiudadesEspaña.save({Ciudad:'Segovia'})
WriteResult({ "nInserted" : 1 })
> db.CiudadesEspaña.find()
{ "_id" : ObjectId("5e5956581cc4bfcfe773d8a2"), "Ciudad" : "Sevilla" }
{ "_id" : ObjectId("5e5956631cc4bfcfe773d8a3"), "Ciudad" : "Madrid" }
{ "_id" : ObjectId("5e59566f1cc4bfcfe773d8a4"), "Ciudad" : "Valencia" }
{ "_id" : ObjectId("5e5956771cc4bfcfe773d8a5"), "Ciudad" : "Bilbao" }
{ "_id" : ObjectId("5e5957a91cc4bfcfe773d8a6"), "Ciudad" : "Segovia" }
```

- Tenemos un usuario llamado juandi que hemos creado
```
> db.createUser(
... {
... user:"juandi",
... pwd:"juandi",
... roles: ["dbOwner"]
... }
... )
Successfully added user: { "user" : "juandi", "roles" : [ "dbOwner" ] }
> show users;
{
        "_id" : "CiudadesEspaña.juandi",
        "userId" : UUID("1f10c3ba-3067-4d8e-969e-9d632113c1ba"),
        "user" : "juandi",
        "db" : "CiudadesEspaña",
        "roles" : [
                {
                        "role" : "dbOwner",
                        "db" : "CiudadesEspaña"
                }
        ],
        "mechanisms" : [
                "SCRAM-SHA-1",
                "SCRAM-SHA-256"
        ]
}
```

- Vemos la bases de datos y colecciones creadas
```
> show dbs;
CiudadesEspaña  0.000GB
Medicamentos    0.000GB
admin           0.000GB
config          0.000GB
local           0.000GB
myDatabase      0.000GB
test            0.000GB
> show collections;
CiudadesEspaña
```

- Exportamos todos los registros de la coleccion CiudadesEspaña menos Valencia
```
usuario@debian:~$ mongodump -d CiudadesEspaña -c CiudadesEspaña -o ExportacionCiudades -q='{"Ciudad":{"$ne":"Valencia"}}
' -u juandi -p juandi
2020-02-28T19:47:24.946+0100    writing CiudadesEspaña.CiudadesEspaña to
2020-02-28T19:47:24.976+0100    done dumping CiudadesEspaña.CiudadesEspaña (4 documents)
```
> -d: Nombre de la base de datos
> -c: Nombre de la colección
> -o: Donde se guardar la exportación
> -q: Condición

- Aqui tenemos la exportación
```
usuario@debian:~$ tree ExportacionCiudades/
ExportacionCiudades/
└── CiudadesEspaña
    ├── CiudadesEspa%C3%B1a.bson
    └── CiudadesEspa%C3%B1a.metadata.json

1 directory, 2 files
```

- Ahora importaremos la colección a una nueva base de datos
```
usuario@debian:~$ mongorestore -d ImportacionCiudades ExportacionCiudades/CiudadesEspaña/
2020-02-28T19:58:33.217+0100    the --db and --collection args should only be used when restoring from a BSON file. Other uses are deprecated and will not exist in the future; use --nsInclude instead
2020-02-28T19:58:33.217+0100    building a list of collections to restore from ExportacionCiudades/CiudadesEspaña dir
2020-02-28T19:58:33.218+0100    reading metadata for ImportacionCiudades.CiudadesEspaña from ExportacionCiudades/CiudadesEspaña/CiudadesEspa%C3%B1a.metadata.json
2020-02-28T19:58:33.260+0100    restoring ImportacionCiudades.CiudadesEspaña from ExportacionCiudades/CiudadesEspaña/CiudadesEspa%C3%B1a.bson
2020-02-28T19:58:33.263+0100    no indexes to restore
2020-02-28T19:58:33.263+0100    finished restoring ImportacionCiudades.CiudadesEspaña (4 documents)
2020-02-28T19:58:33.263+0100    done
```

- Resultado
```
> show collections
Medicamentos
> show dbs;
CiudadesEspaña       0.000GB
España               0.000GB
ImportacionCiudades  0.000GB
Medicamentos         0.000GB
admin                0.000GB
config               0.000GB
local                0.000GB
myDatabase           0.000GB
test                 0.000GB
> use ImportacionCiudades
switched to db ImportacionCiudades
> db.CiudadesEspaña.find()
{ "_id" : ObjectId("5e5956581cc4bfcfe773d8a2"), "Ciudad" : "Sevilla" }
{ "_id" : ObjectId("5e5956631cc4bfcfe773d8a3"), "Ciudad" : "Madrid" }
{ "_id" : ObjectId("5e5956771cc4bfcfe773d8a5"), "Ciudad" : "Bilbao" }
{ "_id" : ObjectId("5e5957a91cc4bfcfe773d8a6"), "Ciudad" : "Segovia" }
```

## Alumno 3 (Adrián Jaramillo Rodríguez)

## Alumno 4 (Luis Vázquez Alejo)

**1. Realiza una exportación del esquema de SCOTT usando la consola Enterprise Manager, con las siguientes condiciones:**

* Exporta tanto la estructura de las tablas como los datos de las mismas.
* Excluye de la tabla EMP los empleados que no tienen comisión.
* Programa la operación para dentro de 10 minutos.
* Genera un archivo de log en el directorio que consideres más oportuno.

Realiza ahora la operación con **Oracle Data Pump**.

**2. Importa el fichero obtenido anteriormente usando Enterprise Manager pero en un usuario distinto de otra base de datos.**

**3. Realiza una exportación de la estructura de todas las tablas de la base de datos usando el comando expdp de Oracle Data Pump utilizando un DBLink desde otra base de datos. Prueba todas las posibles opciones que ofrece dicho comando y documentándolas adecuadamente.**

**4. Intenta realizar operaciones similares de importación y exportación con una herramienta gráfica de administración de MySQL, documentando el proceso.**
Para realizar esto, vamos a utilizar la herramienta web [phpmyadmin](https://sql.luis.gonzalonazareno.org/) que utilizamos para la práctica de **hosting**. Después de introducir un usuario y una contraseña, tendremos que dirigirnos a la pestaña que nos indica **export**. Seleccionamos el lenguaje, en este caso **SQL**, y luego elegimos el método **custom**, para poder escoger qué base de datos exportaremos.

![](https://i.imgur.com/YNucbE9.png)

Entre las diversas opciones que vemos en pantalla, podremos escoger algunas como exportar _solo_ la _estructura_, solo las _tablas_, todo, _máxima longitud_ de los _registros_, etc. Una vez que hayamos terminado, pulsamos el último botón (**Go**) y automáticamente comenzará una descarga de un fichero **.sql** con toda la información que hayamos seleccionado.

![](https://i.imgur.com/KQh44u0.png)


En realidad, esto básicamente ejecuta el comando mysqldump por debajo, con los parámetros correspondientes.
En el caso de que queramos hacer una importación nos dirigimos a la pestaña import y tan solo tendremos que subir un fichero con el formato que nos indica (<**formSQL**>.[<**formCompresión**>]). Después elegimos la codificación de caracteres que tiene el texto del fichero y pulsamos **_Go_**.

![](https://i.imgur.com/kzoHefc.png)

**5. Exporta todos los documentos de las colecciones de MongoDB que tengan más de cuatro documentos e impórtalos en otra base de datos.**

Antes de nada voy a crear varias colecciones y voy a darles contenido. Crearé una con más de cuatro documentos y las demás con uno o dos documentos con el siguiente [codigo](https://raw.githubusercontent.com/LuisaoStuff/Practica7BBDD/master/docs/mongo-query.json)
He estado buscando en la _documentación oficial_ de **MongoDB**, concretamente en la sección de la función [mongoexport](https://docs.mongodb.com/manual/reference/program/mongoexport/) y no he llegado a encontrar ninguna forma de parametrizar o aplicar una serie de filtros para definir qué colecciones exportar según que argumentos. Lo único que se me ha ocurrido es pensar e intentar crear un procedimiento (como en **PLSQL**).

```
db.getCollectionNames().forEach(

	function(collection) { 
	    var documentCount = db[collection].count(); 
	    if(documentCount>4) { 
	        mongoexport --collection=collection.name --out=collection.name.json;
	    } 

	}
);

```
No obstante este procedimiento no funciona correctamente, ya que aún no he llegado a comprender la sintaxis del todo, pero la idea sería esta; un procedimiento que con **getCollectionNames**, por cada colección vaya **mostrando** el número de **documentos** que tiene, y si tiene **más de 4**, la exporte.

## Parte Grupal

**1. Importad el fichero resultante de la exportación completa de las tablas y los datos de una instancia de ORACLE en otra instancia diferente empleando el comando impdp y explicad qué problemas surgen. Realizad un remapeo de esquemas si es necesario.**

Para realizar la previa **exportación** de la base de datos, hemos utilizado el comando `expdp` con el parámetro `FULL=YES`  con el que indicamos que la exportación sea **completa**.

```
expdp sys/1234 DIRECTORY=orcl_full DUMPFILE=orclfull.dmp FULL=YES;
```

Luego tendremos que introducir las **credenciales** de un **usuario** con el **privilegio** `DATAPUMP_EXP_FULL_DATABASE`.
Cuando se termina la exportación, en el mismo directorio donde ejecutamos la orden, se nos creará el siguiente fichero, donde se habrán exportado todos los datos.

```
-rw-r-----  1 oracle oinstall 4001792 Feb 25 13:55 orclfull.dmp
```

Transferimos el fichero de una máquina a la otra por `scp`, concretamente al directorio **/opt/oracle/product/12.2.0.1/dbhome_1/rdbms/log/**. Después ejecutamos el siguiente comando:

```
impdp dumpfile=orclfull.dmp
```

Obteniendo en parte, una salida como esta:

```
Import: Release 12.2.0.1.0 - Production on Mar Feb 25 14:02:56 2020

Copyright (c) 1982, 2017, Oracle and/or its affiliates.  All rights reserved.

Usuario: sys as sysdba   # USUARIO CON PRIVILEGIOS DE SYSDBA (o alguno con el rol DATAPUMP_IMP_FULL_DATABSE)
Contraseña:              # CONTRASEÑA

Conectado a: Oracle Database 12c Enterprise Edition Release 12.2.0.1.0 - 64bit Production

...

Procesando el tipo de objeto DATABASE_EXPORT/EARLY_OPTIONS/VIEWS_AS_TABLES/TABLE
Procesando el tipo de objeto DATABASE_EXPORT/EARLY_OPTIONS/VIEWS_AS_TABLES/TABLE_DATA
. . "SYS"."KU$_EXPORT_USER_MAP"                 6.078 KB      37 filas importadas
Procesando el tipo de objeto DATABASE_EXPORT/EARLY_POST_INSTANCE_IMPCALLOUT/MARKER
Procesando el tipo de objeto DATABASE_EXPORT/NORMAL_OPTIONS/TABLE
Procesando el tipo de objeto DATABASE_EXPORT/NORMAL_OPTIONS/TABLE_DATA
. . "SYSTEM"."REDO_DB_TMP"                      25.59 KB       1 filas importadas
. . "ORDDATA"."ORDDCM_DOCS_TRANSIENT"           252.9 KB       9 filas importadas
. . "WMSYS"."E$WORKSPACES_TABLE$"               12.10 KB       1 filas importadas
. . "WMSYS"."E$HINT_TABLE$"                     9.984 KB      97 filas importadas
. . "WMSYS"."E$WORKSPACE_PRIV_TABLE$"           7.078 KB      11 filas importadas
. . "SYS"."AMGT$DP$DAM_CONFIG_PARAM$"           6.531 KB      14 filas importadas
. . "SYS"."DP$TSDP_SUBPOL$"                     6.328 KB       1 filas importadas
. . "WMSYS"."E$NEXTVER_TABLE$"                  6.375 KB       1 filas importadas
. . "WMSYS"."E$ENV_VARS$"                       6.015 KB       3 filas importadas
. . "SYS"."DP$TSDP_PARAMETER$"                  5.953 KB       1 filas importadas
. . "SYS"."DP$TSDP_POLICY$"                     5.921 KB       1 filas importadas
. . "WMSYS"."E$VERSION_HIERARCHY_TABLE$"        5.984 KB       1 filas importadas
. . "WMSYS"."E$EVENTS_INFO$"                    5.812 KB      12 filas importadas
. . "LBACSYS"."OLS_DP$OLS$AUDIT"                    0 KB       0 filas importadas
. . "LBACSYS"."OLS_DP$OLS$COMPARTMENTS"             0 KB       0 filas importadas
. . "LBACSYS"."OLS_DP$OLS$GROUPS"                   0 KB       0 filas importadas
. . "LBACSYS"."OLS_DP$OLS$LAB"                      0 KB       0 filas importadas
. . "LBACSYS"."OLS_DP$OLS$LEVELS"                   0 KB       0 filas importadas
. . "LBACSYS"."OLS_DP$OLS$POL"                      0 KB       0 filas importadas
. . "LBACSYS"."OLS_DP$OLS$POLS"                     0 KB       0 filas importadas
. . "LBACSYS"."OLS_DP$OLS$POLT"                     0 KB       0 filas importadas
. . "LBACSYS"."OLS_DP$OLS$PROFILE"                  0 KB       0 filas importadas
. . "LBACSYS"."OLS_DP$OLS$PROG"                     0 KB       0 filas importadas
. . "LBACSYS"."OLS_DP$OLS$USER"                     0 KB       0 filas importadas
. . "SYS"."AMGT$DP$AUD$"                            0 KB       0 filas importadas
. . "SYS"."AMGT$DP$DAM_CLEANUP_EVENTS$"             0 KB       0 filas importadas
. . "SYS"."AMGT$DP$DAM_CLEANUP_JOBS$"               0 KB       0 filas importadas
. . "SYS"."DP$TSDP_ASSOCIATION$"                    0 KB       0 filas importadas
. . "SYS"."DP$TSDP_CONDITION$"                      0 KB       0 filas importadas
. . "SYS"."DP$TSDP_FEATURE_POLICY$"                 0 KB       0 filas importadas
. . "SYS"."DP$TSDP_PROTECTION$"                     0 KB       0 filas importadas
. . "SYS"."DP$TSDP_SENSITIVE_DATA$"                 0 KB       0 filas importadas
. . "SYS"."DP$TSDP_SENSITIVE_TYPE$"                 0 KB       0 filas importadas
. . "SYS"."DP$TSDP_SOURCE$"                         0 KB       0 filas importadas
. . "SYSTEM"."REDO_LOG_TMP"                         0 KB       0 filas importadas
. . "WMSYS"."E$BATCH_COMPRESSIBLE_TABLES$"          0 KB       0 filas importadas
. . "WMSYS"."E$CONSTRAINTS_TABLE$"                  0 KB       0 filas importadas
. . "WMSYS"."E$CONS_COLUMNS$"                       0 KB       0 filas importadas
. . "WMSYS"."E$LOCKROWS_INFO$"                      0 KB       0 filas importadas
. . "WMSYS"."E$MODIFIED_TABLES$"                    0 KB       0 filas importadas
. . "WMSYS"."E$MP_GRAPH_WORKSPACES_TABLE$"          0 KB       0 filas importadas
. . "WMSYS"."E$MP_PARENT_WORKSPACES_TABLE$"         0 KB       0 filas importadas
. . "WMSYS"."E$NESTED_COLUMNS_TABLE$"               0 KB       0 filas importadas
. . "WMSYS"."E$RESOLVE_WORKSPACES_TABLE$"           0 KB       0 filas importadas
. . "WMSYS"."E$RIC_LOCKING_TABLE$"                  0 KB       0 filas importadas
. . "WMSYS"."E$RIC_TABLE$"                          0 KB       0 filas importadas
. . "WMSYS"."E$RIC_TRIGGERS_TABLE$"                 0 KB       0 filas importadas
. . "WMSYS"."E$UDTRIG_DISPATCH_PROCS$"              0 KB       0 filas importadas
. . "WMSYS"."E$UDTRIG_INFO$"                        0 KB       0 filas importadas
. . "WMSYS"."E$VERSION_TABLE$"                      0 KB       0 filas importadas
. . "WMSYS"."E$VT_ERRORS_TABLE$"                    0 KB       0 filas importadas
. . "WMSYS"."E$WORKSPACE_SAVEPOINTS_TABLE$"         0 KB       0 filas importadas
Procesando el tipo de objeto DATABASE_EXPORT/NORMAL_OPTIONS/VIEWS_AS_TABLES/TABLE
Procesando el tipo de objeto DATABASE_EXPORT/NORMAL_OPTIONS/VIEWS_AS_TABLES/TABLE_DATA
. . "MDSYS"."RDF_PARAM$TBL"                     6.515 KB       3 filas importadas
. . "SYS"."AMGT$DP$AUDTAB$TBS$FOR_EXPORT"       5.953 KB       2 filas importadas
. . "SYS"."DP$DBA_SENSITIVE_DATA"                   0 KB       0 filas importadas
. . "SYS"."DP$DBA_TSDP_POLICY_PROTECTION"           0 KB       0 filas importadas
. . "SYS"."AMGT$DP$FGA_LOG$FOR_EXPORT"              0 KB       0 filas importadas
. . "SYS"."NACL$_ACE_IMP"                           0 KB       0 filas importadas
. . "SYS"."NACL$_HOST_IMP"                      6.976 KB       2 filas importadas
. . "SYS"."NACL$_WALLET_IMP"                        0 KB       0 filas importadas
. . "SYS"."DATAPUMP$SQL$TEXT"                       0 KB       0 filas importadas
. . "SYS"."DATAPUMP$SQL$"                           0 KB       0 filas importadas
. . "SYS"."DATAPUMP$SQLOBJ$AUXDATA"                 0 KB       0 filas importadas
. . "SYS"."DATAPUMP$SQLOBJ$DATA"                    0 KB       0 filas importadas
. . "SYS"."DATAPUMP$SQLOBJ$PLAN"                    0 KB       0 filas importadas
. . "SYS"."DATAPUMP$SQLOBJ$"                        0 KB       0 filas importadas
. . "SYSTEM"."SCHEDULER_JOB_ARGS_TMP"           8.671 KB       4 filas importadas
. . "SYSTEM"."SCHEDULER_PROGRAM_ARGS_TMP"       10.29 KB      23 filas importadas
. . "WMSYS"."E$EXP_MAP"                         7.718 KB       3 filas importadas
. . "WMSYS"."E$METADATA_MAP"                        0 KB       0 filas importadas

...
```
Como hemos realizado una exportación **completa** de la base de datos, han surgido una serie de **excepciones** indicandonos **errores** como _usuarios duplicados_, _tablas duplicadas_, etc. No obstante, a pesar de todos estos errores, la ejecución del comando ha finalizado sin inconveniente alguno. Lo que ha hecho ha sido **obviar** los elementos duplicados y añadir los que faltaban, tal y como mostramos en el _**prompt**_ de arriba (donde vemos cómo se añaden las filas).

**2. Cread la estructura de tablas de uno de vuestros proyectos de 1º en ORACLE y, mediante una exportación cread un script básico de creación de las tablas con las respectivas restricciones. Realizad de la forma más automatizada posible las acciones necesarias para transformar ese script generado por ORACLE en un script de creación de tablas para Postgres. Documentar todas las acciones realizadas y el código usado para llevarlas a cabo.**

Primero vamos a crear la estructura de tablas de la base de datos del año pasado.

```
create table clientes
(
DNI 						varchar2(9),
Nombre 						varchar2(30),
Apellido 					varchar2(30),
Provincia 					varchar2(30),
Poblacion 					varchar2(30),
Direccion 					varchar2(30),
Telefono 					varchar2(9),
CONSTRAINT pk_dni 			PRIMARY KEY (DNI),
CONSTRAINT ck_dni 			CHECK (REGEXP_LIKE(DNI, '^[0-9]{8}[A-Z]$|^[KLMXYZ][0-9]{7}[A-Z]$'))
);


INSERT INTO clientes
VALUES ('47426562X','Ernesto','Vazquez Garcia','Sevilla','Utrera','Clarinete 13','640514263');

INSERT INTO clientes
VALUES ('47426869H','Juan','Garcia Martinez','Sevilla','Utrera','Flauta 8','640695847');

INSERT INTO clientes
VALUES ('42659847E','Jorge','Lorenzo Guerrero','Sevilla','Utrera','Perdiz 17','955865748');

INSERT INTO clientes
VALUES ('58426958N','Alvaro','Bautista Arce','Sevilla','Utrera','Paloma 21','955861942');

INSERT INTO clientes
VALUES ('78563214K','Maverick','Viñales Ruiz','Sevilla','Utrera','Blas Infante 4','955864129');

INSERT INTO clientes
VALUES ('58694742F','Nicolas','Nieto Rodriguez','Sevilla','Utrera','Cordoba 20','955863673');

INSERT INTO clientes
VALUES ('65321426T','Alfonso','Reyes Gandullo','Sevilla','Utrera','Clarinete 21','955861497');

INSERT INTO clientes
VALUES ('41038573H','Alejandro','Rins Navarro','Sevilla','Utrera','Molino 5','665476248');
```

**3. SQL-Loader es una herramienta que sirve para cargar grandes volúmenes de datos en una instancia de ORACLE. Exportad los datos de uno de vuestros proyectos de 1o desde Postgres a texto plano con delimitadores y emplead SQL-Loader para realizar el proceso de carga de dichos datos a una instancia ORACLE. Debéis explicar los distintos ficheros de configuración y de log que tiene SQL-Loader.**

Referencia: [Documentación oficial de Oracle](https://docs.oracle.com/cd/B19306_01/server.102/b14215/ldr_concepts.htm)

-----------------------------------------------------------------------

Primero vamos a exportar los datos de postgres a texto plano.

Previamente vamos a crear una base de datos nueva para añadir el proyecto de 1º.

```
postgres@postgres:~$ createdb loader

...

postgres@postgres:~$ pg_dump -U postgres loader > loader.sql

postgres@postgres:~$ ls
11  loader.sql
```

Como se puede observar se ha realizado correctamente la exportación.

Con el comando `sqlldr` llamamos a la herramienta antes mencionada, e indicando los siguientes parámetros:

* **userid**: Especificamos tanto el usuario como el nombre de la base de datos y la contraseña.
* **DIRECT=TRUE**: Tipo de path usado para la carga
* **CONTROL**= Es el nombre del fichero contenedor de la estructura de las tablas.
* **DATA**= Indicamos el nombre del fichero contenedor de los datos.

`[root@oracle ~]# sqlldr userid=ernesto/ernesto@loaderbd DIRECT=TRUE FILE=loader.sql `

Además contamos con todos estos parámetros adicionales:

- **LOG**: Ruta y archivo de log
- **BAD**: Ruta y archivo generado por datos erróneos
- **DISCARD**: Ruta y archivo generado con datos descartados
- **DISCARDMAX**: Maxcantidad de archivos descartados
- **SKIP**: Salto de registros
- **LOAD**: Registros a cargar por defecto
- **ERRORS**: Cantidad de errores aceptados
- **ROW**: Numero de filas que se cargan con cada INSERT
- **BINDSIZE**: Máximo tamaño  65536b, 64k
- **SILENT**: Permite suprimir cabeceras, mensajes
- **PARFILE**: Lee parámetros desde fichero de texto
- **READSIZE**: Cant. buffer utilizado en la carga
- **FILE**: Ruta y nombre de fichero de entrada

Ejecutaremos el fichero del siguiente directorio
`C:\app\win\product\11.2.0\dbhome_1\BIN\sqlldr.exe`

![](https://i.imgur.com/nPmaa6E.png)

