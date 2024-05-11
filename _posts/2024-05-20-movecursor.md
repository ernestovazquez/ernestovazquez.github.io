---
title: "Script Linux para Mantener tu Ordenador Activo"
author: Ernesto Vázquez García
date: 2024-05-11 09:00:00 +0200
categories: [Curiosidades]
tags: [Sysadmin]
---

Uno de los problemas comunes que enfrentan los usuarios de ordenadores es el tiempo de inactividad, que puede resultar en la suspensión automática del sistema operativo. Esto puede ser especialmente molesto si estás trabajando en una tarea que requiere atención constante, como supervisar procesos en segundo plano o mantener una sesión de videoconferencia activa.

El script es bastante sencillo y configurable. Te permite especificar la longitud y la frecuencia con la que deseas que el ratón se mueva. Además, puedes elegir si deseas que el movimiento se produzca alrededor de la posición actual del ratón o alrededor del centro de la pantalla.

```
#!/bin/bash
#
# Script to keep mouse pointer moving so that, for example, Suspend to RAM timeout does not occur.
# 
# The mouse pointer will move around its current position on the screen, i.e. around any position
# on the screen where you place the pointer. However, if you prefer it to move around the centre
# of the screen then change mousemove_relative to mousemove in the xdotool command below.
#
# Set LENGTH to 0 if you do not want the mouse pointer to actually move.
# Set LENGTH to 1 if you want the mouse pointer to move just a tiny fraction.
# Set LENGTH to e.g. 100 if you want to see more easily the mouse pointer move.
LENGTH=1
#
# Set DELAY to the desired number of seconds between each move of the mouse pointer.
DELAY=5
#
while true
do
    for ANGLE in 0 90 180 270
    do
        xdotool mousemove_relative --polar $ANGLE $LENGTH
        sleep $DELAY
    done
done
```

El script funciona moviendo el ratón en una secuencia circular alrededor de su posición actual. Esto se logra mediante la rotación del ratón a intervalos regulares en incrementos de 90 grados. Esto evita que el ordenador entre en suspensión debido a la inactividad, ya que constantemente detecta la actividad del ratón.

Las ventajas de utilizar este script son múltiples. Aparte de mantener activo el ordenador y evitar la suspensión automática, también puede ser útil en situaciones donde se necesite simular actividad del usuario, como en pruebas de software o automatización de tareas repetitivas.

Sin embargo, aunque este script es una forma ingeniosa de mantener tu ordenador activo, te recomendaría no usarlo para simular actividad mientras te ausentas del trabajo. No queremos que te descubran con un "pájaro de teclado" al estilo de Homer Simpson. Es mejor mantenerse honesto y tomarse un descanso cuando lo necesites.





