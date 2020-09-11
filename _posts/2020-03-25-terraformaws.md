---
title: "Terraform + AWS"
author: Ernesto Vázquez García
date: 2020-03-25 00:00:00 +0800
categories: [Cloud]
tags: [AWS, Terraform]
---

# Introducción

## Descripción del proyecto

Investigar sobre el funcionamiento y las diferentes funcionalidades que nos ofrece Terraform. Vamos a ver las ventajas y desventajas que tiene dicha herramienta. Veremos tambien que son los providers en terraform y su funcionalidad.

Los objetivos vamos a conocer las aplicaciones que podemos desarrollar con Terraform, como hemos mencionado anteriormente vamos dominar varios providers, entre ellos el de AWS y MySQL. Vamos a crear plataformas replicables para poder crear y replicar las plantillas. Ejemplos de creación de infraestructura relacionando los recursos. Por último, seria interesante ver creación de módulos de las aplicaciones para luego poder reutilizarlas.

## ¿Qué es Terraform?

Terraform es un software de infraestructura como código desarrollado por HashiCorp. Permite a los usuarios definir y configurar la infraestructura de un centro de datos en un lenguaje de alto nivel.
La infraestructura se define utilizando la sintaxis de configuración de HashiCorp denominada HashiCorp Configuration Language (HCL) o, en su defecto, el formato JSON.

Terraform es capaz de crear y componer todos los componentes necesarios para ejecutar cualquier servicio o aplicación.

Terraform es un proyecto open source (o código abierto), maduro y con una gran cantidad de personas que colaboran, su principal ventaja es que tiene una gran cantidad de providers y esto permite crear infraestructuras híbridas. 

## ¿Qué es Amazon Web Services?

Amazon Web Services, también conocida como AWS, es un conjunto de herramientas y servicios de cloud computing de Amazon.
Amazon web services nos provee una gran cantidad de servicios para poder dar solución a distintas variables, desde almacenamiento en la nube, gestión de instancias, hosting web...

## Instalación de Terraform

Vamos a ver el proceso de instalación de Terraform. Para instalarlo nos iremos a la [página oficial](https://www.terraform.io/downloads.html) y buscaremos el apartado de Descargas. En mi caso voy a descargar la versión de Linux 64 bit.

Una vez descargado tendremos que descomprimirlo, podremos realizarlo usando la herramienta *unzip*. Posteriormente, moveremos dicho binario al directorio */usr/bin* y podremos ver que ya se puede ejecutar el comando *terraform*.


También podremos hacerlo teniendo el binario de Terraform en un directorio específico y relizar un enlace simbólico para que desde cualquier directorio se pueda ejecutar terraform.

```
ernesto@honda:~$ terraform version
Terraform v0.12.24
```

Como se puede observar, he ejecutado el comando *terraform version* para verificar el funcionamiento y podemos apreciar que la version que tenemos instalada es la *0.12.24*.

## Instalación y configuración del IDE

Vamos el proceso de instalación y configuración del *IDE Pycharm*, hay otras opciones, como puede ser *Sublime Text* con un plugin para Terraform o *Vim*.

Para instalarlo nos iremos a la [página oficial](https://www.jetbrains.com/es-es/pycharm/download/#section=linux) y buscaremos el apartado de Descargas, en mi caso voy a instalar la versión gratuita llamada *Community.*

Una vez descargado, solamente tendremos que descomprimirlo con el siguiente comando.

    root@honda:/opt# tar -xzf pycharm-community-2019.3.4.tar.gz 

Una vez tengamos descomprimidos *pycharm*, vamos a cambiarle los permisos al directorio para luego poder ejecutarlo con nuestro usuario.

    root@honda:/opt/pycharm-community-2019.3.4# chown -R ernesto.ernesto pycharm-community-2019.3.4

Dentro de la directorio *bin*, tendremos que ejecutar siguiente fichero.

    ernesto@honda:/opt/pycharm-community-2019.3.4/bin$ ./pycharm.sh 

A continuación se abrirá pycharm y procederemos a instalar el plugin para *Terraform*

Para ello vamos a crear un nuevo proyecto y nos dirigimos a la pestaña *File*, aquí ya podremos abrir el siguiente apartado. Buscaremos el plugin de Terraform y le daremos a *Install*, posteriormente tendremos que reiniciar *pycharm* para activar los cambios en los plugins.

![](https://i.imgur.com/QlojOw2.png)

A continuación vamos a abrir una nueva terminal para comprobar si se ha realizado correctamente.

![](https://i.imgur.com/1jxMjJG.png)

Esto ejecutario el terraform que tenemos instalado en nuestro sistema operativo. Como se puede apreciar la integración con Terraform se ha realizado correctamente.

# Providers

## Introducción a los providers

Los *providers* son los que proveen la integración con Terraform con otras herramientas, el listado de *providers*, es bastante amplio. Desde [la documentación oficial](https://www.terraform.io/docs/providers/index.html) se puede apreciar todos los *providers* que soporta Terraform actualmente. 

Dentro de nuestras plantillas de *Terraform*, podemos hacer integración entre varios de estos providers y crear nuestra infraestructura.

> A partir de la versión 0.10.0 se separó el desarrollo de los providers del desarrollo de Terraform.

En este caso nos vamos a centrar en el provider de Amazon Web Services (AWS).

## Providers de AWS

Lo primero que tenemos que hacer para poder realizar la integración es crear un *usuario IAM* para darle permisos a Terraform de que pueda crear recursos.

Dentro de la consola de AWS, buscamos el servicio de IAM y entramos en usuarios.

![](https://i.imgur.com/Oncgd5W.png)

Vamos a crear un usuario nuevo, y este usuario va a ser solo de acceso mediante programación, esto significa que no va a tener acceso a la consola y nos va a ofrecer un par de claves que serán los que nos den permisos para crear los recursos en Amazon de manera programatica. 

![](https://i.imgur.com/WxQB6SG.png)

En este apartado vamos asociarle que tenga acceso de administrador.

![](https://i.imgur.com/5sUpXSI.png)

Ahora solamente tendremos que darle a *Crear un usuario*.

![](https://i.imgur.com/qjwtYFH.png)

A continuación nos mostrará el *Access key ID* y el *Secret access key* que nos provee Amazon.

![](https://i.imgur.com/2EEcfH7.png)

Para hacer la configuración nos iremos a la consola y vamos a instalar el *CLI* de AWS.

### Línea de comandos AWS

Si utilizamos un sistema operativo como Debian, podemos instalar directamente el paquete desde el repositorio oficial de la distribución:

```
root@honda:~# apt install awscli
```

A continuación vamos a ejecutar el siguiente comando, este nos pedirnos las claves, la región y el formato de salida de las instrucciones que ejecutemos con AWS CLI. 

```
root@honda:~# aws configure
AWS Access Key ID [None]:  AKIAYERA2MSHZAYLKAUL       
AWS Secret Access Key [None]: XXXXXXXXXXXXXXXXXXXXXX
Default region name [None]: eu-west-1
Default output format [None]: json
```

Como podemos apreciar a continuación se ha creado un directorio en el home del usuario ".aws" con los siguientes ficheros.

```
root@honda:~# cat ~/.aws/credentials 
[default]
aws_access_key_id =  AKIAYERA2MSHZAYLKAUL
aws_secret_access_key = XXXXXXXXXXXXXXXXXXXXXX

root@honda:~# cat ~/.aws/config 
[default]
region = eu-west-1
output = json
```

Con el siguiente comando podremos listar las instancias que tenemos lanzadas.

```
root@honda:~# aws ec2 describe-instances
{
    "Reservations": []
}
```

Ahora vamos a pasar a la configuración, para ello vamos a realizar la integración dentro del proyecto de *pycharm* 

![](https://i.imgur.com/AJRhgaN.png)

Aquí hemops creado un nuevo directorio dentro del proyecto y posteriormente vamos a crear un fichero llamado *main.tf*, siendo este el punto de entrada de una plantilla y el fichero principal de Terraform.

Para hacer la integración y empezar a utilizar el provider de AWS, lo primero que tenemos que hacer es definir las siguientes variables.

```
terraform {
  required_version = ">= 0.12.24"
}

provider "aws" {
  region = "eu-west-1"
  allowed_account_ids = ["559488328847"]
  profile = "default"
}
```

Ahora vamos a ver las variables que vamos a configurar: 

- **required_version:** En primero lugar podemos limitar la versión de terraform que queremos utilizar, esto no es obligatorio pero si recomendable, estamos declarando que la plantilla será compatible minimo con la versión *0.12.24*.
- **provider:** A continuación vamos a poner la configuración del provider, donde pondremos el provider que vamos a usar, en este caso AWS.
- **region:** Tendremos que poner la misma región que hemos puesto en AWS, en este caso, *"eu-west-1"*
- **allowed_account_ids:** Esto son las cuentas de AWS, en las que va a estar permitido, que se creen recursos.
- **profile:** Aquí tendremos que poner el profile que hemos creado en el fichero *"~/.aws/credentials"*.

Una vez configurado nos dirigimos a la terminal de *pycharm* y entrando en el directorio que acabamos de crear vamos a ejecutar el siguiente comando.

    terraform init

Esto inicializa nuestro proyecto en este directorio. Lo primero que hace es ver todos los providers que están declarados y los descarga.


![](https://i.imgur.com/mIuyhV7.png)

```
(venv) ernesto@honda:~/PycharmProjects/proyectoernesto/providers$ terraform init

Initializing the backend...

Initializing provider plugins...
- Checking for available provider plugins...
- Downloading plugin for provider "aws" (hashicorp/aws) 2.54.0...

The following providers do not have any version constraints in configuration,
so the latest version was installed.

To prevent automatic upgrades to new major versions that may contain breaking
changes, it is recommended to add version = "..." constraints to the
corresponding provider blocks in configuration, with the constraint strings
suggested below.

* provider.aws: version = "~> 2.54"

Terraform has been successfully initialized!

You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure. All Terraform commands
should now work.

If you ever set or change modules or backend configuration for Terraform,
rerun this command to reinitialize your working directory. If you forget, other
commands will detect it and remind you to do so if necessary.
```

Una vez terminado, veremos que se ha creado un directorio llamado *".terraform"*, aquí podemos ver los plugins que estamos utilizando y el binario del provider de AWS para terraform, llamado *terraform-provider-awsv2.54.0x4*.

![](https://i.imgur.com/J9BHXeX.png)

# Plantilla de Terraform simple

## Crear recursos

Una vez comfigurado el provider de AWS, vamos a crear nuestro primer recurso. Para ello he creado un nuevo directorio y hemos copiado el fichero de configuración *main.tf*, que hemos creado previamente.

![](https://i.imgur.com/4o8UzKU.png)

A partir de esta configuración vamos a crear un recurso, en este caso será *VPC*.

```
resource "aws_vpc" "vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support = true
  
  tags = {
    Name = "proyectoterra"
  }
}
```

![](https://i.imgur.com/V88rJoR.png)

Vamos a ver las variables que vamos a configurar: 

- **resource:** Aquí vamos a definir el tipo de recurso que vamos a realizar para ello pondremos el nombre del recurso dentro del provider de AWS seguido del nombre de nuestra plantilla.
- **cidr_block:** Para crear una VPC en AWS, necesitamos pasarle el bloque del segmento IP que queremos que tenga la VPC. 
- **enable_dns_hostnames y enable_dns_support:** Estos dos recursos son para que las instancias que lancemos dentro de la VPC, tengan acceso a un DNS interno y puedan resolverse entre ellas mismas.
- **tags:** Etiquetar el recurso.

Una vez terminado de configurar esto, ya tendremos creado la definicion del primer recurso.

Para aplicarlo primero vamos a ejecutar el comando *terraform plan*. Este paso es muy recomendable ya que verificará que tiene la plantilla y si ese recurso esta previamente creado en AWS. 

```
Refreshing Terraform state in-memory prior to plan...
The refreshed state will be used to calculate this plan, but will not be
persisted to local or remote state storage.


------------------------------------------------------------------------

Error: No valid credential sources found for AWS Provider.
        Please see https://terraform.io/docs/providers/aws/index.html for more information on
        providing credentials for the AWS Provider

  on main.tf line 5, in provider "aws":
   5: provider "aws" {
```

Como se puede apreciar parece que no ha podido conectar con el *provider de AWS*. Vamos a solucionarlo de la siguiente forma:

Para realizar la configuración de las credenciales yo lo he realizado con

```
root@honda:~# aws configure
```

Este comando te pedirá las siguientes credenciales:

- AWS Access Key ID
- AWS Secret Access Key
- Default region name
- Default output format

El problema viene a que parece que no te crea correctamente el directorio `.aws` en el home del usuario. Por lo tanto he tenido que crear yo a mano dicho directorio y el fichero llamado `credentials`, donde meteremos los nombrados anteriormente.

Posteriormente, ya conectaría con el provider de AWS correctamente y lo podremos ver con el comando `terraform plan`.

```
(venv) ernesto@honda:~/PycharmProjects/proyectoterra/2-primertemplate$ terraform plan
Refreshing Terraform state in-memory prior to plan...
The refreshed state will be used to calculate this plan, but will not be
persisted to local or remote state storage.


------------------------------------------------------------------------

An execution plan has been generated and is shown below.
Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # aws_vpc.vpc will be created
  + resource "aws_vpc" "vpc" {
      + arn                              = (known after apply)
      + assign_generated_ipv6_cidr_block = false
      + cidr_block                       = "10.0.0.0/16"
      + default_network_acl_id           = (known after apply)
      + default_route_table_id           = (known after apply)
      + default_security_group_id        = (known after apply)
      + dhcp_options_id                  = (known after apply)
      + enable_classiclink               = (known after apply)
      + enable_classiclink_dns_support   = (known after apply)
      + enable_dns_hostnames             = true
      + enable_dns_support               = true
      + id                               = (known after apply)
      + instance_tenancy                 = "default"
      + ipv6_association_id              = (known after apply)
      + ipv6_cidr_block                  = (known after apply)
      + main_route_table_id              = (known after apply)
      + owner_id                         = (known after apply)
      + tags                             = {
          + "Name" = "proyectoterra"
        }
    }

Plan: 1 to add, 0 to change, 0 to destroy.

------------------------------------------------------------------------

Note: You didn't specify an "-out" parameter to save this plan, so Terraform
can't guarantee that exactly these actions will be performed if
"terraform apply" is subsequently run.
```

El resultado es que tiene que crear un nuevo recurso *(Plan: 1 to add)*, también se puede apreciar los cambios que va a realizar, entre ellos los configurados en el recurso.

Una vez terminado esta instrucción, podremos proceder con el aplicado. Para ello vamos a ejecutar el comando *terraform apply*. Este proceso se conectará con el provider de AWS y se creará la VPC que hemos mandado a crear. El tiempo que tarde la creación dependerá de la cantidad de recursos que tenga que crear. 

```
(venv) ernesto@honda:~/PycharmProjects/proyectoterra/2-primertemplate$ terraform apply

An execution plan has been generated and is shown below.
Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # aws_vpc.vpc will be created
  + resource "aws_vpc" "vpc" {
      + arn                              = (known after apply)
      + assign_generated_ipv6_cidr_block = false
      + cidr_block                       = "10.0.0.0/16"
      + default_network_acl_id           = (known after apply)
      + default_route_table_id           = (known after apply)
      + default_security_group_id        = (known after apply)
      + dhcp_options_id                  = (known after apply)
      + enable_classiclink               = (known after apply)
      + enable_classiclink_dns_support   = (known after apply)
      + enable_dns_hostnames             = true
      + enable_dns_support               = true
      + id                               = (known after apply)
      + instance_tenancy                 = "default"
      + ipv6_association_id              = (known after apply)
      + ipv6_cidr_block                  = (known after apply)
      + main_route_table_id              = (known after apply)
      + owner_id                         = (known after apply)
      + tags                             = {
          + "Name" = "proyectoterra"
        }
    }

Plan: 1 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

aws_vpc.vpc: Creating...
aws_vpc.vpc: Creation complete after 4s [id=vpc-06b4d16da5ed52bd4]

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
```

Una vez terminado la creación de la VPC podemos ir a la consola de AWS y ver los cambios.

![](https://i.imgur.com/Nw4evz9.png)

Se puede apreciar que esta creada la VPC que acabamos de crear con el tag *proyectoterra* y el rango *IP*, que hemos configurado previamente. En la descripción del servicio podemos ver también que esta habilitados los parámetros de DNS que hemos configurado.

Si volvemos a realizar la instrucción *terraform plan* podremos ver que no hay ningun cambio a realizar.

```
(venv) ernesto@honda:~/PycharmProjects/proyectoterra/2-primertemplate$ terraform plan
Refreshing Terraform state in-memory prior to plan...
The refreshed state will be used to calculate this plan, but will not be
persisted to local or remote state storage.

aws_vpc.vpc: Refreshing state... [id=vpc-06b4d16da5ed52bd4]

------------------------------------------------------------------------

No changes. Infrastructure is up-to-date.

This means that Terraform did not detect any differences between your
configuration and real physical resources that exist. As a result, no
actions need to be performed.
```

## Ficheros de estados

Podemos apreciar que en nuestra plantilla se creó un fichero llamado terraform.tfstate, dentro de este podremos ver el estado de lo creado en AWS.

![](https://i.imgur.com/vrdlM29.png)

En la parte de recursos, esta declarado un recuso de tipo *aws_vpc* y todos los atributos por defecto y los que hemos declarado previamente.

### ¿Cómo se reflejan los cambios en el fichero de estado?

Para ello vamos a modificar los parámetros del DNS dentro del recurso de la VPC y ver como se reflejan los cambios.

```
resource "aws_vpc" "vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = false
  enable_dns_support = false
  tags = {
    Name = "proyectoterra"
  }
}
```

Una vez cambiado tendremos que realizar la instrucción *terraform plan* para ver los cambios que hemos hecho.

```
(venv) ernesto@honda:~/PycharmProjects/proyectoterra/2-primertemplate$ terraform plan
Refreshing Terraform state in-memory prior to plan...
The refreshed state will be used to calculate this plan, but will not be
persisted to local or remote state storage.

aws_vpc.vpc: Refreshing state... [id=vpc-06b4d16da5ed52bd4]

------------------------------------------------------------------------

An execution plan has been generated and is shown below.
Resource actions are indicated with the following symbols:
  ~ update in-place

Terraform will perform the following actions:

  # aws_vpc.vpc will be updated in-place
  ~ resource "aws_vpc" "vpc" {
        arn                              = "arn:aws:ec2:eu-west-1:559488328847:vpc/vpc-06b4d16da5ed52bd4"
        assign_generated_ipv6_cidr_block = false
        cidr_block                       = "10.0.0.0/16"
        default_network_acl_id           = "acl-0d8b7b17f68047336"
        default_route_table_id           = "rtb-0318d69f9a93985b5"
        default_security_group_id        = "sg-0347d97389bc0f071"
        dhcp_options_id                  = "dopt-fdaff49b"
        enable_classiclink               = false
        enable_classiclink_dns_support   = false
      ~ enable_dns_hostnames             = true -> false
      ~ enable_dns_support               = true -> false
        id                               = "vpc-06b4d16da5ed52bd4"
        instance_tenancy                 = "default"
        main_route_table_id              = "rtb-0318d69f9a93985b5"
        owner_id                         = "559488328847"
        tags                             = {
            "Name" = "proyectoterra"
        }
    }

Plan: 0 to add, 1 to change, 0 to destroy.

------------------------------------------------------------------------

Note: You didn't specify an "-out" parameter to save this plan, so Terraform
can't guarantee that exactly these actions will be performed if
"terraform apply" is subsequently run.
```

Se puede apreciar que hay un cambio que se puede realizar y los cambios son los siguientes:

```
      ~ enable_dns_hostnames             = true -> false
      ~ enable_dns_support               = true -> false
```

También tengo que añadir que el cambio que va a realizar es `~ update in-place`, esto significa que no hace falta eliminar el recurso y volverlo a crear.

Vamos a realizar los cambios con *terraform apply*.

```
(venv) ernesto@honda:~/PycharmProjects/proyectoterra/2-primertemplate$ terraform apply
aws_vpc.vpc: Refreshing state... [id=vpc-06b4d16da5ed52bd4]

An execution plan has been generated and is shown below.
Resource actions are indicated with the following symbols:
  ~ update in-place

Terraform will perform the following actions:

  # aws_vpc.vpc will be updated in-place
  ~ resource "aws_vpc" "vpc" {
        arn                              = "arn:aws:ec2:eu-west-1:559488328847:vpc/vpc-06b4d16da5ed52bd4"
        assign_generated_ipv6_cidr_block = false
        cidr_block                       = "10.0.0.0/16"
        default_network_acl_id           = "acl-0d8b7b17f68047336"
        default_route_table_id           = "rtb-0318d69f9a93985b5"
        default_security_group_id        = "sg-0347d97389bc0f071"
        dhcp_options_id                  = "dopt-fdaff49b"
        enable_classiclink               = false
        enable_classiclink_dns_support   = false
      ~ enable_dns_hostnames             = true -> false
      ~ enable_dns_support               = true -> false
        id                               = "vpc-06b4d16da5ed52bd4"
        instance_tenancy                 = "default"
        main_route_table_id              = "rtb-0318d69f9a93985b5"
        owner_id                         = "559488328847"
        tags                             = {
            "Name" = "proyectoterra"
        }
    }

Plan: 0 to add, 1 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

aws_vpc.vpc: Modifying... [id=vpc-06b4d16da5ed52bd4]
aws_vpc.vpc: Modifications complete after 3s [id=vpc-06b4d16da5ed52bd4]

Apply complete! Resources: 0 added, 1 changed, 0 destroyed.
```

Ya podremos verlo reflejado en la consola de AWS y en el fichero de estado.

![](https://i.imgur.com/Vq7jHDK.png)

A continuación se puede observar que se ha creado el fichero de estado y un backup del anterior fichero de estado, terraform siempre salva un backup del fichero de estado anterior por si algo falla se pueda recuperar el estado anterior. 

- Fichero de estado actual:

![](https://i.imgur.com/fLt2I00.png)

- Fichero de estado backup:

![](https://i.imgur.com/DJklcdR.png)

### Editando desde la consola de AWS

Vamos a ver como reflajan los cambios si editamos los cambios dentro de la consola de AWS sin pasar por terraform.

![](https://i.imgur.com/0mh2JJi.png)

![](https://i.imgur.com/L9Kl7YK.png)

![](https://i.imgur.com/XVpwAZT.png)

Ahora tendremos que realizar la instrucción *terraform plan*.

Como podemos ver terraform dice que en la cuenta de *AWS* estos dos atributos están en *true*, mientras que en su definición están en *false*:

```
      ~ enable_dns_hostnames             = true -> false
      ~ enable_dns_support               = true -> false
```

En el caso de realizar *terraform apply* va a realizar la modificación de los cambios. De esta manera podremos garantizar tener versionada nuestra infraestructura, saber si se hizo algún cambio manual de los recursos de *AWS*.

### Cambio que eliminen y vuelvan a crear el recurso

Hata ahora todos los cambios que hemos realizado han sido *update in-place*, vamos a ver como se han los cambios que implique eliminar un recurso y crear otro.

Para ello vamos a modificar el rango de IP de la *VPC*.

```
resource "aws_vpc" "vpc" {
  cidr_block = "10.8.0.0/16"
  enable_dns_hostnames = false
  enable_dns_support = false
  tags = {
    Name = "proyectoterra"
  }
}
```

Podremos ver que he cambiaro el rango de IP de la *10.0.0.0/16* a la *10.8.0.0/16*. Este cambio no se puede hacer *in-place*.

Al igual que antes vamos a realizar las instrucciones *terraform plan* y *terraform apply*.

Ya tendremos la nueva *VPC* creada, ahora solamente tendremos que actualizar *AWS* y veremos que ha cambiado el *ID* y el *segmento de red* por el indicado previamente.

![](https://i.imgur.com/fwWTZuu.png)

## Variables

Las *variables* nos van a dar la posibilidad de crear plantillas que sean modificables posteriormente y reutilizables, utilizando solamente un fichero de variables, donde vamos a tener definidos todos las variables que podamos utilizar en la plantilla.

Lo primero que tenemos que hacer es crear dicho fichero de variables, en mi caso le vamos a llamar *variables.tf*.

Vamos a añadir el recurso tipo *variable* y le vamos a indicar que cambie el *cidr* de nuestra *VPC.*

```
variable "cidr" {
  type = string
  default = "10.0.0.0/16"
}
```

Para que utilice la variable *cidr* que hemos declarado, solamente tendremos que definirlo en el recurso de la VPC.

```
resource "aws_vpc" "vpc" {
  cidr_block = var.cidr
  enable_dns_hostnames = false
  enable_dns_support = false
  tags = {
    Name = "proyectoterra"
  }
}
```

Para ver los cambios vamos a realizar el comando *terraform plan* y para aplicarlos realizaremos *terraform apply*.

![](https://i.imgur.com/3CSz4qK.png)

Si nos vamos a la consola de AWS, podememos ver que nuestra VPC está creada nuevamente con el *CIDR 10.0.0.0/16*.

La idea es que podamos parametrizar nuestras plantillas y que todos los cambios que podamos hacer sean directamente en el fichero de variables y no tener que modificar todas las definiciones de los recursos de la plantilla.

## Outputs

A continuación vamos a crear una *instancia EC2* y vamos a ver como obtener un *output* de la propia instancia.

Para ello vamos a crear un nuevo fichero llamado *webserver.tf*. Los atributos minimos que necesita el recurso para crear una instancia en *AWS.*

- ami: 
- instance_type: las instancias *t2.micro* te ofrecen 750 horas gratuitas durante el primer año.

![](https://i.imgur.com/6tiyCBu.png)


En el fichero de variables agregamos el *ami_id* y el *instance_type*.
```
variable "ami_id" {
  type = string
  default = "ami-0e61341fa75fcaa18"
}

variable "instance_type" {
  type = string
  default = "t2.micro"
}
```

En el fichero *webserver.tf* pondremos lo siguiente:

```
resource "aws_instance" "web-server" {
  ami = var.ami_id
  instance_type = var.instance_type
}
```

Vamos a crear un nuevo fichero *outputs* y crearemos su recurso.

```
output "server-ip" {
  value = "${aws_instance.web-server.public_ip}"
}
```

Una vez terminado, vamos a realizado *terraform plan* y *terraform apply*.

Se puede apreciar que al agregar nuestro *output* vemos un clave-valor con la IP pública de la instancia. Si nos vamos a la consola de AWS veremos que ya está creada dicha instancia.

![](https://i.imgur.com/jZJMguh.png)

Vamos a pobrar a cambiar el tipo de instancia, vamos a cambiar de *micro* a *small* la variable.

```
variable "instance_type" {
  type = string
  default = "t2.small"
}
```

Este cambio se puede hacer *in-place*, eso implica que no hace falta eliminar la instancia y crearla. Podemos verlo realizando las instrucciones de *terraform plan*.

Cambio que va a realizar:

```
      ~ instance_type                = "t2.micro" -> "t2.small"
```

Vamos a realizar *terraform apply*.

Mientras realizamos la instrucción podremos ver que AWS está apagando la instancia, a pesar de que se pueda hacer *in-place*.

![](https://i.imgur.com/1fxehmO.png)

Una vez acabe ya podremos ver que ha cambiado el tipo de instancia a *t2.small* y que esta en estado *running*.

![](https://i.imgur.com/yAZoMhF.png)

Si en un momento determinado queremos recuperar el output de una plantilla de terraform podremos utilizar el comando *terraform output*.

```
(venv) ernesto@honda:~/PycharmProjects/proyectoterra/2-primertemplate$ terraform output
server-ip = 34.245.166.242
```

## Data Source

Los Data Source son fuentes de datos que nos proporciona el provider y que nosotros podemos sobre ellas buscar y crear recursos referenciando a esas fuentes de datos. Estas no están incluidas dentro de la plantilla de terraform.

En la [documentación oficial](https://www.terraform.io/docs/providers/aws/index.html) podremos encontrar la lista de data sources que soporta el provider de AWS. 

### ¿Cómo definiremos una fuente de datos?

- *webserver.tf*

```
data "aws_availability_zones" "az"{

}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners = ["099720109477"]

  filter {
    name = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-xenial-16.04-amd64-server-*"]
  }
}

resource "aws_instance" "web-server" {
  ami = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
}
```

Vamos a explicar que es cada parámetro:

 - *data "aws_availability_zones"*: En primer lugar queremos consultar la fuente de datos *aws_availability_zones* junto al nombre *az*.

Si queremos filtrar o buscar la última versión de ubuntu disponible crearemos otro data para buscar dicho *ID*:

 - *data "aws_ami"*: Aquí le pondremos un nombre 
 - *most_recent*: Aquí le diremos que obtenga la última versión de ubuntu. 
 - *owners*: ID del owner del ami de ubuntu.
 - *filter*: Filtraremos por el nombre y por el valor.

También tendremos que cambiar nuestra instancia para utilizar la ami que estamos buscando mediante el data source.

- output.tf

```
output "az" {
  value = "${data.aws_availability_zones.az.names}"
}
```

 - Aquí vamos a referenciar los data sources que hemos definido.

Vamos a cambiar tambien el tipo de instancia de *small* a *micro* en el fichero variables. Por último vamos a realizar la instrucción *terraform plan*.

Una vez acabado la busqueda de los data sources, nos dirá que tiene que sustituir la instancia que teniamos crear porque la *ami* que estamos utilizando es otra, antes estabamos utilizando una de *Amazon Linux* y ahora vamos a utilizar una de *ubuntu*.

A continuación realizamos el comando *terraform apply*.

```
(venv) ernesto@honda:~/PycharmProjects/proyectoterra/2-primertemplate$ terraform apply
data.aws_availability_zones.az: Refreshing state...
data.aws_ami.ubuntu: Refreshing state...
aws_vpc.vpc: Refreshing state... [id=vpc-0b59a62e1da37f376]
aws_instance.web-server: Refreshing state... [id=i-0da8f4b3397eb7a82]

Apply complete! Resources: 0 added, 0 changed, 0 destroyed.

Outputs:

az = [
  "eu-west-1a",
  "eu-west-1b",
  "eu-west-1c",
]
server-ip = 34.244.240.227
```

Nos devuelve directamente las 3 zonas de disponibilidad que hay dentro de la región de Irlanda *(eu-west-1)*.

![](https://i.imgur.com/Zz91RoA.png)

Desde la consola de *AWS*, podremos ver que ya está lanzada nuestra instancia con la nueva AMI de ubuntu que según los filtros que hemos creado es la ultima versión.

## Templates

Vamos a utlizar un template para crear un *userdata*, este es una funcionalidad que tiene las instancias de AWS que te dejan ejecutar scripts, con variables 
y sustituir dichas variables.

Para ello vamos a crear un nuevo directorio, llamado *templates* y un nuevo fichero, llamado *userdata.tpl*, en este fichero va a ser donde tendriamos nuestro script.

 ```
#!/bin/bash
yum install ${webserver} --assumeyes
service ${webserver} start
```

Ahora nos iremos al fichero de configuración *webserver.tf* y agregar el nuevo *data source* tipo *template_file*

```
data "template_file" "userdata" {
  template = "${file("templates/userdata.tpl")}"
  vars {
    webserver = "apache2"
  }
}
```

Para insertar el userdata a la instancia añadimos lo siguiente:

```
resource "aws_instance" "web-server" {
  ami = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  user_data = "${data.template_file.userdata.rendered}"
}
```

A continuación realizamos las instrucciones de *terraform init*, *terraform plan* y *terraform apply*.

Ya se hizo el reciclado de instancias y se eliminó la instancia anterior, podremos ver que se ha creado la nueva y con el userdata aplicado.

![](https://i.imgur.com/yXTePFj.png)

A continuación entramos en *View/Change User Data*

![](https://i.imgur.com/GPbH4lf.png)

Podremos ver que ya esta incluido el *template* de *user data* ya renderizado.

![](https://i.imgur.com/MSyapOU.png)

# Importar recursos existentes.

Normalmente las plantillas que diseñemos están creadas desde el inicio con *terraform* pero muchas veces van a convivir con otra infraestructura que no este creada con *terraform* o ya tenemos dicha estructura y la queremos importar y empezar a gestionarla con *terraform*. Estas opciones es posible gracias a *terraform*. A continuación vamos a ver como se importan los recursos y como podemos modificar recusos ya importados.

Vamos a partir de la instancia de AWS ya creada y lo que vamos a hacer es importar dicha instancia en nuestra plantilla de terraform.

Vamos crear un nuevo fichero de configuración llamado *ec2.tf*. Para importar un recurso hay un requisito inicial, tenerlo declarado como recurso. Los atributos mínimos que tiene que tener un recurso de la instancia de AWS son *ami* y *instancetype*.

La ami que vamos a utilizar es la siguiente:

![](https://i.imgur.com/QyPKyiL.png)

```
resource "aws_instance" "web" {
  ami = "ami-034d940df32c75d15"
  instance_type = "t2.micro"
}
```

Primero vamos a realizar el comando *terraform init*, ya que es una nueva plantilla de terraform y para importar la instancia relizamos la siguiente instrucción:

    terraform import aws_instance.web i-08c5c696e16227631

Pondremos el comando *terraform import*, seguido del tipo de recurso, el nombre que le pusimos en la plantilla y el *ID de AWS* que lo podemos ver en la consola:

![](https://i.imgur.com/AYNMZhm.png)

```
(venv) ernesto@honda:~/PycharmProjects/proyectoterra/3-impotarrecursos$ terraform import aws_instance.web i-08c5c696e16227631
aws_instance.web: Importing from ID "i-08c5c696e16227631"...
aws_instance.web: Import prepared!
  Prepared aws_instance for import
aws_instance.web: Refreshing state... [id=i-08c5c696e16227631]

Import successful!

The resources that were imported are shown above. These resources are now in
your Terraform state and will henceforth be managed by Terraform.
```

Este comando importará la instancia en el fichero de estado de terraform.

```
{
  "version": 4,
  "terraform_version": "0.12.24",
  "serial": 1,
  "lineage": "049399e9-56de-4358-caa4-41c4ec621dc5",
  "outputs": {},
  "resources": [
    {
      "mode": "managed",
      "type": "aws_instance",
      "name": "web",
      "provider": "provider.aws",
      "instances": [
        {
          "schema_version": 1,
          "attributes": {
            "ami": "ami-01793b684af7a3e2c",
            "arn": "arn:aws:ec2:eu-west-1:559488328847:instance/i-08c5c696e16227631",
            "associate_public_ip_address": true,
            "availability_zone": "eu-west-1a",
            "cpu_core_count": 1,
            "cpu_threads_per_core": 1,
            "credit_specification": [
              {
                "cpu_credits": "standard"
              }
            ],
            "disable_api_termination": false,
            "ebs_block_device": [],
            "ebs_optimized": false,
            "ephemeral_block_device": [],
            "get_password_data": false,
            "hibernation": false,
            "host_id": null,
            "iam_instance_profile": "",
            "id": "i-08c5c696e16227631",
            "instance_initiated_shutdown_behavior": null,
            "instance_state": "running",
            "instance_type": "t2.micro",
            "ipv6_address_count": 0,
            "ipv6_addresses": [],
            "key_name": "",
            "monitoring": false,
            "network_interface": [],
            "network_interface_id": null,
            "password_data": "",
            "placement_group": "",
            "primary_network_interface_id": "eni-0f86245b92f72f494",
            "private_dns": "ip-172-31-14-32.eu-west-1.compute.internal",
            "private_ip": "172.31.14.32",
            "public_dns": "ec2-54-194-156-115.eu-west-1.compute.amazonaws.com",
            "public_ip": "54.194.156.115",
            "root_block_device": [
              {
                "delete_on_termination": true,
                "encrypted": false,
                "iops": 100,
                "kms_key_id": "",
                "volume_id": "vol-0f86e5e31a5923600",
                "volume_size": 8,
                "volume_type": "gp2"
              }
            ],
            "security_groups": [
              "default"
            ],
            "source_dest_check": true,
            "subnet_id": "subnet-9defb5fb",
            "tags": {},
            "tenancy": "default",
            "timeouts": {
              "create": null,
              "delete": null,
              "update": null
            },
            "user_data": "79ea7deb4a2e9444b091cac314596864628e978e",
            "user_data_base64": null,
            "volume_tags": {},
            "vpc_security_group_ids": [
              "sg-791b6435"
            ]
          },
          "private": "eyJlMmJmYjczMC1lY2FhLTExZTYtOGY4OC0zNDM2M2JjN2M0YzAiOnsiY3JlYXRlIjo2MDAwMDAwMDAwMDAsImRlbGV0ZSI6MTIwMDAwMDAwMDAwMCwidXBkYXRlIjo2MDAwMDAwMDAwMDB9LCJzY2hlbWFfdmVyc2lvbiI6IjEifQ=="
        }
      ]
    }
  ]
}
```

Se puede ver que que hay un recurso de tipo *aws_instance* y con sus atributos.

A continuación vamos a cambiar el tipo de instancia de *t2.micro* a *t2.small* y vamos a agregarle un tag. Realizaremos el comando *terraform plan* para ver los cambios y un *terraform apply* para aplicar los cambios.

```
resource "aws_instance" "web" {
  ami = "ami-034d940df32c75d15"
  instance_type = "t2.small"
  tags = {
    Name = "proyectoterra-webserver"
  }
}
```

Por último vamos a la consola de AWS y veremos que se ha cambiado el tipo de instancia de *micro* a *small* y se va a poner el tag nombre.

![](https://i.imgur.com/9a03DeF.png)

Con esta sencilla forma podremos aparte de crear una infraestructura de cero, existe la opción de integrar recursos fuera de *terraform* y ponerlos en una plantilla y empezar a gestionarlo mediante dicha plantilla de *terraform*.

# Plantilla de Terraform avanzada

## Crear recursos

Una funcionalidad que tiene *terraform* que no poseen otros orquestadores de infraestructura como códigos es poder crear N recursos de un mismo tipo.

Vamos a crear los siguientes ficheros:

- main.tf

```
terraform {
  required_version = ">= 0.12.24"
}

provider "aws" {
  region = "eu-west-1"
  allowed_account_ids = ["559488328847"]
  profile = "proyectoterra"
}
```

- variables.tf

```
variable "instance_type" {
  type = string
  default = "t2.micro"
}

variable "region" {
  type = string
  default = "eu-west-1"
}

variable "aws_id" {
  type = string
  default = "559488328847"
}

variable "aws_amis" {
  type = map
  default = {
    "eu-west-1" = "ami-034d940df32c75d15"
    "us-east-1" = "ami-09a5b0b7edf08843d"
    "eu-central-1" = "ami-0df53967dc6eab09d"
  }
}
```

Ahora cuando queramos cargar el ID de la AMI que queramos utilizar independiente de la región, se va a utilizar una ami u otra. También hemos definido una variable región.

- webserver.tf

```
resource "aws_instance" "webservers" {
  ami = lookup(var.aws_amis, var.region)
  instance_type = var.instance_type
  count = 3
  tags = {
    Name = "webservers"
  }
}
```

Hay un método propio de terraform llamado *lookup*, donde le tendremos que pasar la variable que queremos buscar. Para buscar N recursos, terraform nos proporciona el recurso *count*, donde le indicaremosla cantidad de recuros que queremos obtener, tambien le indicaremos un nombre.

Volvemos a realizar las instrucciones *terraform plan* y *terraform apply*.

Como podemos observar a pesar de tener un solo recurso el plan dice que va a crear tres instancias.

```
 # aws_instance.webservers[0] will be created
 # aws_instance.webservers[1] will be created
 # aws_instance.webservers[2] will be created
```

Una vez terminado, podemos ver en la consola de AWS las tres instancias  

![](https://i.imgur.com/f3SG2Dm.png)

## Reutilizar plantillas

Vamos a crear un nuevo directorio donde vamos a tener los siguientes ficheros:

- main.tf

```
terraform {
  required_version = ">= 0.12.24"
}

provider "aws" {
  region = var.region
  allowed_account_ids = [var.aws_id]
  profile = "proyectoterra"
}
```

- variables.tf

```
variable "instance_type" {
  type = string
  default = "t2.micro"
}

variable "region" {
  type = string
  default = "eu-west-1"
}

variable "aws_id" {
  type = string
  default = "559488328847"
}

variable "aws_amis" {
  type = map
  default = {
    "eu-west-1" = "ami-034d940df32c75d15"
    "us-east-1" = "ami-09a5b0b7edf08843d"
    "eu-central-1" = "ami-0df53967dc6eab09d"
  }
}

variable "project" {
  type = string
  default = "web"
}

variable "environment" {
  type = string
  default = "prod"
}
```

- elb.tf

Este fichero será el balanceador de *AWS*, para crearlo utilizaremos el data source *aws_availability_zones* y el recurso *aws_elb*. Por último *availability_zones* va a devolver una lista con los nombres de las zonas de disponibilidad.

```
data "aws_availability_zones" "az" {}

resource "aws_elb" "elb-web" {
  name_prefix = var.project

  listener {
    instance_port = 50
    instance_protocol = "http"
    lb_port = 80
    lb_protocol = "http"
  }

  availability_zones = data.aws_availability_zones.az.names
}
```

Realizamos *terraform apply* para aplicar los cambios y una vez terminado, ya estaria creado el balanceador dentro de la consola de *AWS*. Podremos verlo si nos vamos al apartado de *"Load Balancers"*:

![](https://i.imgur.com/zCAlqnI.png)

El nombre que nos proporciona es *web*, siendo este el nombre que le hemos definido en el fichero de variables, seguido de un *ID*, este *ID* está basado en la fecha de creación. Esto se realiza ya que dentro de AWS los balanceadores tiene que tener nombres únicos, porque en base al balanceador se genera el registro DNS.

## Enlazar recursos I

Partiendo de del fichero de variables y del fichero de la VPC anterior. Vamos a realizar los siguientes cambios.

- vpc.tf

Vamos a crear dos subnet privadas y dos públicas y lo vamos a realizar como variables. 

Con el atributo *map_public_ip_on_launch* le diremos que las instancias se levanten directamente con una IP pública. También le diremos las zonas de disponibilidad que queremos que estas subnet se levanten, con el atributo *availability_zone*.

```
resource "aws_vpc" "vpc" {
  cidr_block = var.cidr
  enable_dns_hostnames = false
  enable_dns_support = false
  tags = {
    Name = "proyectoterra"
  }
}

resource "aws_subnet" "pub1" {
  cidr_block = var.pub1_cidr
  vpc_id = aws_vpc.vpc.id
  map_public_ip_on_launch = true
  availability_zone = data.aws_availability_zones.az.names[0]
  tags = {
    Name = "pub1"
  }
}

resource "aws_subnet" "pub2" {
  cidr_block = var.pub2_cidr
  vpc_id = aws_vpc.vpc.id
  map_public_ip_on_launch = true
  availability_zone = data.aws_availability_zones.az.names[1]
  tags = {
    Name = "pub2"
  }
}

resource "aws_subnet" "pri1" {
  cidr_block = var.pri1_cidr
  vpc_id = aws_vpc.vpc.id
  map_public_ip_on_launch = true
  availability_zone = data.aws_availability_zones.az.names[0]
  tags = {
    Name = "pri1"
  }
}

resource "aws_subnet" "pri2" {
  cidr_block = var.pri2_cidr
  vpc_id = aws_vpc.vpc.id
  map_public_ip_on_launch = true
  availability_zone = data.aws_availability_zones.az.names[1]
  tags = {
    Name = "pri2"
  }
}
```

La última configuración que vamos a realizar de este fichero de configuración será añadir un internet gateway que va a garantizar la salida del tráfico.

```
resource "aws_route" "default_route" {
  route_table_id = aws_vpc.vpc.default_route_table_id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id = aws_internet_gateway.igw.id
}
```

- variables.tf

Vamos a agregar 4 variables nuevas, de los 4 subnet que vamos a crear, 

```
variable "aws_region" {
  type = string
  default = "eu-west-1"
}
variable "cidr" {
  type = string
  default = "10.0.0.0/16"
}

variable "pub1_cidr" {
  type = string
  default = "10.0.0.0/24"
}

variable "pub2_cidr" {
  type = string
  default = "10.0.1.0/24"
}

variable "pri1_cidr" {
  type = string
  default = "10.0.10.0/24"
}

variable "pri2_cidr" {
  type = string
  default = "10.0.11.0/24"
}

variable "instance_type" {
  type = string
  default = "t2.micro"
}

variable "region" {
  type = string
  default = "eu-west-1"
}

variable "aws_id" {
  type = string
  default = "559488328847"
}

variable "aws_amis" {
  type = map
  default = {
    "eu-west-1" = "ami-034d940df32c75d15"
    "us-east-1" = "ami-09a5b0b7edf08843d"
    "eu-central-1" = "ami-0df53967dc6eab09d"
  }
}

variable "project" {
  type = string
  default = "web"
}

variable "environment" {
  type = string
  default = "prod"
}
```

El siguiente paso es crear un fichero llamado *security_groups.tf* Tendremos que crear 2 *security groups*, uno para el balanceador y otro para las instancias. También tendremos que decirle en que vpc va a estar creado este security group y tendremos que crear reglas de entrada *(ingress)* y de salida *(egress)*.

- Security Group del balanceador

```
resource "aws_security_group" "elb-sg" {
  name = "elb-sg"
  vpc_id = aws_vpc.vpc.id
  ingress {
    from_port = 80
    protocol = "tcp"
    to_port = 80
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port = 0
    protocol = "-1"
    to_port = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

- Security Group de las instancias

Las instancias solo van a recibir tráfico solo al puerto 80, y en este caso el origen de las conexiones del tráfico al puerto 80 de las instancias no va a ser un *CIDR* como en el balanceador sino que va a ser el Security Group del balanceador, las instancias van a permitir conexiones desde cualquier origen que tenga como security group del balanceador.

```
resource "aws_security_group" "web-sg" {
  name = "web-sg"
  vpc_id = aws_vpc.vpc.id
  ingress {
    from_port = 80
    protocol = "tcp"
    to_port = 80
    security_groups = ["${aws_security_group.elb-sg.id}"]
  }
  egress {
    from_port = 0
    protocol = "-1"
    to_port = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

Ya tenemos creados los dos security groups para el balanceador y para las instancias.

Ahora vamos a configurar el balanceador (*elb.tf*). Vamos a agragarle el atributo *cross_zone_load_balancing* para que el balanceador distribuya el tráfico equitativamente entre las tres regiones y vamos a definir las subnets donde el balanceador va a enviar el tráfico.

```
resource "aws_elb" "elb-web" {
  name = "${var.environment}-${var.project}"
  cross_zone_load_balancing = true
  subnets = ["${aws_subnet.pub1.id}", "${aws_subnet.pub2.id}"]

  listener {
    instance_port = 80
    instance_protocol = "http"
    lb_port = 80
    lb_protocol = "http"
  }
  security_groups = ["${aws_security_group.elb-sg.id}"]
  instances = aws_instance.webservers.*.id
}
```

Ahora vamos al fichero *webservers.tf* 

```
resource "aws_instance" "webservers" {
  ami = lookup(var.aws_amis, var.aws_region)
  instance_type = var.instance_type
  vpc_security_group_ids = ["${aws_security_group.web-sg.id}"]
  subnet_id = aws_subnet.pri1.id
  count = 2
  tags = {
    Name = "${var.environment}-webservers"
  }
}
```

Una vez terminado ya podremos realizar las instrucciones *terraform plan* y *terraform apply*. Si nos vamos a la consola de *AWS* podremos ver los resultados. 

Podemos ver la VPC creada:

![](https://i.imgur.com/MmqVBTk.png)

En el apartado *Subnets* podemos ver las cuatro subnets que hemos creado, dos privadas y dos públicas.

![](https://i.imgur.com/PQllpHh.png)

La tabla de rutas por defecto, tener en cuenta que en ningún momento hemos creado la tabla de rutas, sino que la referenciamos, ya que por defecto cuando creas la VPC, se crea una tabla de rutas y la podemos referencias desde terraform.

![](https://i.imgur.com/5GX6AjE.png)

También podemos ver el internet gateway que hemos creado, sin este paso la instrucción *terraform apply* nos daba error, solamente tenemos que crear este recurso en el fichero de *vpc.tf.*

![](https://i.imgur.com/KfNQP0j.png)

En la consola podemos ver el balanceador con dos instancias, podremos verlo en la columna de *Status*. 

```
Status    0 of 2 instances in service
```

Se puede observar que no están en servicio porque las instancias no tienen nada creado, el balanceador está intentando hacer un *Check* al puerto 80 y actualmente no hay ningún servicio web instalado.

![](https://i.imgur.com/RBhZbkr.png)

Por último podremos ver en el apartado de *Instaces*, las dos servidores creados y lanzados.

![](https://i.imgur.com/wibVMSk.png)

## Enlazar recursos II

Vamos a partir de la plantilla creada anteriormente, pero en vez de crear instancias de manera independiente, vamos a crear un [Auto Scaling](https://aws.amazon.com/es/autoscaling/).

Lo primero que vamos a hacer es añadir en el fichero de variables dos nuevas variables. Estas son el usuario para el RDS y su contraseña.

```
variable "rds_username" {
  type = string
  default = "root"
}

variable "rds_passwd" {
  type = string
  default = "evazgar123"
}
```

Para poder crear RDS vamos a necesitar un nuevo *Security Group* especifico para el RDS. El puerto será 3306 ya que la base de datos será MySQL. En la regla *ingress cidr_blocks* vamos a referenciar la IP de donde estamos, podremos verlo desde la siguiente [web](https://myip.es/)

```
resource "aws_security_group" "rds-sg" {
  name = "rds-sg"
  vpc_id = aws_vpc.vpc.id
  ingress {
    from_port = 3306
    protocol = "tcp"
    to_port = 3306
    security_groups = ["${aws_security_group.web-sg.id}"]
  }
  ingress {
    from_port = 3306
    protocol = "tcp"
    to_port = 3306
    cidr_blocks = ["87.218.169.230/32"]
  }
  egress {
    from_port = 0
    protocol = "-1"
    to_port = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

A continuación vamos a realizar la definición del fichero RDS. Lo primero que tenemos que hacer es crear un *subnet group*, donde vamos a definir los IDs de las subnets que queremos que las instancias de RDS se levante. 

```
resource "aws_db_subnet_group" "subn-groups" {
  subnet_ids = ["${aws_subnet.pri1.id}", "${aws_subnet.pri2.id}"]
}

resource "aws_db_instance" "mydb" {
  instance_class = "db.t2.micro"
  identifier = "mydb"
  username = var.rds_username
  password = var.rds_passwd
  engine = "mysql"
  allocated_storage = 10
  storage_type = "gp2"
  multi_az = false
  db_subnet_group_name = aws_db_subnet_group.subn-groups.name
  vpc_security_group_ids = ["${aws_security_group.rds-sg.id}"]
  publicly_accessible = true
  skip_final_snapshot = true
}
```

Por último vamos a crear el *Auto Scaling*, lo haremos en el fichero de *webserver.tf*. Lo primero que vamos a crear es *aws_launch_configuration*, esto es una plantilla, donde el *Auto Scaling* va a lanzar instancias.

```
resource "aws_launch_configuration" "web-server" {
  name_prefix = "web-server-"
  image_id = lookup(var.aws_amis, var.aws_region)
  instance_type = var.instance_type
  key_name = "proyectoterra"
  security_groups = ["${aws_security_group.web-sg.id}"]
  user_data = file("templates/userdata.tpl")
  lifecycle {
    create_before_destroy = true
  }
}
resource "aws_autoscaling_group" "as-web" {
  name = aws_launch_configuration.web-server.name
  launch_configuration = aws_launch_configuration.web-server.name
  max_size = 1
  min_size = 1
  load_balancers = ["${aws_elb.elb-web.id}"]
  vpc_zone_identifier = ["${aws_subnet.pub2.id}", "${aws_subnet.pub1.id}"]
  wait_for_elb_capacity = 1
  tag {
    key = "Name"
    propagate_at_launch = true
    value = "web-server"
  }
  lifecycle {
    create_before_destroy = true
  }
}
```

- **key_name:** Desde el interface de AWS, nos vamos a la consola Ec2 -> network & security -> key pairs. Aqui podremos crear nuestra clave. Tendrá que tener el mismo nombre que le pongamos en el fichero de configuración.

![](https://i.imgur.com/pbHkRsU.png)


Como se puede observar hemos definido un template para userdata, para ello hemos creado el siguiente fichero dentro del directorio templates. Aqui se puede ver que solamente estamos instalando php y apache.

- **userdata.tpl**

```
 #!/bin/bash
yum update -y
yum install -y httpd
amazon-linux-extras install php7.2
cat <<'EOF' >> /var/www/html/index.php
<?php
phpinfo();
?>
EOF
service httpd restart
```

Para terminar vamos a realizar las instrucciones *terraform plan* y 
*terraform apply*.

### Instancias

Si nos vamos a la consola de AWS, vamos a ver que está la instancia web-server que es la que pertenece al Auto Scaling se está todavia creando. 

![](https://i.imgur.com/QMQUgQO.png)

### RDS

Vemos que también está levantado el RDS.

![](https://i.imgur.com/9KorsBZ.png)

### VPC

Dentro de VPC, podremos encontrar las cuatro subnets.

![](https://i.imgur.com/XqHDxuT.png)

### Auto Scaling

En el apartado de *Auto Scaling* - *Launch Configurations*, podremos ver el recurso del *Launch Configuration*.

![](https://i.imgur.com/Kg2YJD0.png)

y si nos vamos al apartado de *Auto Scaling* - *Grupos de Auto Scaling*, podremos ver el recurso del *Auto Scaling*

![](https://i.imgur.com/DOdPkDD.png)

### Load Balancers

Si nos vamos a la pestaña de *Load Balancers*, podremos ver que tenemos creado el balanceador de AWS y a diferencia del apartado anterior podremos ver que en el *Status*, tendremos una instancia en servicio.

    Status    1 of 1 instances in service
    
![](https://i.imgur.com/qOyeSxe.png)

Esto significa que se instaló correctamente el Apache con PHP, siguiendo el script de userdata.

Si nos vamos a la URL del balanceador podremos ver lo siguiente:

![](https://i.imgur.com/7IZJ35B.png)

# Backends

Los *backends* consiste en salvar el fichero de estado y hacerle locking del entorno utilizando un tipo *Backend*. Hay varios tipos de *Backends*, podemos verlo desde la [documentación oficial](https://www.terraform.io/docs/backends/index.html), en este caso vamos a usar [s3](https://www.terraform.io/docs/backends/types/s3.html). 

¿Qué hace el Backend s3?

En el caso de usar este tipo de Backends, en realidad estemos utilizando s3 y DynamoDB. 

- En *s3* se va a salvar el fichero de estado.
- En *DynamoDB* se va a salvar el looking del entorno.

¿Qué es el looking del entorno?

Cuando alguien haga un cambio sobre el entorno, *(terraform plan/terraform apply)*, hay una tabla en *DynamoDB* en la que se va a crear una tabla y si otra persona trata de hacer lo mismo su terraform se dará cuenta de que alguien está modificando en la insfraestructura y saltará un aviso que no puede modificar porque se está realizando una tarea sobre la infraestructura.

> Es importante que en el backend de *s3* siempre se habilite el versionado, porque si por algún error o motivo alguien elimina el fichero se pueda recuperar un fichero anterior. De esta manera siempre vamos a tener el fichero de estado en un punto en común.

Vamos a empezar realizando la configuración, tendremos que crear un *backend de s3* y una tabla en *DynamoDB*.

Para crear el *backend de s3*, vamos a crear un nuevo *bucket*

![](https://i.imgur.com/spBP95R.png)

Aquí pondremos el nombre y la región.

![](https://i.imgur.com/VLG7cwU.png)

Ya estaría creada nuestro backend de s3

![](https://i.imgur.com/3fw4Fid.png)

Para otorgarle control de versionado, entraremos dentro y en la pestaña de *"Propiedades"* habilitaremos *"Control de versiones"*.

![](https://i.imgur.com/6EgbF4X.png)

Ya tendremos configurado el backend donde se va a guardar el fichero de estado.

A continuación vamos a crear una tabla en *DynamoDB*. Tendremos que añadir un nombre y un requisito que la tabla *DynamoDB*, que la *Primary key* tiene que tener el nombre de *"LockID"*.

![](https://i.imgur.com/7SxLtvd.png)

Le damos a crear tabla y ya podremos ver la tabla de DynamoDB creada.

![](https://i.imgur.com/yr0vN3u.png)

Una vez terminado estas dos configuraciones, nos iremos a los ficheros de configuración, primero lo vamos a definir en el fichero *main.tf*, donde declaramos la versión de terraform.

```
terraform {
  required_version = ">= 0.12.24"
  backend "s3" {
    bucket = "proyectoterra-states"
    region = "eu-west-1"
    key = "states-tfstate"
    dynamodb_table = "proyectoterra-locking"
    profile = "proyectoterra"
  }
}
```

Por último vamos a realizar las instrucciones *terraform init*, *terraform plan* y *terraform apply*. 

Una vez termine la creación de todos los recursos, si nos vamos a la consola de AWS y a la tabla de *DynamoDB*, vemos que ha cambiado el valor del objeto que crea terraform.

![](https://i.imgur.com/NTHd2sE.png)

Si entramos dentro, podremos ver un *Digest* con una suma de verificaciones del fichero de estado y el *LockID* apunta a ese fichero de estado de terraform.

![](https://i.imgur.com/wRSNnEi.png)

En el backed s3 vemos que esta salvado, el fichero de estado.

![](https://i.imgur.com/rOs6kf6.png)

Podremos ver también que en nuestro proyecto no hay ningún fichero de estado, ya que está en el backend s3.

![](https://i.imgur.com/yC5ujJA.png)


