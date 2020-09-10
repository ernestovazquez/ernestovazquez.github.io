---
title: "Auditorías en bases de datos"
author: Ernesto Vázquez García
date: 2020-02-16 00:00:00 +0800
categories: [Bases de datos]
tags: [Oracle, PostgreSQL, MySQL]
---

## Realiza y documenta adecuadamente las siguientes operaciones:

<div id='id1' />

### 1. Activa desde SQL*Plus la auditoría de los intentos de acceso fallidos al sistema. Comprueba su funcionamiento.

Para activar la **auditoría de los intentos de acceso fallidos** primero tenemos que ver los parámetros de auditoría:

<pre>
  <code>
05-02-2020 17:42:51 SYS@XE SQL> SHOW PARAMETER AUDIT

NAME				     TYPE	 VALUE
------------------------------------ ----------- ------------------------------
audit_file_dest 		     string	 /u01/app/oracle/admin/XE/adump
audit_syslog_level		     string
audit_sys_operations		     boolean	 FALSE
audit_trail			     string	 NONE
05-02-2020 17:46:55 SYS@XE SQL> 
  </code>
</pre>

![](https://i.imgur.com/glAcmhq.png)

Vamos a activar **audit_tail:**

```
05-02-2020 17:46:55 SYS@XE SQL> ALTER SYSTEM SET audit_trail=db scope=spfile;
```

![](https://i.imgur.com/8NSgC5Y.png)

Vamos a ejecutar los **cambios**:
Tedremos que **reiniciar** para que se ejecuten estos cambios.

![](https://i.imgur.com/lAQOaYl.png)

A continuación vamos a **activar la auditoría**:

```
2020/02/05 17:58:33 SYS@XE SQL> AUDIT CREATE SESSION WHENEVER NOT SUCCESSFUL;

Audit succeeded.
```

![](https://i.imgur.com/Qi3SdqA.png)


Tengo que añadir, que no se puede crear para el usuario **SYS.**

![](https://i.imgur.com/Ur0Ux7w.png)


Podemos ver las auditorías que están activas con el siguiente comando:

```
2020/02/05 18:00:16 SYS@XE SQL> SELECT * FROM dba_priv_audit_opts;

USER_NAME		       PROXY_NAME
------------------------------ ------------------------------
PRIVILEGE				 SUCCESS    FAILURE
---------------------------------------- ---------- ----------

CREATE SESSION				 BY ACCESS  BY ACCESS
```

Como podemos ver está la que hemos creado previamente.

***Ejemplo de accesos fallidos:***

![](https://i.imgur.com/L6xMqLf.png)

```
05-02-2020 18:14:16 SYS@XE SQL> SELECT os_username, username, extended_timestamp, action_name, returncode
  2  FROM dba_audit_session;
```

![](https://i.imgur.com/lbdtaOL.png)

Una vez terminados se puede **desactivar** con el siguiente comando:

```
05-02-2020 18:16:15 SYS@XE SQL> NOAUDIT CREATE SESSION WHENEVER NOT SUCCESSFUL;

Noaudit succeeded.
```

![](https://i.imgur.com/okmzMyI.png)

### 2. Realiza un procedimiento en PL/SQL que te muestre los accesos fallidos junto con el motivo de los mismos, transformando el código de error almacenado en un mensaje de texto comprensible.

```
CREATE OR REPLACE FUNCTION Mostrarfallos(p_fallo NUMBER)
RETURN VARCHAR2
IS
fallos VARCHAR2(25);
BEGIN
    CASE p_fallo
        WHEN 1017 THEN 
            fallos:='Contraseña incorrecta';
        WHEN 28000 THEN
            fallos:='Cuenta bloqueada';
        ELSE
            fallos:='Error desconocido';
    END CASE;
RETURN fallos;
END;
/

CREATE OR REPLACE PROCEDURE MostrarAccesos
IS
    CURSOR c_pruebaacceso
    IS 
    SELECT username, returncode, timestamp
    FROM dba_audit_session 
    WHERE action_name='LOGON' 
    AND returncode != 0 
    ORDER BY timestamp;
    v_motivo VARCHAR2(25);
BEGIN
    FOR prueba IN c_pruebaacceso LOOP
        v_motivo:=Mostrarfallos(prueba.returncode);
        DBMS_OUTPUT.PUT_LINE('Usuario: '||prueba.username||CHR(9)||CHR(9)|| 'Fecha: '||
            prueba.timestamp||CHR(9)|| 'Motivo: '||v_motivo);
    END LOOP; 
END;
/
```

![](https://i.imgur.com/BPTonki.png)

![](https://i.imgur.com/coG3NJE.png)

    EXEC MostrarAccesos;

![](https://i.imgur.com/98csXBu.png)

### 3. Activa la auditoría de las operaciones DML realizadas por SCOTT. Comprueba su funcionamiento.

```
05-02-2020 18:18:46 SYS@XE SQL> AUDIT INSERT TABLE, UPDATE TABLE, DELETE TABLE BY SCOTT BY ACCESS;

Audit succeeded.
```
![](https://i.imgur.com/sEgVI93.png)

Consulta las modificaciones y acciones que hemos realizado:

```
05-02-2020 18:34:35 SYS@XE SQL> select OS_USERNAME, username, action_name, timestamp
  2  from dba_audit_object
  3  where username='SCOTT';
```

![](https://i.imgur.com/RS4BYAg.png)

### 4. Realiza una auditoría de grano fino para almacenar información sobre la inserción de empleados del departamento 10 en la tabla emp de scott.

Lo primero que tenemos que hacer es crear el **procedimiento** para controlar la inserción de los empleados del departamento:

```
BEGIN
    DBMS_FGA.ADD_POLICY (
        object_schema      =>  'SCOTT',
        object_name        =>  'EMP',
        policy_name        =>  'policy1',
        audit_condition    =>  'DEPTNO = 10',
        statement_types    =>  'INSERT'
    );
END;
/
```
![](https://i.imgur.com/iHS7SkG.png)

```
SELECT object_schema, object_name, policy_name, policy_text
FROM dba_audit_policies;
```

![](https://i.imgur.com/527LSG8.png)

Referencia: [Documentación oficial de Oracle](https://docs.oracle.com/database/121/ARPLS/d_fga.htm#ARPLS225)

> Esta opción la he tenido que hacer en una máquina con Oracle 12, a partir de esta versión se implementó.

### 5. Explica la diferencia entre auditar una operación by access o by session.

**By access**, nos almacena todas las acciones y nos crea un registro por cada sentencia auditada. Oracle recomienda usar esta opción.

**By session**, nos almacena las sentencias en un registro por cada sesión iniciada.

Vamos a ver un ejemplo de los dos:

***By access***:

```
SQL> SELECT owner, obj_name, action_name, timestamp, priv_used
  2  FROM dba_audit_object
  3  WHERE username='SYSTEM';
```

![](https://i.imgur.com/qQ5BHrV.png)

***By session:***

```
SQL> select obj_name, action_name, timestamp
  2  from dba_audit_object
  3  where username='SCOTT';
```

![](https://i.imgur.com/coFLQ2x.png)

### 6. Documenta las diferencias entre los valores db y db, extended del parámetro audit_trail de ORACLE. Demuéstralas poniendo un ejemplo de la información sobre una operación concreta recopilada con cada uno de ellos.

Vamos a ver las principales diferencias entre **db y db, extended** con el parámetro **audit_trail.**

- db: Activa la auditoría y los datos se almacenan en la tabla `SYS.AUD$`.

- db, extended: Aparte de almacenar los datos en la tabla `SYS.AUD$`, este escribirá los valores en las columnas `SQLBIND` y `SQLTEXT` de la misma tabla; `SYS.AUD$`.

Referencia: [Documentación oficial de Oracle](https://docs.oracle.com/cd/B19306_01/server.102/b14237/initparams016.htm)

Vamos a ver un ***ejemplo***:

Primero vamos a ver el estado de **audit_trail:**

    SQL> show parameter audit;

![](https://i.imgur.com/McnqzDH.png)

Activaremos **db, extended** con el siguiente comando.

    SQL> ALTER SYSTEM SET audit_trail = DB,EXTENDED SCOPE=SPFILE;
    
![](https://i.imgur.com/Pk008NH.png)

Reiniciamos para que se ejecute los cambios:

![](https://i.imgur.com/H8Hl03M.png)

Como podemos apreciar ya hemos activado el valor al parámetro **audit_trail.**

### 7. Localiza en Enterprise Manager las posibilidades para realizar una auditoría e intenta repetir con dicha herramienta los apartados 1, 3 y 4.

Vamos a iniciar **Enterprise Manager 12c**:

![](https://i.imgur.com/RLdYjyu.png)

![](https://i.imgur.com/JbDL3O7.png)

Solo he podido encontrar lo siguiente, acerca de las auditorías en esta versión.

![](https://i.imgur.com/za5qzvK.png)

Esto es lo unico que se puede ver en **Oracle Enterprise Manager 12c**, como se puede apreciar está muy limitado a la hora de gestionar auditorías o parámetros de configuración

Voy a intentar realizar las mismas pruebas con **Oracle Enterprise Manager 11g**:

Con está versión se puede realizar una auditoría si navegamos a través de las siguientes pestañas:

```
- Sevidor
    - Seguridad
        - Valores de Auditoría
```

![](https://i.imgur.com/v6H2GLo.png)

* **Valores de Auditoría**:

En la ventana de **Valores de Auditoría** podremos ver **Pistas de Auditoría de Base de Datos**, aquí tendremos las ***Conexiones Fallidas Auditadas,*** (donde veremos las conexiones fallidas que tiene la base de datos, al igual que hemos visto en el [Ejercicio 1](#id1)), ***Privilegios Auditados y Objetos auditados.***

![](https://i.imgur.com/4e1Q2pv.png)

* **Conexiones Fallidas Auditadas**:

Aqui podremos encontrar las conexiones fallidas que tenemos en nuestra base de datos:

![](https://i.imgur.com/WbRdI73.png)

Vamos a realizar unas pruebas de inicio de sesión:
![](https://i.imgur.com/kRkHcdx.png)

Como podemos apreciar aparecen las nuevas pruebas que acabamos de realizar correctamente.

* **Objetos Auditados**:

Al igual que antes, aquí podremos encontrar los objetos auditados

![](https://i.imgur.com/mJeP0Nr.png)

### 8. Averigua si en Postgres se pueden realizar los apartados 1, 3 y 4. Si es así, documenta el proceso adecuadamente.

Leyendo la **documentación** de **PostgreSQL**, he podido leer que no se pueden realizar igual que en Oracle, la forma de hacerlo es mediante  funciones y procedimientos

**Referencia:** [Auditoria de tablas en PostgreSQL](https://usuarioperu.com/2018/07/23/auditoria-de-tablas-en-postgresql-i/)

### 9. Averigua si en MySQL se pueden realizar los apartados 1, 3 y 4. Si es así, documenta el proceso adecuadamente.

Creamos la base de datos y añadimos una tabla.

```
MariaDB [(none)]> create database prueba;
Query OK, 1 row affected (0.001 sec)

MariaDB [(none)]> use prueba;
Database changed

MariaDB [prueba]> create table clientes(
    -> dni varchar(9),
    -> nombre varchar(15),
    -> apellido varchar(50),
    -> telefono varchar(9),
    -> constraint pk_dni primary key (dni));
Query OK, 0 rows affected, 1 warning (0.012 sec)
```

Creamos la **base de datos auditorias**:

```
MariaDB [prueba]> create database auditorias;
Query OK, 1 row affected (0.001 sec)

MariaDB [prueba]> use auditorias
Database changed

MariaDB [auditorias]> 
```

Tabla para almacenar la salida del trigger:

```
CREATE TABLE accesos
 (
   codigo int(11) NOT NULL AUTO_INCREMENT,
   usuario varchar(100),
   fecha datetime,
   PRIMARY KEY (`codigo`)
 )
 ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;
```

![](https://i.imgur.com/FZZcdI5.png)

```
delimiter $$
CREATE TRIGGER prueba.ernesto
BEFORE INSERT ON prueba.clientes
FOR EACH ROW
BEGIN
INSERT INTO auditorias.accesos (usuario, fecha)
values (CURRENT_USER(), NOW());
END$$
```

![](https://i.imgur.com/svES6oj.png)

Entramos a la base de datos **prueba** y añadimos un nuevo registro a la tabla **clientes.**

```
MariaDB [(none)]> use prueba
MariaDB [prueba]> insert into clientes
    -> values ('47426968X','Ernesto','Vazquez Garcia','640514267');
```

Ahora vamos a ver si ha realizado bien el triger mirando la tabla **accesos.**

```
MariaDB [(none)]> use auditorias
MariaDB [auditorias]> select * from accesos;
```

![](https://i.imgur.com/bkkWSZq.png)

Como podemos apreciar en la imagen, se ha creado correctamente el nuevo registro en la tabla accesos. Esta es la forma de **auditar en MySQL.** Es algo distinto a **Oracle** pero se puede tener algo parecido con este **trigger**.

### 10. Averigua las posibilidades que ofrece MongoDB para auditar los cambios que va sufriendo un documento.

MongoDB si nos permite realizar ciertas auditorías para ver los permitidos pondremos el siguiente comando:

    --auditFilter

Vamos a ver un ***ejemplo***:

Con la siguiente sentencia solamente audita las acciones **createCollection** y **dropCollection**:

    { atype: { $in: [ "createCollection", "dropCollection" ] } }

Podremos el filtro entre comillas simples para pasar el documento como una cadena.

    mongod --dbpath data/db --auditDestination file --auditFilter '{ atype: { $in: [ "createCollection", "dropCollection" ] } }' --auditFormat BSON --auditPath data/db/auditLog.bson

Referencia: [Documentación oficial de MongoDB.](https://docs.mongodb.com/manual/tutorial/configure-audit-filters/)

### 11. Averigua si en MongoDB se pueden auditar los accesos al sistema.

Si, leyendo la documentacion de MongoDB, he llegado a la conclusión que es algo parecido a lo realizado anteriormente, solamente tendremos que cambiar los parametros:

    { atype: "authenticate", "param.db": "test" }

Al igual que antes podemos usarlo como una cadena, si lo ponemos entre comillas simples.

    mongod --dbpath data/db --auth --auditDestination file --auditFilter '{ atype: "authenticate", "param.db": "test" }' --auditFormat BSON --auditPath data/db/auditLog.bson

Referencia: [Operaciones de autenticación](https://docs.mongodb.com/manual/tutorial/configure-audit-filters/#filter-on-authentication-operations-on-a-single-database)
