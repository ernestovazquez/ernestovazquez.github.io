---
title: "Diferencias entre MySQL y PostgreSQL para gestionar el almacenamiento"
author: Ernesto Vázquez García
date: 2020-01-22 00:00:00 +0800
categories: [Bases de datos]
tags: [MySQL, PostgreSQL]
---

Realizaremos un pequeño artículo o una entrada para un blog técnico explicando las limitaciones que presentan MySQL y Postgres para gestionar el almacenamiento de los datos respecto a ORACLE, si es que presentan alguna.

***

En esta entrada vamos a ver las limitaciones que presentan MySQL y PostgreSQL respecto a ORACLE en la gestión de almacenamiento.

## MySQL

Mysql utiliza el sistema de almacenamiento mediante **tablespaces**.
Motores de almacenamiento: InnoDB y NDB. Estos respecto a Oracle tienen más limitaciones en cuanto a la gestión de almacenamiento.

Vamos a ver la sintaxis a la hora de crear un **tablespace**, ya que tiene gran similitud a **Oracle**.

- InnoDB:

```
CREATE TABLESPACE tablespace_name
    [ADD DATAFILE 'file_name']
    [FILE_BLOCK_SIZE = value]
    [ENCRYPTION [=] {'Y' | 'N'}]
    [ENGINE [=] InnoDB];
```

- NDB:

Primero debemos crear un **logfile**, ya que es necesario para crear el **tablespace**.

```
CREATE LOGFILE GROUP logfile_group;
```

Ya podemos crear el **tablespace**. (Entre corchetes vamos a poner los parámetros opcionales)

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

La principal diferencia con Oracle se puede encontrar a la hora de asignarle una cuota de almacenamiento ya que con el motor **InnoDB**, no es posible.

Tampoco contamos con todas las cláusulas de almacenamiento, que si tenemos en Oracle.

## PostgreSQL

PostgreSQL es un gestor de base de datos que no tiene cláusula de almacenamiento, como si lo tienen Oracle y MySQL.

Con la función, **pg_total_relation_size**, podemos controlar el almacenamiento que tiene la tabla.

Vamos a ver una vista, que aplica la función nombrada anteriormente.

```
CREATE VIEW user_disk_usage AS SELECT r.rolname, SUM(pg_total_relation_size(c.oid)) AS total_disk_usage 
FROM pg_class c, pg_roles r 
WHERE c.relkind = 'r' 
AND c.relowner = r.oid 
GROUP BY c.relowner, r.rolname;

postgres=# select * from user_disk_usage;
 rolname  | total_disk_usage 
----------+------------------
 postgres |          8290304
(1 row)
```

![](https://i.imgur.com/jkf7iax.png)


## Conclusión

Con este estudio que acabamos de hacer, nos hemos dado cuenta que cada gestor tiene sus diferencias. 

En **MySQL**, te permite tener cláusula de almacenamiento pero no se le puede asignar cuotas, a la hora de crear un **tablespace**. Mientras que en **PostgreSQL** no es posible crear cláusulas de almacenamiento.

Ambos gestores están limitados respecto a **ORACLE**.
