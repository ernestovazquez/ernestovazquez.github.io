---
title: "Eliminar un namespace atascado en el estado 'Terminating' en OpenShift"
author: Ernesto Vázquez García
date: 2023-10-09 22:40:00 +0200
categories: [DevOps]
tags: [Openshift]
---

¿Alguna vez te has encontrado con el frustrante error "Conflict: Operation cannot be fulfilled on namespaces" al intentar eliminar un namespace en OpenShift? Esta situación suele ocurrir cuando un proyecto se queda atascado en el estado "Terminating" debido a algún problema en el proceso de eliminación. Afortunadamente, existe una solución técnica para resolver este inconveniente.

Aquí te presento una guía detallada para eliminar un namespace que se encuentra en este estado utilizando comandos específicos de OpenShift:

## Paso 1: Obtener el estado del namespace en un archivo JSON

```
oc get namespace $NS_TO_DELETE -o json > tmp_ns.json
```

Este comando obtiene el estado del namespace especificado y lo guarda en un archivo JSON llamado "tmp_ns.json".

## Paso 2: Editar el archivo JSON para eliminar el finalizador problemático

```
vi tmp_ns.json
```

Abre el archivo JSON recién creado en un editor de texto, como Vi, y elimina la línea que contiene "kubernetes" bajo la sección "finalizers". Guarda los cambios y cierra el editor.


## Paso 3: Abrir una conexión proxy al clúster de OpenShift

```
oc proxy &
```

Este comando inicia un proceso en segundo plano que establece una conexión proxy al clúster de OpenShift.

## Paso 4: Enviar el contenido al clúster utilizando curl

```
curl -k -H "Content-Type: application/json" -X PUT --data-binary @tmp_ns.json http://127.0.0.1:8001/api/v1/namespaces/$NS_TO_DELETE/finalize
```

Utilizando curl, este comando envía el contenido del archivo JSON modificado al clúster de OpenShift, solicitando que se finalice el namespace problemático.

## Paso 5: Verificar que el namespace ha sido eliminado

```
oc get namespace $NS_TO_DELETE
```

Al ejecutar este comando, deberías obtener un mensaje indicando que el namespace no ha sido encontrado, lo que confirma que ha sido eliminado exitosamente.

## Paso 6: Detener el proceso proxy

```
kill -9 %%
```

Para finalizar, este comando detiene el proceso proxy que se inició en segundo plano en el Paso 3. Esto limpia cualquier conexión activa con el clúster de OpenShift.


> Nota: Si tienes instalado jq, puedes simplificar los Pasos 1 y 2 utilizando el siguiente comando:

> ```
> oc get namespace $NS_TO_DELETE -o json | jq '.spec = {"finalizers":[]}' > tmp_ns.json
> ```

Cuando un recurso en OpenShift (ya sea un namespace, un pod u otro tipo de objeto) se encuentra en el estado "Terminating", significa que se está intentando eliminar, pero por algún motivo, el proceso de eliminación no se completa correctamente y queda en un estado intermedio. Esto puede ocurrir debido a varios factores, como conflictos de recursos o problemas de red.

En tales casos, OpenShift no permite eliminar directamente el recurso debido a la presencia de finalizadores, que son acciones adicionales que deben completarse antes de que el recurso se elimine por completo del clúster.

La solución que se presenta en el tutorial implica editar el objeto del recurso (en este caso, un namespace) para eliminar los finalizadores. Esto es posible porque los finalizadores están definidos como parte del objeto en un campo específico dentro de la especificación JSON.

Al eliminar la línea que contiene el finalizador problemático del archivo JSON del recurso y enviarlo de vuelta al clúster utilizando la API de OpenShift, efectivamente estamos indicando al sistema que omita cualquier acción adicional pendiente y proceda con la eliminación del recurso de manera forzada.

Esta técnica no se limita únicamente a los namespaces, sino que puede aplicarse a cualquier recurso en OpenShift que se encuentre en un estado de "Terminating". Al eliminar los finalizadores, se puede desbloquear y eliminar el recurso de manera efectiva, lo que proporciona una solución general para resolver problemas relacionados con recursos atascados en este estado en un clúster de OpenShift.
