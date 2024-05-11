---
title: "Automatizar Encendido/Apagado Instancias EC2"
author: Ernesto Vázquez García
date: 2024-05-13 09:00:00 +0200
categories: [Cloud]
---

Con el objetivo de optimizar los costos operativos en AWS, implementaremos una solución automatizada para encender y apagar instancias EC2 según un horario predefinido. Esto nos permitirá utilizar las instancias únicamente cuando sean necesarias, como durante el horario laboral, y evitar gastos innecesarios durante periodos de inactividad.

Pasos para la automatización:

1. Identificación de las instancias EC2 a automatizar.
2. Creación de un nuevo rol con los permisos necesarios para administrar el encendido y apagado de instancias.
3. Creación de reglas en CloudWatch para el encendido y apagado programado, definiendo el horario de ejecución.

## Creación del Rol

Para comenzar, crearemos un rol en IAM con los permisos adecuados para gestionar el encendido y apagado de las instancias.

1. Accedemos a IAM\Roles y seleccionamos "Crear rol".

![StartStop1](https://imgur.com/UCAVQk6)


2. En la ventana "Tipo de entidad de confianza", elegimos "Política de confianza personalizada" y copiamos el siguiente texto JSON:

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "events.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

![StartStop2](https://imgur.com/nZO4An6)

3.  Seleccionamos la política de permisos "AmazonSSMAutomationRole".

![StartStop3](https://imgur.com/vDH5n3j)

4.  Revisamos la información y finalmente creamos el rol.

![StartStop4](https://imgur.com/7KhZpdi)

Si buscamos el nombre del rol, vemos que se ha creado correctamente

![StartStop5](https://imgur.com/pxNneEy)

## Creación de reglas 

Ahora configuraremos las reglas en CloudWatch para automatizar el encendido y apagado de las instancias EC2.

1. Copiamos el ID de la instancia que deseamos controlar.

![StartStop6](https://imgur.com/Bsj6mMO)

2. Navegamos a la sección de "CloudWatch" y accedemos a "Reglas".

![StartStop7](https://imgur.com/x6pkAyN)

3. Nos redirige automáticamente a "Amazon EventBridge" aquí es la pantalla donde vamos a poder crear las reglas y apagado. Seleccionamos "Crear Regla".

![StartStop8](https://imgur.com/KnO5k1x)

4. Definición de detalles de reglas, en esta ventana agregaremos un nombre, una descripción y seleccionamos en tipo de regla "Programar", para poder ejecutar la tarea mediante un horario programable. Por ultimo seleccionamos el cuadro de la izquierda llamado, "Continuar con la creación de la regla"

![StartStop9](https://imgur.com/cmEXc24)

5. Definimos el horario de ejecución utilizando la expresión cron. Por ejemplo, para limitar el uso a horas laborales de lunes a viernes, utilizamos

```
cron(0 17 ? * MON-FRI *)
```

Debajo de cada cuadro hay una descripción para reconocer su función. Cambiaremos estos parámetros a nuestra necesidad.

Nos aparecerá una información con las siguientes 10 desencadenadores donde nos mostrará el día y hora que se ejecutará la tarea. ¡TEN CUIDADO CON EL CAMBIO DE HORA DE TU PAIS!

![StartStop10](https://imgur.com/GWSDmK0)

6. Configuramos los destinos:

- **Servicio de AWS**
- **Seleccione un destino:** Vamos a buscar "Automatización del administrador del sistema" o "Automatización de Systems Manager" cambiará el nombre dependiendo de la versión. 
- **Documento:** "AWS-StopEC2Instance" para apagar instancias o "AWS-StartEC2Instance" para encenderlas.
- **InstanceId:** ID de la instancia
- **Usar el rol existente:** Buscaremos el rol que hemos creado previamente en nuestro caso llamado "Rol_EC2_StartStop"

Una vez terminado de configurar estos parámetros seleccionamos siguiente para avanzar con la configuración de la regla.

![StartStop11](https://imgur.com/5Fy4VZz)

7. Opcionalmente, agregamos etiquetas para organizar y categorizar las reglas.

![StartStop12](https://imgur.com/zHNuU3W)

8. Por ultimo podemos hacer un repaso para revisar todos los pasos que hemos configurado y tras comprobar que está todo correcto continuamos con "Crear regla"

![StartStop13](https://imgur.com/cj5coSy)

En el buscador podemos filtrar entre todas las reglas que tengamos y podemos encontrar las creadas. Como podemos ver en la imagen tenemos una regla para encender y otra para parar la instancia.

![StartStop14](https://imgur.com/9CD8DWr)
