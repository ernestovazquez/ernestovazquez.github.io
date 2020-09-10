---
title: "Gestión de Almacenamiento"
author: Ernesto Vázquez García
date: 2020-02-04 00:00:00 +0800
categories: [Bases de datos]
tags: [Oracle, PostgreSQL, MySQL]
---

# Alumno 1 (Luis Vázquez Alejo)

## ORACLE

**1. Muestra los espacios de tablas existentes en tu base de datos y la ruta de los ficheros que los componen. ¿Están las extensiones gestionadas localmente o por diccionario?**

Para visualizar los _tablespaces_ del sistema, tendremos que ejcutar el siguiente comando.

```
SQL> col FILE_NAME form A40;
SQL> select FILE_NAME, TABLESPACE_NAME from dba_data_files UNION select FILE_NAME, TABLESPACE_NAME from dba_temp_files;

FILE_NAME				 TABLESPACE_NAME
---------------------------------------- ------------------------------
/opt/oracle/oradata/orcl/sysaux01.dbf	 SYSAUX
/opt/oracle/oradata/orcl/system01.dbf	 SYSTEM
/opt/oracle/oradata/orcl/temp01.dbf	 TEMP
/opt/oracle/oradata/orcl/undotbs01.dbf	 UNDOTBS1
/opt/oracle/oradata/orcl/users01.dbf	 USERS
```

En mi caso, como en la instalación no cambié la opción para poder hacer uso del parámetro _storage_ a la hora de crear tablas, están gestionadas **localmente**.

**2. Usa la vista del diccionario de datos v$datafile para mirar cuando fue la última vez que se ejecutó el proceso CKPT en tu base de datos.**

```
select max(CHECKPOINT_TIME) from v$datafile;

MAX(CHEC
--------
24/01/20
```

**3. Intenta crear el tablespace TS1 con un fichero de 2M en tu disco que crezca automáticamente cuando sea necesario. ¿Puedes hacer que la gestión de extensiones sea por diccionario? Averigua la razón.**

```
SQL> create tablespace ts1
  2  datafile 'ts1.dbf'
  3  size 2M
  4  autoextend on;

Tablespace creado.
```

Dependiendiendo de cómo se instaló _Oracle_. Es decir, si durante la instalación, se especificó una gestión manual del almacenamiento,

**4. Averigua el tamaño de un bloque de datos en tu base de datos. Cámbialo al doble del valor que tenga.**

```
select distinct bytes/blocks from user_segments;

BYTES/BLOCKS
------------
	8192

```

En principio _Oracle_ no permite la modificación del tamaño de bloque de un tablespace ya creado, por lo que nos disponemos a crear uno nuevo. Antes de crear dicho tablespace, vamos a modificar un valor del sistema para establecer el nuevo tamaño de bloque.

```
ALTER SYSTEM SET DB_16k_CACHE_SIZE=100M;
```
Después reiniciamos la base de datos para que se cargue la variable que hemos redefinido y creamos este nuevo _tablespace_.

```
shutdown inmediate;
startup
create tablespace prueba datafile '/home/oracle/test.img' size 1M blocksize 16K;
```
Y a continuación ejecutamos una consulta para verificar el tamaño de bloque.

```
SQL> select tablespace_name, block_size from dba_tablespaces where tablespace_name='PRUEBA';

TABLESPACE_NAME 	       BLOCK_SIZE
------------------------------ ----------
PRUEBA				    16384
```

**5. Realiza un procedimiento MostrarObjetosdeUsuarioenTS que reciba el nombre de un tablespace y el de un usuario y muestre qué objetos tiene el usuario en dicho tablespace y qué tamaño tiene cada uno de ellos.**

```
create or replace procedure MostrarObjetosdeUsuarioenTS(p_tsname VARCHAR2,
							p_user VARCHAR2)
is

	cursor c_userobjectsTS
	is
	select segment_name object, bytes
	from dba_segments
	where tablespace_name=p_tsname
	and owner=p_user;

begin
	dbms_output.put_line('OBJETOS USUARIO '||p_user||chr(9)||'TAMAÑO (BYTES)');
	for i in c_userobjectsTS loop
		dbms_output.put_line(i.object||chr(9)||chr(9)||i.bytes);
	end loop;
end;
/
```

_Comprobación_
```
SQL> exec MostrarObjetosdeUsuarioenTS('USERS','LUIS');
OBJETOS USUARIO LUIS	TAMAÑO (BYTES)
OPERACIONES		65536
CLINICAS		65536
CLIENTES		65536
ANIMALES		65536
VACUNAS			65536
VIRUS			65536
VETERINARIOS		65536
VACUNACIONES		65536
SALAS			65536
QUIROFANOS		65536
CITASPOSIBLES		65536
CITASPREVIAS		65536
PK_OPERACION		65536
PK_CLINICA		65536
PK_DNI			65536
PK_ANIMAL		65536
PK_VACUNA		65536
PK_VIRUS		65536
PK_VETERINARIO		65536
PK_VACUNAS		65536
PK_SALA_CLINICA		65536
PK_QUIROFANO		65536
PK_CITA			65536
PK_CITAS		65536
SYS_C007423		65536

Procedimiento PL/SQL terminado correctamente.
```

**6. Realiza un procedimiento llamado MostrarUsrsCuotaIlimitada que muestre los usuarios que puedan escribir de forma ilimitada en más de uno de los tablespaces que cuentan con ficheros en la unidad C:**

Para saber qué usuarios tienen una cuota ilimitada, debemos observar dos campos; el número máximos de bloques o **max_blocks** y el número máximo de _bytes_ o **max_bytes**. Para que el usuario tenga una cuota ilimitada, ambos campos deben de tener valor igual a **-1**.

```
create or replace procedure MostrarUsrsCuotaIlimitada
is
	cursor c_UsuarioSinCuota
	is
	select username nombre
	from DBA_TS_QUOTAS
	where max_blocks = -1
	and max_bytes = -1
	and tablespace_name in (select tablespace_name
				  from DBA_DATA_FILES
				  where substr(file_name,1,12) = '/home/oracle')
	group by username
	having count(tablespace_name) > 1
	UNION
	select grantee nombre
	from DBA_SYS_PRIVS
	where privilege = 'UNLIMITED TABLESPACE';

begin
	dbms_output.put_line('Usuarios con cuota ilimitada');
	for usuario in c_UsuarioSinCuota loop
		dbms_output.put_line(usuario.nombre);
	end loop;
end;
/
```


## PostgreSQL:
       
**7. Averigua si existe el concepto de tablespace en Postgres, en qué consiste y las diferencias con los tablespaces de ORACLE.**

Los _tablespaces_ si que existen en _Postgres_, aunque como veremos más adelante presentan una funcionalidad bastante reducida respecto a la versión de _Oracle_. Sin embargo, los _tablespaces_ en _Postgres_ si que aportan una mejora real al sistema, ya que permiten la segmentación y distribución física de los datos al poder ubicarlos en diversos directorios. Un ejemplo práctico sería crear un _tablespace_ con los datos de acceso más concurridos y ubicarlo en una unidad de disco estado sólido.

* Sintaxis en Oracle

```
CREATE [TEMPORARY|UNDO] TABLESPACE nombrets
[DATAFILE|TEMPFILE] ruta_absoluta_fichero [SIZE nº [K|M]][REUSE][AUTOEXTEND ON [MAXSIZE n M]]
… (podemos añadir más ficheros separando con comas)...
[LOGGING|NOLOGGING]
[PERMANENT|TEMPORARY]
[DEFAULT STORAGE
(clausulas de almacenamiento)]
[OFFLINE];
```

* Sintaxis en Postgres

```
CREATE TABLESPACE tablespace_name
    [ OWNER { new_owner | CURRENT_USER | SESSION_USER } ]
    LOCATION 'directory'
    [ WITH ( tablespace_option = value [, ... ] ) ]
```

* Referencias: 
1. [Crear tablespace en Oralce](https://docs.oracle.com/cd/B19306_01/server.102/b14200/statements_7003.htm)
2. Documentación oficial de Postgresql; [Definición de tablespace](https://www.postgresql.org/docs/10/manage-ag-tablespaces.html), [Creación de tablespaces](https://www.postgresql.org/docs/10/sql-createtablespace.html)


### Diferencias principales

* En Oracle se usan ficheros (_datafiles_) y en Postgres usamos directorios.
* Mientras que Oracle permite una definición más precisa de estos _tablespaces_, Postgres se queda un poco corto ya que ni siquiera podemos definir un tamaño máximo.

## MySQL:

**8. Averigua si pueden establecerse claúsulas de almacenamiento para las tablas o los espacios de tablas en MySQL.**

A la hora de crear tablas podemos usar una serie de parámetros para definir aspectos como el número máximo de registros, la ruta donde se ubicará el fichero contenedor de la tabla o si queremos encriptar el contenido o no. Estos son todos los parámetros:

```
MariaDB [(none)]> help create table
...

table_options:
    table_option [[,] table_option] ...

table_option:
    ENGINE [=] engine_name
  | AUTO_INCREMENT [=] value
  | AVG_ROW_LENGTH [=] value
  | [DEFAULT] CHARACTER SET [=] charset_name
  | CHECKSUM [=] {0 | 1}
  | [DEFAULT] COLLATE [=] collation_name
  | COMMENT [=] &apos;string&apos;
  | CONNECTION [=] &apos;connect_string&apos;
  | DATA DIRECTORY [=] &apos;absolute path to directory&apos;
  | DELAY_KEY_WRITE [=] {0 | 1}
  | INDEX DIRECTORY [=] &apos;absolute path to directory&apos;
  | INSERT_METHOD [=] { NO | FIRST | LAST }
  | KEY_BLOCK_SIZE [=] value
  | MAX_ROWS [=] value
  | MIN_ROWS [=] value
  | PACK_KEYS [=] {0 | 1 | DEFAULT}
  | PASSWORD [=] &apos;string&apos;
  | ROW_FORMAT [=] {DEFAULT|DYNAMIC|FIXED|COMPRESSED|REDUNDANT|COMPACT}
  | TABLESPACE tablespace_name [STORAGE {DISK|MEMORY|DEFAULT}]
  | UNION [=] (tbl_name[,tbl_name]...)

partition_options:
    PARTITION BY
        { [LINEAR] HASH(expr)
        | [LINEAR] KEY(column_list)
        | RANGE{(expr) | COLUMNS(column_list)}
        | LIST{(expr) | COLUMNS(column_list)} }
    [PARTITIONS num]
    [SUBPARTITION BY
        { [LINEAR] HASH(expr)
        | [LINEAR] KEY(column_list) }
      [SUBPARTITIONS num]
    ]
    [(partition_definition [, partition_definition] ...)]

partition_definition:
    PARTITION partition_name
        [VALUES 
            {LESS THAN {(expr | value_list) | MAXVALUE} 
            | 
            IN (value_list)}]
        [[STORAGE] ENGINE [=] engine_name]
        [COMMENT [=] &apos;comment_text&apos; ]
        [DATA DIRECTORY [=] &apos;data_dir&apos;]
        [INDEX DIRECTORY [=] &apos;index_dir&apos;]
        [MAX_ROWS [=] max_number_of_rows]
        [MIN_ROWS [=] min_number_of_rows]
        [TABLESPACE [=] tablespace_name]
        [NODEGROUP [=] node_group_id]
        [(subpartition_definition [, subpartition_definition] ...)]

subpartition_definition:
    SUBPARTITION logical_name
        [[STORAGE] ENGINE [=] engine_name]
        [COMMENT [=] &apos;comment_text&apos; ]
        [DATA DIRECTORY [=] &apos;data_dir&apos;]
        [INDEX DIRECTORY [=] &apos;index_dir&apos;]
        [MAX_ROWS [=] max_number_of_rows]
        [MIN_ROWS [=] min_number_of_rows]
        [TABLESPACE [=] tablespace_name]
        [NODEGROUP [=] node_group_id]
...

```

A pesar de todo lo que podemos definir una tabla en _mysql_, no cuenta con la posibilidad de crear _tablespaces_ en circustancias normales. Para poder disponer de esta funcionalidad, deberíamos de tener instalada la versión de **alta disponibilidad** en **cluster** de _mysql_, es decir la conocida [MySQL NDB](https://dev.mysql.com/doc/refman/5.7/en/mysql-cluster.html). En este caso la sintaxis a la hora de crear los _tablespaces_ es la siguiente:

```
CREATE TABLESPACE tablespace_name

  InnoDB and NDB:
    ADD DATAFILE 'file_name'

  InnoDB only:
    [FILE_BLOCK_SIZE = value]

  NDB only:
    USE LOGFILE GROUP logfile_group
    [EXTENT_SIZE [=] extent_size]
    [INITIAL_SIZE [=] initial_size]
    [AUTOEXTEND_SIZE [=] autoextend_size]
    [MAX_SIZE [=] max_size]
    [NODEGROUP [=] nodegroup_id]
    [WAIT]
    [COMMENT [=] 'string']

  InnoDB and NDB:
    [ENGINE [=] engine_name]
```

* Referencia: [Documentacion oficial de MySQL](https://dev.mysql.com/doc/refman/5.7/en/create-tablespace.html)

## MongoDB:

**9. Averigua si existe el concepto de índice en MongoDB y las diferencias con los índices de ORACLE. Explica los distintos tipos de índice que ofrece MongoDB.**

En _MongoDB_ existen distintos tipos de índices en función de como queremos que funcione (aplicado sobre un campo o varios, en orden ascendente, descendente, etc), mientras que en Oracle solo disponemos de un tipo que contiene la mayoría de dichas funcionalidades.

* **Simples**: Se aplican a un único campo, y con el valor **1** o **-1** indicamos si se aplica de forma ascendente o descendente respectivamente.

```
db.alumnos.createIndex( { "nombre" : 1 } )
```

* **Compound**: Se utilizan sobre dos o más valores y se comporta de la misma forma que los _simples_, por lo tanto podemos especificar en cada campo que indiquemos el sentido de la búsqueda.

```
db.alumnos.createIndex( { "nombre" : 1, "nota": -1 } ) 

# Búsqueda del campo libro en orden ascendente y el
# autor en orden descendente
```

* **Multikey**: Sirven para indexar contenido almacenado en _arrays_. Normalmente cuando _MongoDB_ recorre un documento con _arrays_, recorre cada uno de sus valores, mientras que si utilizamos este tipo de índices, podemos aseguranos de que solo recorra aquellos _arrays_ que contengan uno de los valores que hemos especificado. Para crear este tipo de índices no tenemos que hacer nada, que ya al utilizar el método _createIndex_, el propio sistema crea de forma automática un _index simple_ o un _index multikey_.


* **Unique**: Se utilizan para eliminar los campos duplicados, algo parecido a cuando relizamos una _select distinct_ en _Oracle_

```
db.alumnos.createIndex( { "nota" : 1 }, {"unique":true} )
```

* **TTL Indexes**: Personalmente no lo consideraría un tipo de índice como tal, ya que con esta propiedad especificamos el tiempo de espiración de un documento en base a un campo del mismo. En el ejemplo que expone la documentación de _Mongo_, se borrarían los documentos de la colección **eventlog** que no fuesen modificados después de una hora.

```
db.eventlog.createIndex( { "lastModifiedDate": 1 }, { expireAfterSeconds: 3600 } )
```


* Referencia: [Documentación oficial MongoDB](https://docs.mongodb.com/manual/indexes/)

# Alumno 2 (Juan Diego Abadía Noguera):

## ORACLE

**1. Establece que los objetos que se creen en el TS1 (creado por Alumno 1) tengan un tamaño inicial de 200K, y que cada extensión sea del doble del tamaño que la anterior. El número máximo de extensiones debe ser de 3.**
- Alumno 1
```
SQL> create tablespace ts1
  2  datafile 'c:\app\Oracle\oradata\orcl\ts1.dbf'
  3  size 2M
  4  autoextend on;

Tablespace creado.
```

- Modificandolo
```
SQL> ALTER TABLESPACE TS1 OFFLINE;

Tablespace modificado.

SQL> ALTER TABLESPACE TS1
  2  DEFAULT STORAGE (
  3  INITIAL 200K
  4  NEXT 400K
  5  MINEXTENTS 1
  6  MAXEXTENTS 3);
ALTER TABLESPACE TS1
*
ERROR en lÝnea 1:
ORA-25143: la clßusula de almacenamiento por defecto no es compatible con la
polÝtica de asignaci¾n
```

![](https://i.imgur.com/KZdmFWG.png)


- Creando de nuevo el tablespace
```
SQL> CREATE TABLESPACE ts1
  2  DATAFILE 'ts1.dbf'
  3  SIZE 2M
  4  DEFAULT STORAGE (
  5  INITIAL 200K
  6  NEXT 400K
  7  MINEXTENTS 1
  8  MAXEXTENTS 3);

Tablespace creado.
```

![](https://i.imgur.com/XY3c9kg.png)
  
**2. Crea dos tablas en el tablespace recién creado e inserta un registro en cada una de ellas. Comprueba el espacio libre existente en el tablespace. Borra una de las tablas y comprueba si ha aumentado el espacio disponible en el tablespace. Explica la razón.**

- Tablas que insertaré

```
create table Medicamentos
(
	Codigo VARCHAR2(10),
	NombreComercial VARCHAR2(40),
	Laboratorio VARCHAR2(40),
	FinanciadoSS VARCHAR2(2),
	NecesitaReceta VARCHAR2(2),
	CONSTRAINT pk_medicamento PRIMARY KEY(Codigo),
	CONSTRAINT necreceta CHECK(NecesitaReceta IN ('SI','Si','NO','No')),
	CONSTRAINT nomcomnonull CHECK(NombreComercial is not null)
)
TABLESPACE TS1;

create table Categorias
(
	Codigo VARCHAR2(10),
	Nombre VARCHAR2(20),
	CONSTRAINT pk_categoria PRIMARY KEY(Codigo),
	CONSTRAINT nomnonull CHECK(Nombre is not null)
)
TABLESPACE TS1;

insert into Medicamentos(Codigo,NombreComercial,Laboratorio,FinanciadoSS,NecesitaReceta)
values ('AD6','ADCETRIS','TAKEDA PHARMA A/S','SI','SI');

insert into Categorias(Codigo,Nombre)
values ('1','CÓDIGO ATC A');

```
![](https://i.imgur.com/kOVynIc.png)

- Comprobar el espacio libre

```
SQL> select bytes
  2  from dba_free_space
  3  where tablespace_name='TS1';

     BYTES
----------
    786432
```

![](https://i.imgur.com/KwxS8sz.png)

- Borrar tabla

```
SQL> DROP TABLE Categorias;

Tabla borrada.
```

![](https://i.imgur.com/jPPonPm.png)

- Comprobar el espacio libre despues de eliminar la tabla
```
SQL> select bytes
  2  from dba_free_space
  3  where tablespace_name='TS1';

     BYTES
----------
    786432
     65536
     65536
```
![](https://i.imgur.com/CWKFD6H.png)

> Al eliminar la tabla se ha quedado libre dos segmentos de **65536** bytes del tablespace TS1.
       
**3. Convierte a TS1 en un tablespace de sólo lectura. Intenta insertar registros en la tabla existente. ¿Qué ocurre?. Intenta ahora borrar la tabla. ¿Qué ocurre? ¿Porqué crees que pasa eso?**

- Convertir el tablespace en modo lectura

```
SQL> ALTER TABLESPACE TS1 READ ONLY;

Tablespace modificado.
```

![](https://i.imgur.com/SOaCKBb.png)

- Insertar registros a la tabla del tablespace

```
SQL> insert into Medicamentos(Codigo,NombreComercial,Laboratorio,FinanciadoSS,Ne
cesitaReceta)
  2  values ('EX4','NEXAVAR','BAYER AG','NO','SI');
insert into Medicamentos(Codigo,NombreComercial,Laboratorio,FinanciadoSS,Necesit
aReceta)
            *
ERROR en lÝnea 1:
ORA-00372: el archivo 8 no se puede modificar en este momento
ORA-01110: archivo de datos 8:
'C:\APP\ORACLE\PRODUCT\11.2.0\DBHOME_1\DATABASE\TS1.DBF'
```

![](https://i.imgur.com/FTxeZpl.png)

> Al estar en modo lectura el tablespace evita todas la operaciones de escritura en el tablespace

- Borrar la tabla

```
SQL> DROP TABLE Medicamentos;

Tabla borrada.
```

![](https://i.imgur.com/oQ9ZNEh.png)

> Porque las tablas estan en el diccionario de datos y ese tablespace es gestionado por un usuario, en este caso SYS que tiene permisos
[Diccionario de datos](http://www.iiia.csic.es/udt/es/blog/jrodriguez/2008/diccionario-datos-en-oracle-9i-guia-util)

**4. Crea un espacio de tablas TS2 con dos ficheros en rutas diferentes de 1M cada uno no autoextensibles. Crea en el citado tablespace una tabla con la clausula de almacenamiento que quieras. Inserta registros hasta que se llene el tablespace. ¿Qué ocurre?**

- Creamos el tablespace TS2
```
SQL> create tablespace ts2
  2  datafile 'c:\app\Oracle\oradata\orcl\ts2.dbf' size 1m, 'c:\app\Oracle\orada
ta\ts2.dbf' size 1M
  3  autoextend off;

Tablespace creado.
```

- Insertar registros
```
 create table visitantes(
  nombre char(2000),
  edad char(2000),
  sexo char(2000),
  domicilio char(2000),
  ciudad char(2000),
  telefono char(2000)
 )
TABLESPACE TS2;
```

- Llenar tablespace

![](https://i.imgur.com/0enmmHu.png)

> Nos da el error de que el tablespace esta lleno y al haber creado el tablespace sin autoextendido nos dice que no se ha podido ampliar

[Tabla insertada](https://www.tutorialesprogramacionya.com/oracleya/simulador/simulador.php?inicio=0&cod=173&punto=15)

**5. Hacer un procedimiento llamado MostrarUsuariosporTablespace que muestre por pantalla un listado de los tablespaces existentes con la lista de usuarios que tienen asignado cada uno de ellos por defecto y el número de los mismos, así:**

   Tablespace xxxx:

	Usr1
	Usr2
	...

   Total Usuarios Tablespace xxxx: n1
 
   Tablespace yyyy:

	Usr1
	Usr2
	...

   Total Usuarios Tablespace yyyy: n2
   ....
   Total Usuarios BD: nn

   No olvides incluir los tablespaces temporales y de undo.

```
create or replace procedure MostrarUsuariosporTablespace
is
    v_nomtablespace    VARCHAR2(50);
    v_total            NUMBER:=0;
    CURSOR c_cursor is
    select tablespace_name
    from dba_tablespaces;
    v_cursor    c_cursor%ROWTYPE;
begin
    for v_cursor in c_cursor loop
        v_nomtablespace:=v_cursor.tablespace_name;
        MostrarUsuarios(v_nomtablespace,v_total);
    end loop;
    dbms_output.put_line('Total Usuarios BD: '||v_total);
end;
/

create or replace procedure MostrarUsuarios(v_nomtablespace VARCHAR2,v_total in out NUMBER)
is
    v_usuario    VARCHAR2(50);
    v_cont       NUMBER:=0;
    CURSOR c_users is
    select username
    from dba_users
    where default_tablespace=v_nomtablespace;
    v_users    c_users%ROWTYPE;
begin
    dbms_output.put_line('Tablespace ' || v_nomtablespace);
    for v_users in c_users loop
        v_usuario:=v_users.username;
        v_cont:=v_cont + 1;
        dbms_output.put_line(v_usuario);
    end loop;
    v_total:=v_total + v_cont;
    dbms_output.put_line('Total Usuarios Tablespace '||v_nomtablespace||' : '||v_cont);
    dbms_output.put_line(' 
     ');
end;
/
    
exec MostrarUsuariosporTablespace;
```

**6. Realiza un procedimiento llamado MostrarDetallesIndices que reciba el nombre de una tabla y muestre los detalles sobre los índices que hay definidos sobre las columnas de la misma.**

```
create or replace procedure MostrarDetallesIndices(p_tabla VARCHAR2)
is
    v_nomindice        VARCHAR2(50);
    v_nomtablespace    VARCHAR2(50);
    v_propietario      VARCHAR2(50);
    CURSOR c_cursor is
    select index_name, table_name, tablespace_name, owner
    from dba_indexes
    where table_name=p_tabla;
    v_cursor    c_cursor%ROWTYPE;
begin
    for v_cursor in c_cursor loop
        v_nomindice:=v_cursor.index_name;
        v_nomtablespace:=v_cursor.tablespace_name;
        v_propietario:=v_cursor.owner;
        dbms_output.put_line('Nombre de la tabla: '||p_tabla||' Nombre del indice: '||v_nomindice||' Nombre del tablespace: '||v_nomtablespace||' Propietario: '||v_propietario);
    end loop;
end;
/
```
       
## PostgreSQL
         
**7. Averigua si existe el concepto de segmento y el de extensión en Postgres, en qué consiste y las diferencias con los conceptos correspondientes de ORACLE.**

- En postgresql, un segmento es el archivo/s que se crean al crear un tablespace, con diferencia en Oracle es un grupo de bloques de disco.
       
## MySQL

**8. Averigua si existe el concepto de espacio de tablas en MySQL y las diferencias con los tablespaces de ORACLE.**

Mysql utiliza el sistema de almacenamiento mediante tablespaces. Motores de almacenamiento: InnoDB y NDB. Estos respecto a Oracle tienen más limitaciones en cuanto a la gestión de almacenamiento.

Vamos a ver la sintaxis a la hora de crear un tablespace, ya que tiene gran similitud a Oracle.

    - InnoDB:

```
CREATE TABLESPACE tablespace_name
    [ADD DATAFILE 'file_name']
    [FILE_BLOCK_SIZE = value]
    [ENCRYPTION [=] {'Y' | 'N'}]
    [ENGINE [=] InnoDB];
```

- NDB:

Primero debemos crear un logfile, ya que es necesario para crear el tablespace.

`CREATE LOGFILE GROUP logfile_group;`


Ya podemos crear el tablespace. (Entre corchetes vamos a poner los parámetros opcionales)

```
CREATE TABLESPACE tablespace_name
    [ADD DATAFILE 'file_name']
    USE LOGFILE GROUP logfile_group
    [EXTENT_SIZE [=] extent_size]
    [INITIAL_SIZE [=] initial_size]
    [AUTOEXTEND_SIZE [=] autoextend_size]
    [MAX_SIZE [=] max_size]
    [NODEGROUP [=] nodegroup_id]
    [WAIT]
    [COMMENT [=] 'string']
    [ENGINE [=] NDB];
```

La principal diferencia con Oracle se puede encontrar a la hora de asignarle una cuota de almacenamiento ya que con el motor InnoDB, no es posible.

Tampoco contamos con todas las cláusulas de almacenamiento, que si tenemos en Oracle.

> Esta información tambien se encuentra en nuestra grupal

## MongoDB

**9. Averigua si existe la posibilidad en MongoDB de decidir en qué archivo se almacena una colección.**

> No he encontrado ninguna documentación.

# Alumno 3 (Adrián Jaramillo Rodríguez):

## ORACLE

**0. Creación del tablespace TS2 hecho por el alumno 2**

* Creamos el tablespace TS2
```
create tablespace ts2
  datafile '/opt/oracle/oradata/orcl/ts2.dbf' size 1m, '/opt/oracle/oradata/ts2.dbf' size 1M
 autoextend off;
```
![](https://i.imgur.com/lBmkylT.png)


* Crear la tabla donde insertaremos registros
```
create table visitantes(
  nombre char(2000),
  edad char(2000),
  sexo char(2000),
  domicilio char(2000),
  ciudad char(2000),
  telefono char(2000)
)
TABLESPACE TS2;
```

* Los insertamos

```
insert into visitantes (nombre,edad,sexo,domicilio,ciudad,telefono)
  values ('Ana Acosta',25,'f','Avellaneda 123','Cordoba','4223344');

insert into visitantes (nombre,edad,sexo,domicilio,ciudad,telefono)
  values ('Betina Bustos',32,'fem','Bulnes 234','Cordoba','4515151');

insert into visitantes (nombre,edad,sexo,domicilio,ciudad,telefono)
  values ('Betina Bustos',32,'f','Bulnes 234','Cordoba','4515151');

insert into visitantes (nombre,edad,sexo,domicilio,ciudad,telefono)
  values ('Carlos Caseres',43,'m','Colon 345','Cordoba',03514555666);
```
> He repetido el añadido de registros tal y como hizo el alumno 2, hasta que se llenó el tablespace por completo (cosa que se requería hacer)




**1. Muestra los objetos a los que pertenecen las extensiones del tablespace TS2 (creado por Alumno 2) y el tamaño de cada una de ellas.**

```
SELECT SEGMENT_NAME,
       EXTENT_ID,
	   BYTES
  FROM DBA_EXTENTS
 WHERE TABLESPACE_NAME = 'TS2'
```



**2. Borra la tabla que está llenando TS2 consiguiendo que vuelvan a existir extensiones libres. Añade después otro fichero de datos a TS2.**

Con `truncate table` se borra una tabla, y además se libera el espacio en disco
```
TRUNCATE TABLE <nombre_tabla>;
```

Añadir datafile a tablespace
```
ALTER TABLESPACE TS2
	ADD DATAFILE '/opt/oracle/oradata/orcl/extra.dbf'; 
```


**3. Crea el tablespace TS3 gestionado localmente con un tamaño de extensión uniforme de 128K y un fichero de datos asociado. Cambia la ubicación del fichero de datos y modifica la base de datos para que pueda acceder al mismo. Crea en TS3 dos tablas e inserta registros en las mismas. Comprueba que segmentos tiene TS3, qué extensiones tiene cada uno de ellos y en qué ficheros se encuentran.**

Crear tablespace
```
CREATE TABLESPACE TS3 DATAFILE '/opt/oracle/oradata/orcl/ts3.dbf'
    EXTENT MANAGEMENT LOCAL UNIFORM SIZE 128K;
```


Mostrar los segmentos de un tablespace
```
SELECT owner, 
       segment_name,
       partition_name,
       segment_type,
       bytes
  FROM dba_segments
 WHERE tablespace_name = 'TS3'
```


Mostrar los extents que componen un segmento, junto con el fichero donde se encuentran
```
SELECT EXTENT_ID,
       FILE_ID
  FROM DBA_EXTENTS
 WHERE SEGMENT_NAME = 'nombre_del_segmento'
```





**4. Redimensiona los ficheros asociados a los tres tablespaces que has creado de forma que ocupen el mínimo espacio posible para alojar sus objetos.**

Para redimensionar un datafile:
```
alter database
datafile
   '<ruta_al_datafile>'
resize <nuevo_tamaño>;
```

Ejemplo:
```
alter database
datafile
   '/opt/oracle/oradata/orcl/ts3.dbf'
resize 50M;
```

**5. Realiza un procedimiento llamado InformeRestricciones que reciba el nombre de una tabla y muestre los nombres de las restricciones que tiene, a qué columna o columnas afectan y en qué consisten exactamente.**

**6. Realiza un procedimiento llamado MostrarAlmacenamientoUsuario que reciba el nombre de un usuario y devuelva el espacio que ocupan sus objetos agrupando por dispositivos y archivos:**

```
				Usuario: NombreUsuario

					Dispositivo:xxxx

						Archivo: xxxxxxx.xxx

								Tabla1......nnn K
								…
								TablaN......nnn K
								Indice1.....nnn K
								…
								IndiceN.....nnn K

						Total Espacio en Archivo xxxxxxx.xxx: nnnnn K

						Archivo:...
						…

				
					
					Total Espacio en Dispositivo xxxx: nnnnnn K

					Dispositivo: yyyy
					…

				Total Espacio Usuario en la BD: nnnnnnn K
```



## PostgreSQL

**7. Averigua si es posible establecer cuotas de uso sobre los tablespaces en PostgreSQL.**

Con los tablespaces de PostgreSQL, no hay manera de restringir los tamaños

[Explicación de tablespaces PostgreSQL](https://www.cybertec-postgresql.com/en/postgresql-tablespaces-its-not-so-scary/)


No hay un sistema nativo de quotas en PostgreSQL, pero hay algunas soluciones para esto

[Soluciones a las quotas en PostgreSQL](https://stackoverflow.com/questions/37822195/restrict-database-size)

## MySQL

**8. Averigua si existe el concepto de extensión (extent) en MySQL y si coincide con el existente en ORACLE.**

Sí, existe el concepto de extent, y básicamente coincide con el concepto de Oracle.

La única diferencia que podría anotar, sería más bien de nomenclatura. Con respecto a las pages en Mysql y los data blocks en Oracle, son prácticamente lo mismo, pero con distinto nombre.

En Oracle, un extent es un número específico de data blocks contiguos, y que se usan para almacenar un tipo específico de información 

En Mysql, un extent es una agrupación de pages (cada tablespace está compuesto por pages)

Los ficheros de un tablespace son llamados segments por InnoDB


Con respecto a InnoDB, es un storage engine:
>A database engine (or storage engine) is the underlying software component that a database management system (DBMS) uses to create, read, update and delete (CRUD) data from a database


[Explicación de data Blocks, extents, y segments en Oracle](https://docs.oracle.com/cd/A57673_01/DOC/server/doc/SCN73/ch3.htm)

[Explicación sobre el almacenamiento en MySQL](https://dev.mysql.com/doc/refman/8.0/en/innodb-file-space.html)

[Explicación de las pages en MySQL](https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_page)

## MongoDB

**9. Averigua si en MongoDB puede saberse el espacio disponible para almacenar nuevos documentos.**

En MongoDB, los datos se almacenan en forma de documentos (ficheros json), que a su vez, se agrupan en colecciones.

[Se pueden comprobar tamaño de las colecciones, almacenamiento usado en la base de datos...](https://docs.mongodb.com/manual/faq/storage/#faq-disk-size)

[Ver espacio usado en la base de datos...etc](https://stackoverflow.com/questions/9060860/how-to-check-the-available-free-space-in-mongodb)

# Alumno 4 (Ernesto Vázquez García):

## ORACLE:

**1. Crea un tablespace de undo e intenta crear una tabla en él.**

```
CREATE UNDO TABLESPACE TS1 DATAFILE 'tablespace1.dbf' SIZE 100M AUTOEXTEND ON;
ALTER USER ERNESTO QUOTA UNLIMITED ON TS1
```

Pruebas:

```
SQL> CREATE UNDO TABLESPACE TS1 DATAFILE 'tablespace1.dbf' SIZE 100M AUTOEXTEND ON;

Tablespace creado.
```

```
SQL> ALTER USER ERNESTO QUOTA UNLIMITED ON TS1;
ALTER USER ERNESTO QUOTA UNLIMITED ON TS1
*
ERROR en línea 1:
ORA-30041: No se puede otorgar cuota al tablespace
```

No se puede crear tablas en ella porque es una tabla de deshacer (ROLLBACK)

```
SQL> CREATE table tablaprueba
  2  (nombre varchar2(20))
  3  tablespace TS1;
CREATE table tablaprueba
*
ERROR en línea 1:
ORA-30022: No se pueden crear segmentos en un tablespace de deshacer
```

```
SQL> alter table clientes move tablespace TS1;
alter table clientes move tablespace TS1
            *
ERROR en línea 1:
ORA-30022: No se pueden crear segmentos en un tablespace de deshacer
```

![](https://i.imgur.com/BfYR36X.png)

![](https://i.imgur.com/IWciwLQ.png)

**2. Crea un tablespace temporal TEMP2 y escribe una sentencia SQL que genere un script que haga usar TEMP2 a todos los usuarios que tienen USERS como tablespace por defecto.**

```
CREATE TEMPORARY TABLESPACE TEMP2 TEMPFILE  'temp2.dbf' SIZE 100M;

SELECT 'ALTER USER ' || USERNAME || ' TEMPORARY TABLESPACE TEMP2;'
FROM DBA_USERS WHERE DEFAULT_TABLESPACE = 'USERS';
```

Pruebas:
```
26-01-2020 14:14:54 SYS@XE SQL> CREATE TEMPORARY TABLESPACE TEMP2 TEMPFILE  'temp2.dbf' SIZE 100M;

Tablespace created.
```

```
26-01-2020 14:27:44 SYS@XE SQL> SELECT 'ALTER USER ' || USERNAME || ' TEMPORARY TABLESPACE TEMP2;'
  2  FROM DBA_USERS WHERE DEFAULT_TABLESPACE = 'USERS';

'ALTERUSER'||USERNAME||'TEMPORARYTABLESPACETEMP2;'
---------------------------------------------------------------------
ALTER USER HR TEMPORARY TABLESPACE TEMP2;
ALTER USER SCOTT TEMPORARY TABLESPACE TEMP2;
```

![](https://i.imgur.com/OFCzb8T.png)

![](https://i.imgur.com/JmpIWk1.png)

**3. Borra todos los tablespaces creados para esta práctica sin que quede rastro de ellos. Realiza las acciones previas que sean necesarias.**

```
DROP TABLESPACE TS1 INCLUDING CONTENTS AND DATAFILES;
DROP TABLESPACE TEMP2 INCLUDING CONTENTS AND DATAFILES;
```

Pruebas:

```
26-01-2020 14:27:48 SYS@XE SQL> DROP TABLESPACE TS1 INCLUDING CONTENTS AND DATAFILES;

Tablespace dropped.

26-01-2020 14:36:23 SYS@XE SQL> DROP TABLESPACE TEMP2 INCLUDING CONTENTS AND DATAFILES;

Tablespace dropped.
```

![](https://i.imgur.com/58bbsyQ.png)

**4. Averigua los segmentos existentes para realizar un ROLLBACK y el tamaño de sus extensiones.**

`SELECT SEGMENT_NAME,INITIAL_EXTENT FROM DBA_ROLLBACK_SEGS;`

Pruebas:

```
26-01-2020 14:36:27 SYS@XE SQL> SELECT SEGMENT_NAME,INITIAL_EXTENT FROM DBA_ROLLBACK_SEGS;

SEGMENT_NAME           INITIAL_EXTENT
------------------------------ --------------
SYSTEM                         114688
_SYSSMU1_3789641169$           131072
_SYSSMU2_1827203912$           131072
_SYSSMU3_3346129149$           131072
_SYSSMU4_655887589$            131072
_SYSSMU5_3703078872$           131072
_SYSSMU6_725569783$            131072
_SYSSMU7_3583332791$           131072
_SYSSMU8_4175076471$           131072
_SYSSMU9_1317495879$           131072
_SYSSMU10_2569484742$          131072

11 rows selected.
```

![](https://i.imgur.com/K3Rckj4.png)

Con esta consulta podemos ver el nombre de los segmentos existentes y la extension inicial. En el caso de querer ver la información de dichas extensiones podemos hacerlo realizando una consulta a la tabla **DBA_EXTENTS**. Vamos a ver un ejemplo:

![](https://i.imgur.com/qv0Rrp9.png)


**5. Queremos cambiar de ubicación un tablespace, pero antes debemos avisar a los usuarios que tienen acceso de lectura o escritura a cualquiera de los objetos almacenados en el mismo. Escribe un procedimiento llamado MostrarUsuariosAccesoTS que obtenga un listado con los nombres de dichos usuarios.**

Vamos a crear un **procedimiento** muy útil para poder avisar a un usuario que se va a cambiar la **ubicación** del **tablespace** donde dicho usuario tiene acceso a **objetos** que están en ese tablespace en concreto.

```
CREATE OR REPLACE PROCEDURE MostrarUsuariosAccesoTS(v_tablespace VARCHAR2)
is
  cursor c_acceso
  is
  SELECT table_name
  FROM dba_tables
  WHERE tablespace_name=v_tablespace;
BEGIN
  for i IN c_acceso loop
    objetos(i.table_name);
  END loop;
END;
/

CREATE OR REPLACE PROCEDURE objetos(v_nombretablas VARCHAR2)
is
  cursor c_objetos
  is
  SELECT DISTINCT grantee
  FROM dba_tab_privs
  WHERE table_name=v_nombretablas
  AND PRIVILEGE='SELECT' OR PRIVILEGE='INSERT' OR PRIVILEGE='DROP';
BEGIN
  for i IN c_objetos LOOP
    DBMS_OUTPUT.PUT_LINE('Avisa al usuario: '||i.grantee);
  END loop;
END;
/
```

**6. Realiza un procedimiento llamado MostrarInfoTabla que reciba el nombre de una tabla y muestre la siguiente información sobre la misma: propietario, usuarios que pueden leer sus datos, usuarios que pueden cambiar (insertar, modificar o eliminar) sus datos, usuarios que pueden modificar su estructura, usuarios que pueden eliminarla, lista de extensiones y en qué fichero de datos se encuentran.**

```
CREATE OR REPLACE PROCEDURE MostrarPropietario(p_nombretabla VARCHAR2,
                                               p_Propietario VARCHAR2)
IS
BEGIN
    dbms_output.put_line('Propietario: '||p_Propietario);
END;
/

CREATE OR REPLACE PROCEDURE Mostrarusuarioslectura(p_nombretabla VARCHAR2,
                                                   p_Propietario VARCHAR2)
IS
    cursor c_usuarios is
    SELECT USERNAME
    FROM DBA_USERS 
    WHERE USERNAME IN (SELECT DISTINCT GRANTEE
                       FROM DBA_TAB_PRIVS
                       WHERE TABLE_NAME IN (SELECT TABLE_NAME
                                            FROM DBA_TABLES
                                            WHERE TABLE_NAME=p_nombretabla
                       						AND PRIVILEGE='SELECT'
                       						AND OWNER=p_Propietario));
BEGIN
    DBMS_OUTPUT.PUT_LINE(chr(9));
    DBMS_OUTPUT.PUT_LINE('Usuarios que pueden leer sus datos: ');
    for v_usuarios IN c_usuarios loop
		DBMS_OUTPUT.PUT_LINE(v_usuarios.USERNAME);
    END loop;
END;
/


CREATE OR REPLACE PROCEDURE MostartUsuariocambio(p_nombretabla VARCHAR2,
                                                 p_Propietario VARCHAR2)
IS
    cursor c_usuarios is
    SELECT USERNAME
    FROM DBA_USERS 
    WHERE USERNAME IN (SELECT DISTINCT GRANTEE
                       FROM DBA_TAB_PRIVS
                       WHERE TABLE_NAME IN (SELECT TABLE_NAME
                                            FROM DBA_TABLES
                                            WHERE TABLE_NAME=p_nombretabla
                        					AND (PRIVILEGE='INSERT' OR PRIVILEGE='UPDATE' OR PRIVILEGE='DELETE')
                        					AND OWNER=p_Propietario));
BEGIN
    DBMS_OUTPUT.PUT_LINE(chr(9));
    DBMS_OUTPUT.PUT_LINE('Usuarios que pueden cambiar (insertar, modificar o eliminar) sus datos: ');
    for v_usuarios IN c_usuarios loop
        DBMS_OUTPUT.PUT_LINE(v_usuarios.USERNAME);
    END loop;
END;
/


CREATE OR REPLACE PROCEDURE MostrarUsuariomodificar(p_nombretabla VARCHAR2,
                                                    p_Propietario VARCHAR2)
IS
    cursor c_usuarios is
    SELECT USERNAME
    FROM DBA_USERS 
    WHERE USERNAME IN (SELECT DISTINCT GRANTEE
                       FROM DBA_TAB_PRIVS
                       WHERE TABLE_NAME IN (SELECT TABLE_NAME
                                            FROM DBA_TABLES
                                            WHERE TABLE_NAME=p_nombretabla
                       						AND PRIVILEGE='ALTER'
                       						AND OWNER=p_Propietario));
BEGIN
    DBMS_OUTPUT.PUT_LINE(chr(9));
    DBMS_OUTPUT.PUT_LINE('Usuarios que pueden modificar su estructura: ');
    for v_usuarios IN c_usuarios loop
        DBMS_OUTPUT.PUT_LINE(v_usuarios.USERNAME);
    END loop;
END;
/

CREATE OR REPLACE PROCEDURE MostrarUsuarioeliminar(p_nombretabla VARCHAR2,
                                     	             p_Propietario VARCHAR2)
IS
    cursor c_usuarios is
    SELECT USERNAME
    FROM DBA_USERS 
    WHERE USERNAME IN (SELECT DISTINCT GRANTEE
                       FROM DBA_TAB_PRIVS
                       WHERE TABLE_NAME IN (SELECT TABLE_NAME
                                            FROM DBA_TABLES
                                            WHERE TABLE_NAME=p_nombretabla
                       						AND PRIVILEGE='DROP'
                       						AND OWNER=p_Propietario));
BEGIN
    DBMS_OUTPUT.PUT_LINE(chr(9));
    DBMS_OUTPUT.PUT_LINE('Usuarios que pueden eliminarla: ');
    for v_usuarios IN c_usuarios loop
        DBMS_OUTPUT.PUT_LINE(v_usuarios.USERNAME);
    END loop;
END;
/

CREATE OR REPLACE PROCEDURE MostrarListaExtension(p_nombretabla VARCHAR2,
                                                  p_Propietario VARCHAR2)
IS
    v_fichero VARCHAR2(50);
    cursor c_extensiones is
    SELECT seg.EXTENTS, ex.FILE_ID
    FROM DBA_SEGMENTS seg, DBA_EXTENTS ex
    WHERE seg.SEGMENT_NAME = ex.SEGMENT_NAME
    AND seg.SEGMENT_NAME=p_nombretabla
    AND seg.OWNER=p_Propietario;
BEGIN
    for v_Extension in c_extensiones loop
        v_fichero:=MostrarFichero(v_Extension.FILE_ID);
        DBMS_OUTPUT.PUT_LINE('Número extensión: ' || v_Extension.EXTENTS);
        DBMS_OUTPUT.PUT_LINE('Fichero: ' || v_fichero);
        DBMS_OUTPUT.PUT_LINE(chr(9));
    end loop;
END;
/

CREATE OR REPLACE FUNCTION MostrarFichero(p_FileID VARCHAR2)
RETURN VARCHAR2
IS
    v_nombrefichero VARCHAR2(40);
BEGIN
    SELECT FILE_NAME into v_nombrefichero
    FROM DBA_DATA_FILES 
    WHERE FILE_ID=p_FileID;
    return v_nombrefichero;
END;
/

CREATE OR REPLACE PROCEDURE MostrarInfoTabla(p_nombretabla VARCHAR2)
IS
   cursor c_Propietarios is
   SELECT DISTINCT OWNER
   FROM DBA_TABLES
   WHERE TABLE_NAME=p_nombretabla;
   v_propietario VARCHAR2(50);
BEGIN
   for v_propietario IN c_Propietarios loop
       MostrarPropietario(p_nombretabla, v_propietario.OWNER);
       Mostrarusuarioslectura(p_nombretabla, v_propietario.OWNER);
       MostartUsuariocambio(p_nombretabla, v_propietario.OWNER);
       MostrarUsuariomodificar(p_nombretabla, v_propietario.OWNER);
       MostrarUsuarioeliminar(p_nombretabla, v_propietario.OWNER);
       MostrarListaExtension(p_nombretabla, v_propietario.OWNER);
   END loop;
END;
/
```

## PostgreSQL:

**7. Averigua si pueden establecerse claúsulas de almacenamiento para las tablas o los espacios de tablas en Postgres.**

A diferencia de Oracle, Postgres no cuenta con claúsulas de almacenamiento para las tablas. Podemos usar la función de Postgres "pg_total_relation_size", para controlar el almacenamiento de una tabla.

Vamos a ver el ejemplo:

```
ernesto=> select pg_relation_size('clientes');
 pg_relation_size 
------------------
             8192
(1 row)

ernesto=> SELECT
ernesto->     pg_size_pretty (
ernesto(>         pg_total_relation_size ('clientes')
ernesto(>     );
 pg_size_pretty 
----------------
 24 kB
(1 row)


vagrant@postgres:~$ sudo su - postgres
postgres@postgres:~$ psql
psql (11.5 (Debian 11.5-1+deb10u1))
Type "help" for help.

postgres=# CREATE VIEW user_disk_usage AS SELECT r.rolname, SUM(pg_total_relation_size(c.oid)) AS total_disk_usage 
postgres-# FROM pg_class c, pg_roles r 
postgres-# WHERE c.relkind = 'r' 
postgres-# AND c.relowner = r.oid 
postgres-# GROUP BY c.relowner, r.rolname;
CREATE VIEW

postgres=# select * from user_disk_usage;
 rolname  | total_disk_usage 
----------+------------------
 postgres |          8290304
(1 row)
```

![](https://i.imgur.com/pU5PR3x.png)

## MySQL:

**8. Averigua si existe el concepto de índice en MySQL y si coincide con el existente en ORACLE. Explica los distintos tipos de índices existentes.**

#### Tipos de índices

- Parciales: 

    `CREATE INDEX ind_parcial ON Clientes (direccion(100))`


- Multicolumna: Este tipo de índices abarca más de una columna. Por ejemplo, nombre y apellidos.

    `CREATE INDEX ind_multicolumna ON Clientes (apellidos(100),nombre)`

- Secundarios o clusters: Normalmente, este índice es sinónimo de la clave primaria.

#### Estructura de índices

- Tipo **B-Tree**:

Su uso es adecuado para consultas basadas en operadores de comparación **(<,>, =, < >)** y rangos de valores **(between)**.

El índice también se puede usar LIKE para realizar comparaciones.

- Tipo **Hash**:

Se basan en el uso de una función de HASH. Este tipo de función, transforma una entrada en un valor único.

Se usan solo para comparaciones de igualdad que usan los operadores **=** o **<=>**.

Este tipo de índice no se puede utilizar para buscar la siguiente entrada en orden.

#### Algunos de los **modificadores** que podemos añadir a la creación de un índice:

- **UNIQUE:** índice formado por campos cuyo valor no puede repetirse.

- **PRIMARY:** Es el índice que conforma la clave primaria de una tabla.

- **full-text:** Es un tipo de índice 'especial' que se aplica a campos de texto de gran tamaño.

- **SPATIAL:** Son índices usados para tipos de datos espaciales como LINE o CURVE.


## MongoDB:

**9. Explica los distintos motores de almacenamiento que ofrece MongoDB, sus características principales y en qué casos es más recomendable utilizar cada uno de ellos.**

Vamos a ver los diferentes motores de almacenamiento de MongoDB.

**MMAP** y **WiredTiger** son los motores de almacenamiento estable. Siendo MMAP el predeterminado en la versión 3.0. 
A partir de la versión 3.2 WiredTiger se convierte en el motor predeterminado.

Por lo general, si su aplicación es de lectura pesada, use **MMAP**. Si su escritura es pesada, use **WiredTiger**. 

Vamos a ver los **tipos**:

- **Fusión-io:** Un motor de almacenamiento creado por **SanDisk** que hace posible omitir la capa del sistema de archivos del sistema operativo y escribir directamente en el dispositivo de almacenamiento.

- **En memoria:** Todos los datos se almacenan en la memoria (RAM) para una lectura / acceso más rápidos. 

- **MMAP:** MMAP es el motor de almacenamiento utilizado en versiones anteriores, mejora su rendimiento con el soporte de bloqueo a nivel de colección a partir de la versión 3.0. Asigna archivos a la memoria virtual y optimiza las llamadas de lectura.

  Una **desventaja** es que no se pueden procesar dos llamadas de escritura en paralelo para la misma colección.

- **Rocas mongo:** Un motor de valor-clave creado para integrarse con **RocksDB**. 

- **TokuMX:** Un motor de almacenamiento creado por Percona que utiliza índices de árboles fractales. 

- **WiredTiger:** WiredTiger es un motor de almacenamiento moderno diseñado para sacar el máximo rendimiento del hardware multi-core, y minimizar el acceso a disco gracias al uso de un formato de ficheros compacto y de la compresión de datos.

  Para activar **WiredTiger** se debe iniciar **MongoDB** usando la opción **storageEngine**:


        mongod —storageEngine wiredtiger


**Referencia**: [Blog sobre los motores de MongoDB](https://riptutorial.com/es/mongodb/topic/694/motores-de-almacenamiento-enchufables)

# Parte Grupal

## ORACLE:

**1. Cread un índice para la tabla EMP de SCOTT que agilice las consultas por nombre de empleado en un tablespace creado específicamente para índices. ¿Dónde deberiáis ubicar el fichero de datos asociado? ¿Cómo se os ocurre que podriáis probar si el índice resulta de utilidad?**

Tenemos que crear un **_tablespace_**, por lo que debemos elegir qué datafiles vamos a asociarle. Por defecto estos ficheros se guardan en el directorio **/opt/oracle/oradata/orcl/**, pero en función de la frecuencia con la que utilicemos este índice, podríamos guardarlo en un dispositivo de bloques con mayor velocidad de lectura, como por ejemplo en un SSD.
Vamos a suponer que tenemos un SSD (/dev/sdb), el cual formatearemos como _ext4_ y montaremos en **/opt/oracle/oradata/orcl/solido**.  

* Primero creamos el directorio y asignamos los permisos y propietario adecuados.

```
mkdir /opt/oracle/oradata/orcl/solido
chown oracle: /opt/oracle/oradata/orcl/solido
chmod 700 /opt/oracle/oradata/orcl/solido
```

* Creamos una **unidad de _systemd_** en **/ect/systemd/system/** para que se monte automáticamente al arrancar el sistema. Dicha unidad tendrá el siguiente contenido:

```
[Unit]
Description= SSD for Oracle indexes storaging purposes

[Mount]
What=/dev/disk/by-uuid/0be6966e-b527-43ef-b53d-38670b1499b4
Where=/opt/oracle/oradata/orcl/solido
Type=ext4
Options=defaults

[Install]
WantedBy=multi-user.target
```

Para el montado automático al inicio del sistema, habilitamos el servicio.

```
systemctl daemon-reload
systemctl start opt-oracle-oradata-orcl-solido.mount
systemctl enable opt-oracle-oradata-orcl-solido.mount
```

* Para crear el **_tablespace_**, ejecutamos la siguiente instrucción:

```
create tablespace indices
datafile 'tsi1.dbf'
size 10M
autoextend on;
```

* A continuación, creamos el **índice**:

```
CREATE INDEX nombres_empleados ON emp(ename)
      TABLESPACE indices;
```

>Para comprobar la utilidad de este índice, necesitaríamos que la tabla **_EMP_** tuviera muchos registros. De esta manera, veríamos un **aumento de rendimiento** en comparación a no tener un índice definido.  
>Esto se debe a que con los íncides, la búsqueda de un registro pasa de ser secuencial a ser una búsqueda dicotómica, donde en el peor de los casos el número máximo de iteraciones es **log2 n+1**.

***

**2. Realizad una consulta al diccionario de datos que muestre qué índices existen para objetos pertenecientes al esquema de SCOTT y sobre qué columnas están definidos. Averiguad en qué fichero o ficheros de datos se encuentran las extensiones de sus segmentos correspondientes.**

Vamos a realizar la **consulta** para mostrar los **índices** de la tabla **SCOTT.** 

```
select index_name, column_name,table_name, table_owner
from dba_ind_columns
where table_owner='SCOTT';
```

Para averiguar dónde estan los ficheros contenedores de las extensiones de los segementos, pertenecientes al esquema **_SCOTT_**, hemos realizado la siguiente consulta:

```
select FILE_NAME, TABLESPACE_NAME 
from dba_data_files
where tablespace_name=(select distinct tablespace_name 
                    from DBA_SEGMENTS 
                    where segment_type='INDEX'
                    and owner='SCOTT');
```

![](https://i.imgur.com/wPoX2vs.png)

***

**3. Cread una secuencia para rellenar el campo deptno de la tabla dept de forma coherente con los datos ya existentes. Insertad al menos dos registros haciendo uso de la secuencia.**

Creamos una **secuencia** que incremente el código deptno de la tabla scott.dept que incremente en *10* el código, empezando desde el número *50*

```
create sequence RellenarDeptNo
  start with 50
  increment by 10
  maxvalue 200
  nocycle;
```

![](https://i.imgur.com/Nplac5d.png)

***

**4. Queremos limpiar nuestro fichero tnsnames.ora. Averiguad cuáles de sus entradas se están usando en algún enlace de la base de datos**

Antes de poder limpiar entradas que no estén siendo usadas por el servidor en el fichero `tnsnames.ora`, tendremos que averiguar cuáles de ellas se están usando en los posibles enlaces activos que pueda haber.  

Para ello, usaremos el siguiente comando
```
SELECT * FROM DBA_DB_LINKS;
```
Cuyo output es el siguiente
```
OWNER
------------------------------
DB_LINK
--------------------------------------------------------------------------------
USERNAME
------------------------------
HOST
--------------------------------------------------------------------------------
CREATED
-------------------
SYSTEM
ENLACE1
SCOTT

OWNER
------------------------------
DB_LINK
--------------------------------------------------------------------------------
USERNAME
------------------------------
HOST
--------------------------------------------------------------------------------
CREATED
-------------------
tns1
2020/01/15 19:50:03
```
Podemos ver claramente que algún enlace está usando la entrada `tns1`, por lo tanto, esa es una de las que **no deberíamos borrar.**  
Si tuviéramos más conexiones descritas, las podríamos borrar sin temor a interrumpir algún enlace, porque no estaríamos borrando las que de verdad se estuvieran usando.

Llegado este momento de haber identificado la entrada que se está usando, limpiaremos las entradas que queramos en `tnsnames.ora` con:
```
sed -i '/nombreentrada /,/^ *$/d' tnsnames.ora
```
Donde he puesto `nombreentrada`, habría que reemplazar con el nombre de la entrada que quisiéramos borrar.  
Además, la ruta al fichero `tnsnames.ora` tendrá que apuntar directamente a donde tengamos localizado el fichero. En mi caso, me encontraba en el mismo directorio que el fichero, así que pude escribir sólamente el nombre.


[Documentación de DBA_DB_LINKS](https://ss64.com/orad/DBA_DB_LINKS.html)

[Pregunta en stack que hice para intentar resolver este apartado](https://dba.stackexchange.com/questions/258388/i-want-to-delete-connections-in-tnsnames-ora-i-need-to-figure-out-which-ones-ar)

*** 
     
**5. Meted las tablas EMP y DEPT de SCOTT en un cluster**

Primero vamos a crear un **tablespace** para posteriormente crear el **cluster**.
A continuación tendremos que crear un indice. Crearemos las tablas asociados al **cluster** que hemos creado previamente.


    CREATE TABLESPACE CLUSTERNAME DATAFILE '/opt/oracle/oradata/orcl/name.dbf' SIZE 10M AUTOEXTEND ON;

![](https://i.imgur.com/Hon0XKA.png)

```
CREATE CLUSTER tablasempdept
(DEPTNO NUMBER(2))
TABLESPACE CLUSTERNAME;
```

![](https://i.imgur.com/VBSnGuh.png)

```
CREATE INDEX INDEXNAME ON CLUSTER tablasempdept;
```

![](https://i.imgur.com/esRApo2.png)

```
CREATE TABLE SCOTT.DEPT1
(
 DEPTNO NUMBER(2),
 DNAME VARCHAR2(14),
 LOC VARCHAR2(13),
 CONSTRAINT PK_DEPT1 PRIMARY KEY (DEPTNO))
 CLUSTER tablasempdept (DEPTNO);
```

![](https://i.imgur.com/Zh8UKlM.png)

```
CREATE TABLE SCOTT.EMP1
(
 EMPNO NUMBER(4),
 ENAME VARCHAR2(10),
 JOB VARCHAR2(9),
 MGR NUMBER(4),
 HIREDATE DATE,
 SAL NUMBER(7, 2),
 COMM NUMBER(7, 2),
 DEPTNO NUMBER(2),
 CONSTRAINT FK_DEPTNO1 FOREIGN KEY (DEPTNO) REFERENCES SCOTT.DEPT1 (DEPTNO),
 CONSTRAINT PK_EMP1 PRIMARY KEY (EMPNO)
)
 CLUSTER tablasempdept (DEPTNO);
```

![](https://i.imgur.com/Ohq4z26.png)

```
SELECT CLUSTER_NAME FROM [USER_CLUSTERS/ALL_CLUSTERS/DBA_CLUSTERS];
```

![](https://i.imgur.com/iMfCrHa.png)

Referencias: [Documentación oficial de Johnny Oracle](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/CREATE-CLUSTER.html#GUID-4DBC701F-AFC3-486D-AA32-B5CB1D6946F7)

***

**6. Realizad un procedimiento llamado BalanceoCargaTemp que balancee la carga de usuarios entre los tablespaces temporales existentes. Para ello averiguará cuántos existen y asignará los usuarios entre ellos de forma equilibrada. Si es necesario para comprobar su funcionamiento, crea tablespaces temporales nuevos**

* **Consulta de usuarios y tablespaces:**

Consulta para ver el reparto de bloques y los usuario que estan asignados al tablespace temporal:

```
select distinct u.username, u.temporary_tablespace
from dba_users u, v$TEMP_SPACE_HEADER t
where u.account_status = 'OPEN'
and u.temporary_tablespace = t.tablespace_name;
```

* **Tablespaces temporales:**

Vamos a crear tantos **tablespaces temporales** como necesitemos para realizar una correcta comprobación del procedimiento.

```
CREATE TEMPORARY TABLESPACE temp1
TEMPFILE 'temp1'
SIZE 30M
AUTOEXTEND ON;
```

* **Procedimiento**:

En este procedimiento hemos tenido en cuenta **dos escenarios** distintos; uno en el que existen más usuarios que espacios de tablas temporales y viceversa.
* _ContarUsuarios_ - _ContarTablespaces_
    - Comparamos el número de usuarios con el número de espacios de tablas temporales y en función del resultado ejecutamos uno de los dos procedimientos que veremos a continuación.
*  _BalancearCargaTablespaces_
    - Ejecutaríamos este procedimiento en el caso de que hubiésen más espacios de tablas temporales que usuarios. Realiza un bucle en base a los _tablespaces_, de tal forma que va recorriendo los dos cursores (uno con los usuarios activos y otro con los _tablespaces_) en paralelo, y cada vez que se termina el cursor de los usuarios, lo reinicia.
* _BalancearCargaUsuarios_
    - Funciona de la misma forma que **BalancearCargaTablespaces** solo que el bucle lo realiza en base a los usuarios, reiniciando cada vez el cursor de los _tablespaces_.
* _AsignarUsuarioTS_
    - Simplemente ejecuta una instrucción de **alter user** para asociar al usuario con el _tablespace_ correspondiente.

```
CREATE or REPLACE PROCEDURE AsignarUsuarioTS (p_usuario dba_users.username%type,
                                              p_tablespace dba_tablespaces.tablespace_name%type)
is
begin
    execute immediate 'alter user ' || p_usuario || ' temporary tablespace ' || p_tablespace;
end AsignarUsuarioTS;
/

CREATE or REPLACE PROCEDURE BalancearCargaTablespaces
is
	cursor c_users
	is
	select distinct u.username
    from dba_users u, v$TEMP_SPACE_HEADER t
    where u.account_status = 'OPEN'
    and u.temporary_tablespace = t.tablespace_name;
    cursor c_tmts
    is
    SELECT tablespace_name
    FROM dba_tablespaces
    WHERE contents = 'TEMPORARY'
    and lower(status) = 'online';
    v_usuarios c_users%rowtype;
BEGIN
    open c_users;
    for v_tablespace in c_tmts loop
        fetch c_users into v_usuarios;
        AsignarUsuarioTS (v_usuarios.username, v_tablespace.tablespace_name);
        if c_tmts%NOTFOUND then
            close c_users;
            open c_users;
        end if;
    end loop;
end BalancearCargaTablespaces;
/

CREATE or REPLACE PROCEDURE BalancearCargaUsuarios
is
	cursor c_users is
	select distinct u.username
    from dba_users u, v$TEMP_SPACE_HEADER t
    where u.account_status = 'OPEN'
    and u.temporary_tablespace = t.tablespace_name;
    cursor c_tmts
    is
    SELECT tablespace_name
    FROM dba_tablespaces
    WHERE contents = 'TEMPORARY'
    and lower(status) = 'online';
    v_tablespace c_tmts%rowtype;
BEGIN
    open c_tmts;
    for v_usuarios in c_users loop
        fetch c_tmts into v_tablespace;
        AsignarUsuarioTS (v_usuarios.username, v_tablespace.tablespace_name);
        if c_tmts%NOTFOUND then
            close c_tmts;
            open c_tmts;
        end if;
    end loop;
end BalancearCargaUsuarios;
/

CREATE or REPLACE FUNCTION ContarUsuarios
return number
is
    v_numusers     number;
begin
    select count(u.username) into v_numusers
    from dba_users u, v$TEMP_SPACE_HEADER t
    where u.account_status = 'OPEN'
    and u.temporary_tablespace = t.tablespace_name;
    return v_numusers;
end ContarUsuarios;
/

CREATE or REPLACE FUNCTION ContarTablespaces
return number
is
    v_numts     number;
begin
    SELECT count(tablespace_name) into v_numts
    FROM dba_tablespaces
    WHERE contents = 'TEMPORARY'
    and lower(status) = 'online';
    return v_numts;
end ContarTablespaces;
/

CREATE or REPLACE PROCEDURE BalanceoCargaTemp
is
begin
    if ContarTablespaces > ContarUsuarios then
        
        BalancearCargaTablespaces;
    else
        BalancearCargaUsuarios;
    end if;
end BalanceoCargaTemp;
/
```

* **Comprobaciones**:

Hemos creado algunos tablespaces temporales para realizar la prueba y esta es la salida del procedimiento:

```
SQL> select distinct u.username, u.temporary_tablespace
  2  from dba_users u, v$TEMP_SPACE_HEADER t
  3  where u.account_status = 'OPEN'
  4  and u.temporary_tablespace = t.tablespace_name;

USERNAME                       TEMPORARY_TABLESPACE
------------------------------ ------------------------------
DBSNMP                         TEMP2
JUAN                           TEMP1
BECARIO                        TEMP1
AYUDANTE                       TEMP
JUANDI                         TEMP1
SYS                            TEMP
SCOTT                          TEMP
PRUEBA                         TEMP2
SYSTEM                         TEMP2
SYSMAN                         TEMP2

10 filas seleccionadas.
```

![](https://i.imgur.com/Lk3Pn8I.png)

Como vemos se ha realizado correctamente el reparto de usuarios en dichos tablespaces.

***

**7. Realizad un pequeño artículo o una entrada para un blog técnico explicando las limitaciones que presentan MySQL y Postgres para gestionar el almacenamiento de los datos respecto a ORACLE, si es que presentan alguna.**

Entrada del blog técnico: [Diferencias entre MySQL y PostgreSQL respecto a Oracle para gestionar el almacenamiento](https://ernestovazquez.es/post/almacenamientobbdd)

***

**8. Explicad en qué consiste el sharding en MongoDB.**

Es método que permite distribuir datos a través de **múltiples máquinas.** Se emplea para arquitecturas y aplicaciones consolidadas, cuando el tamaño de la base de datos y el volumen de operaciones crece demasiado para mantenerlo en una sola máquina (CPU y RAM). En resumen el **_sharding_** ofrece las siguientes **ventajas**:

* División de la carga _lectura_/_escritura_
* Alta disponibilidad
* Aumento de la capacidad de almacenamiento

El esquema de conexión y distribución de los documentos sería el siguiente.

![](https://docs.mongodb.com/manual/_images/sharded-cluster-mixed.bakedsvg.svg)

Tenemos dos **_shards_** dentro de un cluster, y estos se encargan de distribuir los documentos a través de un controlador que los muestra al usuario final.
Mongo afronta la distribución de los documentos mediante dos estrategias.

* Hashed Sharding

![](https://docs.mongodb.com/manual/_images/sharding-hash-based.bakedsvg.svg)

* Ranged Sharding

![](https://docs.mongodb.com/manual/_images/sharding-range-based.bakedsvg.svg)

La **diferencia** entre una y otra es que la primera utiliza una función de **_hash_** sobre las posiciones de los [chunk](https://docs.mongodb.com/manual/reference/glossary/#term-chunk) para, posteriormente organizar el espacio asignado a las [shard keys](https://docs.mongodb.com/manual/reference/glossary/#term-shard-key), que son las encargadas de localizar los documentos distribuidos.

Referencias: [Documentación oficial de MongoDB](https://docs.mongodb.com/manual/sharding/)
***

**9. Resolved el siguiente caso práctico en ORACLE:**

**- En nuestra empresa existen tres departamentos: Informática, Ventas y Producción. En Informática trabajan tres personas: Pepe, Juan y Clara. En Ventas trabajan Ana y Eva y en Producción Jaime y Lidia.**

**a) Pepe es el administrador de la base de datos. Juan y Clara son los programadores de la base de datos, que trabajan tanto en la aplicación que usa el departamento de Ventas como en la usada por el departamento de Producción. Ana y Eva tienen permisos para insertar, modificar y borrar registros en las tablas de la aplicación de Ventas que tienes que crear, y se llaman Productos y Ventas, siendo propiedad de Ana. Jaime y Lidia pueden leer la información de esas tablas pero no pueden modificar la información. Crea los usuarios y dale los roles y permisos que creas conveniente.** 

```
create user Pepe identified by Pepe;
grant dba to Pepe;

create user Juan identified by Juan;
create user Clara identified by Clara;
grant resource to Juan;
grant resource to Clara;

create user Ana identified by Ana;
create user Eva identified by Eva;
grant select on Ana.Ventas to Eva;
grant insert on Ana.Ventas to Eva;
grant update on Ana.Ventas to Eva;
grant delete on Ana.Ventas to Eva;
grant select on Ana.Productos to Eva;
grant insert on Ana.Productos to Eva;
grant update on Ana.Productos to Eva;
grant delete on Ana.Productos to Eva;

create user Jaime identified by Jaime;
create user Lidia identified by Lidia;
grant select on Ana.Ventas to Jaime;
grant select on Ana.Ventas to Lidia;
grant select on Ana.Productos to Jaime;
grant select on Ana.Productos to Lidia;
```

Procedemos a crear un **rol** para **mayor eficiencia** a la hora de gestionar los permisos y privilegios de los usuarios de los distintos departamentos.

- Rol Producción

```
CREATE ROLE Produccion;
GRANT select on Ana.Ventas to Produccion;
GRANT select on Ana.Productos to Produccion;

GRANT Produccion to Lidia;
GRANT Produccion to Jaime;
```

- Rol Ventas

```
CREATE ROLE Ventas;
GRANT select, insert, update, delete on Ana.Ventas to Ventas;
GRANT select, insert, update, delete on Ana.Productos to Ventas;
GRANT Ventas to Eva;
```

**b) Los espacios de tablas son System, Producción (ficheros prod1.dbf y prod2.dbf) y Ventas (fichero vent.dbf). Los programadores del departamento de Informática pueden crear objetos en cualquier tablespace de la base de datos, excepto en System. Los demás usuarios solo podrán crear objetos en su tablespace correspondiente teniendo un límite de espacio de 30 M los del departamento de Ventas y 100K los del de Producción. Pepe tiene cuota ilimitada en todos los espacios, aunque el suyo por defecto es System.**

Vamos a crear los **tablespace** de *system*, *produccion* y *ventas*.

```
CREATE TABLESPACE ts_produccion
DATAFILE 'prod1.dbf' SIZE 100M, 
'prod2.dbf' SIZE 100M AUTOEXTEND ON;

CREATE TABLESPACE ts_venta 
DATAFILE 'vent.dbf' 
SIZE 100M AUTOEXTEND ON;
```

Asignamos las **cuotas** de los tablespaces a los usuarios

```
ALTER USER ANA QUOTA 30M ON ts_venta;
ALTER USER EVA QUOTA 30M ON ts_venta;
ALTER USER JAIME QUOTA 100K ON ts_produccion;
ALTER USER LIDIA QUOTA 100K ON ts_produccion;
```

Vamos a modificar el **tablespace** que tiene el usuario Pepe para que esté en el tablespace **system**: 

Este **tablespace** inicial se llama por defecto **SYSTEM**. Es una pieza clave para un buen funcionamiento de la base de datos ya que en él residen todos los objetos de los usuarios SYS y SYSTEM.

```
ALTER USER Pepe DEFAULT TABLESPACE SYSTEM;
GRANT UNLIMITED TABLESPACE TO Pepe;
```

Para **revocar** los **privilegios** de creación de objetos a un **usuario** sobre un _tablespace_ concreto, debemos asignarle una cuota igual a cero.

> **Revoking User Ability to Create Objects in a Tablespace**
> 
> You can revoke the ability of a user to create objects in a tablespace by changing the current quota of the user to zero. After a quota of zero is assigned, the user's objects in the tablespace remain, but new objects cannot be created and existing objects cannot be allocated any new space.

**Referencia**: [Administración de permisos en Oracle](https://docs.oracle.com/cd/B19306_01/network.102/b14266/admusers.htm#i1006856)

```
GRANT UNLIMITED TABLESPACE TO JUAN;
GRANT UNLIMITED TABLESPACE TO CLARA;
ALTER USER JUAN QUOTA 0 ON SYSTEM;
ALTER USER CLARA QUOTA 0 ON SYSTEM;
```

**c) Pepe quiere crear una tabla Prueba que ocupe inicialmente 256K en el tablespace Ventas.**

Creamos una tabla que pertenezca a Pepe, con los parámetros **tablespace** y **storage (initial 256K)**.

```
CREATE TABLE PEPE.PRUEBA (
Codigo    VARCHAR2(5),
Nombre    VARCHAR2(30),
CONSTRAINT pk_codigo PRIMARY KEY(Codigo),
TABLESPACE Ventas,
STORAGE ( INITIAL 256K)
);
```

**d) Pepe decide que los programadores tengan acceso a la tabla Prueba antes creada y puedan ceder ese derecho y el de conectarse a la base de datos a los usuarios que ellos quieran.**

```
GRANT SELECT ON PEPE.PRUEBA TO Juan WITH GRANT OPTION;
GRANT SELECT ON PEPE.PRUEBA TO Clara WITH GRANT OPTION;
GRANT CONNECT TO Clara WITH ADMIN OPTION;
GRANT CONNECT TO Juan WITH ADMIN OPTION;
```

**e) Lidia y Jaime dejan la empresa, borra los usuarios y el espacio de tablas correspondiente, detalla los pasos necesarios para que no quede rastro del espacio de tablas.**

Primero vamos a borrar los usuarios que dejan la empresa:

```
DROP USER LIDIA cascade;
DROP USER JAIME cascade;
```

Usamos el siguiente comando, para borrar todo lo incluido en dicho tablespace.

```
drop tablespace ts_produccion including contents and datafiles; 
```
