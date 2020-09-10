---
title: "PL/SQL vs PL/PGSQL"
date: 2019-11-09 00:00:00 +0800
categories: [Bases de datos]
tags: [Oracle, PostgreSQL, MySQL]
---

#### Vamos a ver las principales diferencias entre estos dos gestores. 
###### Diferencias en cursores:

Recorreremos los cursores de formas diferentes en los dos gestores.

* PL/SQL:

```
CURSOR c_cursor
IS
SELECT ...
FROM nombretabla;

FOR i IN c_cursor LOOP

END LOOP;
```
* PL/PGSQL:

```
FOR c_cursor IN SELECT ... FROM table LOOP;

END LOOP;
```

###### En cuanto a triggers en PL/PGSQL primero creamos la función y después llamamos a dicha función

```
CREATE OR REPLACE FUNCTION nombrefuncion RETURNS TRIGGER AS $nombretrigger$
DECLARE

BEGIN

END;
$nombretrigger$ LANGUAGE PLPGSQL



CREATE OR REPLACE nombretrigger
(AFTER OR BEFORE)(INSERT,UPDATE OR DELETE) ON nombretabla
FOR EACH(FILA O SENTENCIA) 
EXECUTE FUNCTION nombrefuncion;
```

* PL/SQL:


```
CREATE OR REPLACE TRIGGER name
(AFTER/BEFORE) (INSERT,UPDATE OR DELETE) ON nombretabla
FOR EACH (fila o sentencia)
BEGIN

END;
/
```

###### También tendremos que cambiar la forma de imprimir.

* Mientras que en Oracle es:

```
dbms_output.put_line(‘...’);
```

* En PostgreSQL entremos que poner lo siguiente:

```
RAISE NOTICE ‘...’;
```

###### En los errores pasa lo mismo

* Oracle:

```
raise_application_error(-20002,'...');
```

* PostgreSQL:

```
RAISE EXCEPTION '...';
```

###### Vamos a ver cómo se crean las estructuras de las funciones y la principal diferencia con respecto a Oracle

* En Oracle terminaremos la función solamente con los siguiente:

```
end nombrefuncion;
/
```

* Mientras que en PostgreSQL:

```
end;
$nombrefuncion$ LANGUAGE plpgsql;
```

###### Tablas mutantes

Por último, en cuanto a las tablas mutantes, en oracle se crea con paquetes y en postgres son con tablas temporales.

Crear una tabla temporal

```
CREATE TEMP TABLE tbl AS
SELECT * FROM tbl WHERE ... ;
```

No está seguro de si la tabla ya existe

```
CREATE TABLE IF not EXISTS ...
```

A continuación:

```
INSERT INTO tbl (col1, col2, ...)
SELECT col1, col2, ...
```
