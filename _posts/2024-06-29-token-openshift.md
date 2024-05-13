---
title: "Cómo generar un Token de Acceso sin Fecha de Vencimiento en OpenShift"
author: Ernesto Vázquez García
date: 2024-06-29 09:00:00 +0200
categories: [DevOps]
tags: [Openshift]
---

En el ecosistema de OpenShift, a menudo nos enfrentamos a la necesidad de ejecutar scripts o procesos automatizados que requieren autenticación contra el clúster de OpenShift. Sin embargo, es común que los tokens de acceso generados para los usuarios tengan una fecha de vencimiento, lo que puede complicar la automatización a largo plazo. En este artículo, exploraremos cómo generar tokens de acceso sin fecha de vencimiento para garantizar una autenticación continua y sin interrupciones en nuestros scripts y procesos automatizados.

## Creación de una Cuenta de Servicio

El primer paso es crear una cuenta de servicio en OpenShift. Esta cuenta de servicio actuará como nuestra entidad de autenticación sin fecha de vencimiento. Ejecuta el siguiente comando para crear la cuenta de servicio llamada "robot":

```
oc create serviceaccount robot
```

## Asignación de Permisos

Una parte crucial del proceso de generación de tokens de acceso sin fecha de vencimiento en OpenShift es la asignación de permisos adecuados a la cuenta de servicio "robot". Estos permisos determinarán qué acciones puede realizar la cuenta de servicio en el clúster de OpenShift. A continuación, exploraremos algunos de los permisos comunes que podríamos asignar, dependiendo de las necesidades específicas o la función que vaya a desempeñar nuestro script o proceso automatizado.

### Permiso de Visualización (view)

El permiso de visualización (`view`) otorga a la cuenta de servicio la capacidad de ver recursos en el clúster de OpenShift. Esto incluye ver información sobre proyectos, aplicaciones, pods, servicios, y otros recursos. Es útil cuando solo necesitamos que la cuenta de servicio observe el estado del clúster sin realizar cambios.

```
oc policy add-role-to-user view system:serviceaccount:<namespace>:robot
```

### Permiso de Edición (edit)

El permiso de edición (`edit`) permite a la cuenta de servicio realizar cambios en los recursos del clúster de OpenShift. Esto incluye la capacidad de crear, modificar o eliminar recursos dentro de un proyecto específico. Es útil cuando el script o proceso automatizado necesita realizar cambios en el clúster.

```
oc policy add-role-to-user edit system:serviceaccount:<namespace>:robot
```

### Permiso de Administrador del Clúster (cluster-admin)

El permiso de administrador del clúster (`cluster-admin`) otorga a la cuenta de servicio acceso total y sin restricciones a todos los recursos en el clúster de OpenShift. Esto incluye la capacidad de crear, modificar o eliminar recursos en cualquier proyecto y realizar cambios en la configuración del clúster. Debe usarse con precaución, ya que otorga un nivel muy alto de privilegios.

```
oc adm policy add-cluster-role-to-user cluster-admin system:serviceaccount:<namespace>:robot
```

Al asignar estos permisos a la cuenta de servicio "robot", podemos personalizar el nivel de acceso según las necesidades específicas de nuestros scripts o procesos automatizados. Es importante evaluar cuidadosamente qué permisos son necesarios y otorgar solo los privilegios mínimos requeridos para garantizar la seguridad y la integridad del clúster de OpenShift.

## Obtención del Token de Acceso

Una vez que hemos creado la cuenta de servicio y asignado los permisos necesarios, podemos obtener el token de acceso asociado a esta cuenta. Primero, necesitamos identificar el nombre del secreto generado para la cuenta de servicio "robot". Ejecuta el siguiente comando:

```
oc get secret
```

Busca el secreto que corresponda a la cuenta de servicio "robot". Luego, obtén los detalles del secreto, incluido el token de inicio de sesión, ejecutando el siguiente comando:

```
oc get secret <robot-secret-name> -o yaml
```

Reemplaza <robot-secret-name> con el nombre del secreto generado para la cuenta de servicio "robot".

Una vez que hemos obtenido los detalles del secreto en formato YAML, que incluye el token de inicio de sesión codificado en base64, necesitamos decodificarlo para obtener el token en texto plano. Aquí está el proceso para decodificarlo:

1. Copia el valor del campo `data.token` del secreto YAML. Este valor es el token codificado en base64 que necesitamos decodificar.

2. Utiliza un decodificador de base64 para convertir el token codificado en base64 en texto plano. Puedes hacer esto utilizando herramientas integradas en tu sistema operativo o utilizando un comando en la línea de comandos.

```
echo "<token-codificado-en-base64>" | base64 --decode
```

Reemplaza <token-codificado-en-base64> con el valor del token codificado en base64 que copiaste del secreto YAML. Al ejecutar este comando, obtendrás el token de inicio de sesión en texto plano.

## Integración con Scripts Automatizados

Ahora que hemos decodificado el token de acceso obtenido del secreto en formato YAML, podemos utilizarlo para autenticarnos en el clúster de OpenShift. El token decodificado está en texto plano y listo para ser utilizado en el comando `oc login`.

Asumiendo que ya hemos decodificado el token, ejecutamos el siguiente comando, sustituyendo `<inserta-tu-token-aqui>` con el token decodificado:

```
oc login --token=<inserta-tu-token-decodificado-aqui> --server=https://<host_server>:6443 --insecure-skip-tls-verify
```
 
Asegúrate de reemplazar `<inserta-tu-token-decodificado-aqui>` con el token de inicio de sesión decodificado y `<host_server>` con la URL del servidor de OpenShift.

Una vez ejecutado este comando, estarás autenticado en el clúster de OpenShift y podrás realizar acciones según los permisos asignados a la cuenta de servicio "robot". Esta integración en tus scripts automatizados garantiza una autenticación continua y sin interrupciones en el clúster de OpenShift, lo que asegura la ejecución exitosa de tus procesos automatizados.

Agregar esta línea de comando al principio del script del artículo anterior [Cómo Automatizar el Backup de una Base de Datos y Subirlo a Amazon S3](https://ernestovazquez.es/posts/backup-s3) permitirá que el script se autentique automáticamente en el clúster de OpenShift, garantizando una conexión continua y sin interrupciones. Esto es especialmente útil para asegurarnos de que el token de acceso no caduque durante la ejecución del script, lo que garantiza que el respaldo de la base de datos se realice de manera efectiva y sin problemas. Al incorporar esta funcionalidad, mejoramos la eficiencia y la seguridad de nuestros procesos automatizados, asegurando que puedan funcionar de manera confiable y sin intervención manual en el clúster de OpenShift.
