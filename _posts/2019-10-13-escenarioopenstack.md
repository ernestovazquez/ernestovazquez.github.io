---
title: "Creación del escenario de trabajo en OpenStack"
author: Ernesto Vázquez García
date: 2019-10-13 00:00:00 +0800
categories: [Cloud]
---

Crea el siguiente escenario en OpenStack:

1. Máquina 1: * Hostname: croqueta * Sabor: vol.mini * Imagen: Debian Buster * Disco duro en un volumen
2. Máquina 2: * Hostname: salmorejo * Sabor: m1.normal * Imagen: CentOS 7
3. Maquina 3: * Hostname: tortilla * Sabor: vol,mini * Imagen: Ubuntu 18.04 * Disco en volumen

Todos los equipos deben tener correctamente configurado el nombre de dominio como "nombre".gonzalonazareno.org y deben responder correctamente al comando "hostname -f"

Añade temporalmente la resolución estática de todos los nodos

Crea el usuario "profesor" que pueda utilizar sudo sin contraseña y añade las claves públicas de Alberto y José Domingo

Actualiza el sistema

***

### Croqueta: 172.22.200.111

Vamos a cambiar el nombre de dominio.

Editamos el fichero `/etc/hostname`

```
sudo nano /etc/hostname

croqueta.gonzalonazareno.org croqueta
```

Ahora solo falta cambiar nuestro ficheros hosts.

```
sudo nano /etc/hosts

127.0.0.1 localhost
127.0.1.1 croqueta.gonzalonazareno.org croqueta
```

Creamos el usuario profesor que pueda utilizar sudo sin contraseña.

Abre el archivo `/etc/sudoers` con el comando:

```
sudo visudo

profesor  ALL=(ALL) NOPASSWD:ALL
```

Este comando comprueba la edición y si hay un error de sintaxis no guardará los cambios. Si abres el archivo con el editor de texto, un error de sintaxis hará que se pierda el acceso a sudo.

Añadimos las claves públicas de Alberto y José Domingo

    root@croqueta:/home/debian/.ssh# nano authorized_keys
    
Añade temporalmente la resolución estática de todos los nodos

```
debian@croqueta:~$ sudo nano /etc/hosts

10.0.0.11 salmorejo.gonzalonazareno.org salmorejo
10.0.0.9 tortilla.gonzalonazareno.org tortilla
```

Por ultimo actualizamos la máquina

### Tortilla: 172.22.200.21

Vamos a cambiar el nombre de dominio.

Editamos el fichero `/etc/hostname`

```
sudo nano /etc/hostname

tortilla.gonzalonazareno.org tortilla
```

Ahora solo falta cambiar nuestro ficheros hosts.

```
sudo nano /etc/hosts

127.0.1.1 tortilla.gonzalonazareno.org tortilla
```

Creamos el usuario profesor que pueda utilizar sudo sin contraseña.

Abre el archivo `/etc/sudoers` con el comando:

```
sudo nano /etc/sudoers

profesor  ALL=(ALL) NOPASSWD:ALL
```

Añadimos las claves públicas de Alberto y José Domingo

```
root@tortilla:/home/ubuntu/.ssh# nano authorized_keys
```

Añade temporalmente la resolución estática de todos los nodos

```
ubuntu@tortilla:~$ sudo nano /etc/hosts

10.0.0.3 croqueta.gonzalonazareno.org croqueta
10.0.0.11 salmorejo.gonzalonazareno.org salmorejo
```

Por ultimo actualizamos la máquina

### Salmorejo: 172.22.200.109

    [centos@salmorejo ~]$ hostnamectl set-hostname salmorejo.gonzalonazareno.org

Creamos el usuario profesor que pueda utilizar sudo sin contraseña.

Abre el archivo `/etc/sudoers` con el comando:

```
[root@salmorejo centos]# nano /etc/sudoers

## Allow root to run any commands anywhere
root    ALL=(ALL)    ALL
profesor ALL=(ALL) NOPASSWD:ALL
```

Añadimos las claves públicas de Alberto y José Domingo

    [root@salmorejo .ssh]# nano authorized_keys

Añade temporalmente la resolución estática de todos los nodos

```
[centos@salmorejo ~]$ sudo nano /etc/hosts

10.0.0.9 tortilla.gonzalonazareno.org tortilla
10.0.0.3 croqueta.gonzalonazareno.org croqueta
```

Por ultimo actualizamos la máquina

Añade temporalmente la resolución estática de todos los nodos

```
ernesto@honda:~$ sudo nano /etc/hosts

172.22.200.111 croqueta.gonzalonazareno.org croqueta
172.22.200.21 tortilla.gonzalonazareno.org tortilla
172.22.200.109 salmorejo.gonzalonazareno.org salmorejo
```


