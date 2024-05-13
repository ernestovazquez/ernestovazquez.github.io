---
title: "Terraform para automatizar encendido y apagado de instancias EC2"
author: Ernesto Vázquez García
date: 2024-05-13 09:00:00 +0200
categories: [Cloud]
tags: [AWS]
---

# Introducción

En este artículo, exploraremos cómo implementar la automatización del encendido y apagado de instancias EC2 en AWS utilizando Terraform y Lambda. Esta solución está diseñada para ayudarte a reducir costos al implementar apagados programados específicamente para instancias EC2 durante períodos de inactividad, y posteriormente, encenderlas según el horario especificado. Mediante el uso de esta combinación de herramientas, podremos gestionar nuestras instancias de manera eficiente, garantizando que estén disponibles solo cuando sean necesarias, lo que resultará en una optimización de recursos y una reducción de gastos operativos.

En lugar de tener que crear múltiples reglas para cada instancia que se crea, hemos adoptado un enfoque más eficiente y dinámico. Tal como detallamos en un [artículo anterior](https://ernestovazquez.es/posts/cloudwatch-startstopec2), hemos implementado una solución que se basa en la asignación de etiquetas a nuestras instancias EC2. Al asignar una etiqueta específica, como `env=dev`, la función se activa automáticamente para gestionar el proceso de automatización del encendido y apagado. Este método nos libera de la tarea tediosa de crear y mantener múltiples reglas, permitiéndonos escalar nuestra infraestructura de manera ágil y sin complicaciones adicionales.

## ¿Cómo Funciona?
Para automatizar el encendido y apagado, hemos utilizado el módulo disponible en [este enlace](https://github.com/eanselmi/terraform-aws-ec2-rds-scheduler).

Este módulo facilita la implementación de los siguientes recursos:

- Roles IAM para que EventBridge invoque funciones Lambda.
- Roles IAM para que las funciones Lambda inicien/detengan instancias EC2.
- Programaciones de EventBridge.
- Ocho funciones Lambda (dos para instancias EC2, dos para grupos de Auto Scaling, dos para instancias RDS y dos para clústeres Aurora).

En este caso, nos enfocaremos en la automatización específica para las instancias EC2.

## Despliegue

### Paso 1: Configuración del Módulo Terraform

Para comenzar, utilizaremos un módulo de Terraform creado por la comunidad para gestionar los horarios de encendido y apagado de las instancias EC2. Este módulo simplifica la tarea al proporcionar una estructura predefinida. En nuestro archivo `main.tf`, invocamos el módulo y proporcionamos las variables necesarias:

> Archivo `main.tf`

```
module "ec2-rds-scheduler" {
  source                      = "eanselmi/ec2-rds-scheduler/aws"
  version                     = "1.0.5"
  ec2_start_stop_schedules    = var.ec2_start_stop_schedules
  timezone                    = var.timezone
}
```

### Paso 2: Definición de Variables

En el archivo `variables.tf`, configuramos las variables requeridas por el módulo. Estas variables incluyen una descripción y el tipo de datos que necesitará, así como la zona horaria deseada:

> Archivo `variables.tf`

```
variable "ec2_start_stop_schedules" {
  description = "Schedules and tags to power off and power on EC2 instances"
  type        = map(map(string))
  default     = {}
}


variable "timezone" {
  description = "Timezone for Schedules"
  type        = string
}
```

### Paso 3: Configuración de los Horarios y Etiquetas

En el archivo `terraform.tfvars`, definimos los horarios y etiquetas específicas para nuestras instancias EC2. Por ejemplo, aquí configuramos un horario para el entorno de desarrollo ("dev"):

> Archivo `terraform.tfvars`

```
ec2_start_stop_schedules = {
  "schedule_dev" = {
    "cron_stop"  = "cron(00 19 ? * MON-FRI *)"
    "cron_start" = "cron(00 07 ? * MON-FRI *)"
    "tag_key"    = "env"
    "tag_value"  = "dev"
  }
}

timezone = "Europe/Madrid"
```

Aquí, `cron_stop` y `cron_start` especifican los horarios utilizando la sintaxis Cron. Las etiquetas `tag_key` y `tag_value` serán aplicadas a las instancias EC2 para identificarlas y aplicar las acciones programadas.

Recuerda que puedes configurar múltiples horarios para diferentes entornos ajustando las variables según sea necesario.

### Paso 4: Etiquetas en las instancias

Para agregar una nueva instancia para automatizar el proceso de encendido y apagado solamente tendremos que agregar una nueva etiqueta.

```
Key: env	
Value: dev
```

### Paso 5: Despliegue de la Infraestructura

Una vez que hemos configurado nuestros archivos de Terraform, el siguiente paso es desplegar la infraestructura en AWS. Para ello, utilizaremos una serie de comandos de Terraform:

> 1. Cargar módulo

Este comando inicializa el directorio de trabajo y descarga los proveedores y módulos necesarios, incluyendo el módulo que estamos utilizando en nuestro proyecto. Ejecutar este comando asegura que Terraform esté listo para su uso.

```
terraform init
```

> 2. Revisión de los archivos

Este comando analiza los archivos de configuración y muestra los cambios que Terraform realizará en la infraestructura. Esto incluye los recursos que se crearán, modificarán o eliminarán. Es una buena práctica revisar este plan para asegurarse de que los cambios planeados sean los esperados.

```
terraform plan
```

> 3. Aplicamos cambios

Una vez que hemos revisado el plan y estamos listos para aplicar los cambios, ejecutamos terraform apply. Este comando despliega la infraestructura según lo especificado en los archivos de configuración de Terraform.

```
terraform apply
```

Después de ejecutar `terraform apply`, Terraform solicitará confirmación antes de aplicar los cambios. Es importante revisar estos cambios cuidadosamente antes de confirmar, ya que pueden tener un impacto significativo en nuestra infraestructura en la nube.

### Paso 6: Automatización Completada

Una vez que hemos ejecutado este último comando, nuestras instancias EC2 están configuradas para el encendido y apagado automatizado según los horarios especificados. Esto se logra a través de las etiquetas que hemos definido en los archivos de Terraform.

El módulo Terraform que hemos utilizado se encargará de aplicar los horarios programados a las instancias EC2 que coincidan con las etiquetas especificadas. Por lo tanto, no es necesario realizar ninguna acción adicional una vez que se hayan desplegado las instancias.

Desde este punto en adelante, nuestras instancias EC2 en el entorno de desarrollo (y cualquier otro entorno que hayamos configurado) se encenderán y apagarán automáticamente según los horarios establecidos.

## Cambiar hora de encendido/apagado

### Desde la consola de AWS

Podemos ajustar el horario de dos maneras: a través de Terraform o mediante la consola web de AWS.

Nos dirigimos a Amazon EventBridge -> Programaciones

![StartStopNew](https://i.imgur.com/6Yyg7vV.png)

Seleccionamos la programación que necesitemos cambiar y la editaremos.

![StartStopNew2](https://i.imgur.com/K4FgRqY.png)

Definimos el horario de ejecución utilizando la expresión cron. Por ejemplo, para limitar el uso a horas laborales de lunes a viernes, utilizamos

```
cron(0 17 ? * MON-FRI *)
```

Debajo de cada cuadro hay una descripción para reconocer su función. Cambiaremos estos parámetros a nuestra necesidad.

Nos aparecerá una información con las siguientes 10 desencadenadores donde nos mostrará el día y hora que se ejecutará la tarea.

![StartStopNew3](https://i.imgur.com/p5DHlz2.png)

### Desde la terminal con terraform

Desde Terraform también podemos realizar ediciones de la siguiente manera:

Para ajustar los horarios de encendido y apagado de las instancias, simplemente edita el archivo terraform.tfvars siguiendo estos pasos:

1. Abre el archivo `terraform.tfvars`.

2. Localiza la sección `ec2_start_stop_schedules`, donde se definen los horarios de encendido y apagado para diferentes entornos. Por ejemplo:

```
ec2_start_stop_schedules = {
  "schedule_dev" = {
    "cron_stop"  = "cron(00 19 ? * MON-FRI *)"
    "cron_start" = "cron(00 19 ? * MON-FRI *)"
    "tag_key"    = "env"
    "tag_value"  = "dev"
  }
}
```
3. Edita las expresiones `cron_stop` y `cron_start` según el nuevo horario deseado. Por ejemplo, si deseas cambiar el horario a las 8:00 AM para el encendido y a las 6:00 PM para el apagado de las instancias, puedes ajustar las expresiones de la siguiente manera:

```
ec2_start_stop_schedules = {
  "schedule_dev" = {
    "cron_stop"  = "cron(00 18 ? * MON-FRI *)" // Apagado a las 6:00 PM
    "cron_start" = "cron(00 08 ? * MON-FRI *)" // Encendido a las 8:00 AM
    "tag_key"    = "env"
    "tag_value"  = "dev"
  }
}
```

4. Guarda los cambios realizados en el archivo `terraform.tfvars`.

5. Una vez realizados estos cambios, ejecuta nuevamente los siguientes comandos de Terraform para aplicar las modificaciones:

```
terraform plan
```

```
terraform apply
```

Con estos pasos, habrás actualizado con éxito el horario de encendido y apagado de las instancias según tus necesidades.
