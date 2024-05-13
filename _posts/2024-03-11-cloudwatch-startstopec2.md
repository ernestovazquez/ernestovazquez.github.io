---
title: "Automatizar Encendido/Apagado Instancias EC2"
author: Ernesto Vázquez García
date: 2024-03-11 14:00:00 +0200
categories: [Cloud]
tags: [AWS]
---

Con el objetivo de optimizar los costos operativos en AWS, implementaremos una solución automatizada para encender y apagar instancias EC2 según un horario predefinido. Esto nos permitirá utilizar las instancias únicamente cuando sean necesarias, como durante el horario laboral, y evitar gastos innecesarios durante periodos de inactividad.

Pasos para la automatización:

1. Identificación de las instancias EC2 a automatizar.
2. Creación de un nuevo rol con los permisos necesarios para administrar el encendido y apagado de instancias.
3. Creación de reglas en CloudWatch para el encendido y apagado programado, definiendo el horario de ejecución.

## Creación del Rol

Para comenzar, crearemos un rol en IAM con los permisos adecuados para gestionar el encendido y apagado de las instancias.

1.- Accedemos a IAM\Roles y seleccionamos "Crear rol".

![image](https://github.com/ernestovazquez/ernestovazquez.github.io/assets/32536051/641add14-8be2-4671-865a-f9c4f58ffe9b)

2.- En la ventana "Tipo de entidad de confianza", elegimos "Política de confianza personalizada" y copiamos el siguiente texto JSON:

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
![image](https://github.com/ernestovazquez/ernestovazquez.github.io/assets/32536051/922085d2-adc0-4616-8834-81597d8d182b)

3.-  Seleccionamos la política de permisos "AmazonSSMAutomationRole".

![image](https://github.com/ernestovazquez/ernestovazquez.github.io/assets/32536051/a0ed3a4e-11f3-4507-9643-5446c3f1daf1)

4.-  Revisamos la información y finalmente creamos el rol.

![image](https://github.com/ernestovazquez/ernestovazquez.github.io/assets/32536051/aa56144f-b788-428c-8212-797cde97b256)

Si buscamos el nombre del rol, vemos que se ha creado correctamente

![image](https://github.com/ernestovazquez/ernestovazquez.github.io/assets/32536051/bbf7ad31-0484-48c7-b48f-f427ea16af3f)

## Creación de reglas 

Ahora configuraremos las reglas en CloudWatch para automatizar el encendido y apagado de las instancias EC2.

1.- Copiamos el ID de la instancia que deseamos controlar.

![image](https://github.com/ernestovazquez/ernestovazquez.github.io/assets/32536051/64bc5b5e-fef8-4219-884e-ed31d58d3567)

2.- Navegamos a la sección de "CloudWatch" y accedemos a "Reglas".

![image](https://github.com/ernestovazquez/ernestovazquez.github.io/assets/32536051/55be305d-af1b-4bb2-a63f-ebbb545fea93)

3.- Nos redirige automáticamente a "Amazon EventBridge" aquí es la pantalla donde vamos a poder crear las reglas y apagado. Seleccionamos "Crear Regla".

![image](https://github.com/ernestovazquez/ernestovazquez.github.io/assets/32536051/7b732d8b-63b3-4356-9418-536c3d5ab557)

4.- Definición de detalles de reglas, en esta ventana agregaremos un nombre, una descripción y seleccionamos en tipo de regla "Programar", para poder ejecutar la tarea mediante un horario programable. Por ultimo seleccionamos el cuadro de la izquierda llamado, "Continuar con la creación de la regla"

![image](https://github.com/ernestovazquez/ernestovazquez.github.io/assets/32536051/1f50b670-c9d8-4026-b492-b1ace50fa91f)

5.- Definimos el horario de ejecución utilizando la expresión cron. Por ejemplo, para limitar el uso a horas laborales de lunes a viernes, utilizamos

```
cron(0 17 ? * MON-FRI *)
```

Debajo de cada cuadro hay una descripción para reconocer su función. Cambiaremos estos parámetros a nuestra necesidad.

Nos aparecerá una información con las siguientes 10 desencadenadores donde nos mostrará el día y hora que se ejecutará la tarea. ¡TEN CUIDADO CON EL CAMBIO DE HORA DE TU PAIS!

![image](https://github.com/ernestovazquez/ernestovazquez.github.io/assets/32536051/a25e928e-ac02-4372-b720-559111fe4f06)

6.- Configuramos los destinos:

- **Servicio de AWS**
- **Seleccione un destino:** Vamos a buscar "Automatización del administrador del sistema" o "Automatización de Systems Manager" cambiará el nombre dependiendo de la versión. 
- **Documento:** "AWS-StopEC2Instance" para apagar instancias o "AWS-StartEC2Instance" para encenderlas.
- **InstanceId:** ID de la instancia
- **Usar el rol existente:** Buscaremos el rol que hemos creado previamente en nuestro caso llamado "Rol_EC2_StartStop"

Una vez terminado de configurar estos parámetros seleccionamos siguiente para avanzar con la configuración de la regla.

![image](https://github.com/ernestovazquez/ernestovazquez.github.io/assets/32536051/17bb958f-eac6-4728-b120-73f129b74ce1)

7.- Opcionalmente, agregamos etiquetas para organizar y categorizar las reglas.

![image](https://github.com/ernestovazquez/ernestovazquez.github.io/assets/32536051/222ee86f-0480-4473-ba18-0f3736a6b754)

8.- Por ultimo podemos hacer un repaso para revisar todos los pasos que hemos configurado y tras comprobar que está todo correcto continuamos con "Crear regla"

![image](https://github.com/ernestovazquez/ernestovazquez.github.io/assets/32536051/3f093a76-6634-45b8-9d97-00852e6845e0)


En el buscador podemos filtrar entre todas las reglas que tengamos y podemos encontrar las creadas. Como podemos ver en la imagen tenemos una regla para encender y otra para parar la instancia.

![image](https://github.com/ernestovazquez/ernestovazquez.github.io/assets/32536051/e1fc8e1b-ec8b-4a4e-ac6e-5d8146e6b985)
