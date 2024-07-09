---
title: "ArgoCD with Helm-Secrets and AGE Encryption"
author: Ernesto Vázquez García
date: 2024-07-09 11:55:00 +0200
categories: [DevOps]
tags: [Openshift]
---
## Descripción

Cuando queremos desplegar una aplicación con Helm en nuestro ArgoCD, algunos archivos `values.yaml` no tienen por qué incluir datos sensibles como contraseñas o certificados. Sin embargo, en caso de que sí los contengan, es recomendable o casi obligatorio por seguridad que esos archivos se suban encriptados y que el propio ArgoCD sea capaz de desencriptarlos antes de desplegar la aplicación.

En muchas documentaciones se centran en la encriptación con AWS KMS, pero en el caso de que nuestro entorno no use AWS, tendremos que hacerlo con otro tipo de encriptación como AGE, GPG, entre otros.

## Contexto

Vamos a utilizar un despliegue de ArgoCD con Helm usando el repositorio [argo-helm](https://github.com/argoproj/argo-helm.git).

Para ello, añadimos el repositorio de Helm y actualizamos:

```
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update
```

Instalamos ArgoCD utilizando el siguiente comando, especificando un archivo values.yaml personalizado si es necesario:

```
helm install argocd argo/argo-cd -n argocd --values values.yaml
```

## Configuración del cifrado

Para asegurar que nuestros archivos values.yaml que contienen información sensible estén protegidos, vamos a configurar el cifrado usando Helm-Secrets y AGE. Esto implicará la instalación de las herramientas necesarias y la configuración adecuada de nuestros archivos. A continuación, se detalla el proceso de instalación y configuración de estas herramientas.

- Instalación del Plugin Helm-Secrets

Helm-Secrets es un plugin para Helm que facilita el manejo de secretos cifrados. Este plugin permite que los archivos sensibles permanezcan cifrados durante todo el ciclo de vida de la aplicación, asegurando así que solo se desencripten en el entorno seguro de despliegue. Puedes encontrar más información y las instrucciones de instalación en su [repositorio oficial de GitHub](https://github.com/jkroepke/helm-secrets).

- Instalación de sops

`sops` es una herramienta para cifrar y descifrar archivos YAML, JSON, ENV y BINARY. Utilizaremos `sops` en combinación con Helm-Secrets para cifrar nuestros archivos `values.yaml`. Para más detalles y la instalación de `sops`, puedes visitar su [repositorio oficial de GitHub](https://github.com/getsops/sops).


## Primeros pasos

Para comenzar con la configuración del cifrado, el primer paso es generar las claves de encriptación. Estas claves se utilizarán para cifrar y descifrar los archivos values.yaml que contienen información sensible.

### Generando Claves de Encriptación

Para generar las claves de encriptación, utilizamos la herramienta AGE. Ejecuta el siguiente comando para generar una nueva clave:

```
age-keygen > my-age-key.txt
```

Este comando crea un nuevo par de claves, una pública y una privada, y las guarda en el archivo `my-age-key.txt`. La clave pública se utilizará para cifrar los datos, mientras que la clave privada se utilizará para descifrarlos.

> Ejemplo de Salida

Cuando ejecutas el comando `age-keygen`, obtendrás una salida similar a la siguiente:

```
# created: 2024-07-09T10:00:00Z
# public key: age1qqlpm33xcr5ynjxq9s5zk7q4m4xft7sw29z2d4kk2tdwlp0e4q7q5n5l78
AGE-SECRET-KEY-1T5X5CPTQ0Q6XCR8VVR2J3VHQ4U72D8L9TCQ2DZJ5XHZ6E5G9N0SJ7KRPDE
```

En el archivo `my-age-key.txt` se guardará el siguiente contenido:

- La clave pública (public key), que es age1qqlpm33xcr5ynjxq9s5zk7q4m4xft7sw29z2d4kk2tdwlp0e4q7q5n5l78 en este ejemplo.

- La clave privada (AGE-SECRET-KEY), que es AGE-SECRET-KEY-1T5X5CPTQ0Q6XCR8VVR2J3VHQ4U72D8L9TCQ2DZJ5XHZ6E5G9N0SJ7KRPDE en este ejemplo.

Es crucial mantener la clave privada segura, ya que cualquiera que tenga acceso a ella podrá descifrar los archivos encriptados. La clave pública, por otro lado, puede ser compartida con aquellos que necesiten cifrar datos que solo tú puedas descifrar.

Posteriormente, subiremos este archivo de claves a un secreto en OpenShift. Este paso es crucial porque permitirá que ArgoCD, que está dentro del clúster, tenga acceso a las claves necesarias para desencriptar los secretos. Al almacenar el archivo de claves en un secreto de OpenShift, garantizamos que las claves privadas permanezcan seguras y solo estén disponibles para los componentes autorizados del clúster que requieren acceso para el despliegue de aplicaciones. Esto asegura una capa adicional de seguridad y facilita el manejo de secretos en un entorno de despliegue continuo.

### Mecanismo de cifrado

Vamos a crear un archivo llamado `.sops.yaml` que configurará cómo sops manejará el cifrado de nuestros archivos sensibles. Este archivo define las reglas de encriptación, incluyendo las claves que se utilizarán para cifrar y descifrar los archivos.

#### ¿Qué es el archivo .sops.yaml?

El archivo `.sops.yaml` es un archivo de configuración utilizado por sops para definir cómo y con qué claves deben cifrarse los archivos. Especificamos las reglas de creación que sops debe seguir, incluyendo la clave pública que se utilizará para cifrar los datos. Este archivo debe ubicarse en el repositorio Helm de la aplicación que vamos a desplegar.

#### Estructura del Repositorio Helm

La estructura del repositorio Helm para nuestra aplicación tendrá el siguiente aspecto:

```
├── .sops.yaml
├── Chart.yaml
├── templates
│   ├── deployment.yaml
│   ├── route.yaml
│   ├── secret-database.yaml
│   ├── secret-tls.yaml
│   └── service.yaml
├── values-secrets.yaml
└── values.yaml
```

En esta estructura:

- `.sops.yaml`: Archivo de configuración para sops.
- `Chart.yaml`: Archivo principal del chart de Helm.
- `templates/`: Directorio que contiene los templates de Kubernetes.
    - `deployment.yaml`: Template para el despliegue.
    - `route.yaml`: Template para las rutas.
    - `secret-database.yaml`: Template para el secreto de la base de datos.
    - `secret-tls.yaml`: Template para el secreto TLS.
    - `service.yaml`: Template para el servicio.
- `values-secrets.yaml`: Archivo de valores que contiene datos sensibles y será cifrado posteriormente.
- `values.yaml`: Archivo de valores que no contiene datos sensibles.

#### Creando el archivo .sops.yaml

Para crear el archivo `.sops.yaml`, edítalo con un editor de texto, por ejemplo, utilizando nano:

```
nano .sops.yaml
```

Luego, añade las siguientes reglas de creación:

```
creation_rules:
  - age: age1qqlpm33xcr5ynjxq9s5zk7q4m4xft7sw29z2d4kk2tdwlp0e4q7q5n5l78
```

En esta configuración, `age1qqlpm33xcr5ynjxq9s5zk7q4m4xft7sw29z2d4kk2tdwlp0e4q7q5n5l78` es la clave pública generada anteriormente. Esta clave se usará para cifrar los archivos `values-secrets.yaml`, garantizando que solo puedan ser descifrados utilizando la clave privada correspondiente.

### Encrypt

El siguiente paso es encriptar los archivos que contienen datos sensibles. En nuestro caso, encriptaremos el archivo `values-secrets.yaml`, que contiene información en base64.

#### Contenido del Archivo Sensible

El archivo values-secrets.yaml contiene los datos sensibles en base64:

```
$ cat values-secrets.yaml
databaseSecret:
    username: dXNlcm5hbWU=
    password: ZWFzdGVyIGVnZzogc2kgbGVlcyBlc3RvIGVzY3JpYmVtZSBhbCBjb3JyZW8=
```

#### Exportar Claves a una Variable de Entorno

Antes de encriptar el archivo, debemos exportar el archivo de claves a una variable de entorno. Esto permite que sops utilice las claves adecuadas para el proceso de encriptación. Para hacerlo, ejecuta el siguiente comando:

```
export SOPS_AGE_KEY_FILE=/home/user/my-age-key.txt
```

#### Encriptar el Archivo

Ahora podemos encriptar el archivo `values-secrets.yaml` utilizando el siguiente comando:

```
helm secrets encrypt values-secrets.yaml > values-secrets-enc.yaml
```

El comando `helm secrets encrypt` encripta el contenido del archivo y lo guarda en un nuevo archivo `values-secrets-enc.yaml`.

#### Resultado del Archivo Encriptado

El contenido del archivo encriptado `values-secrets-enc.yaml` se verá similar a lo siguiente:

```
$ cat values-secrets-enc.yaml
databaseSecret:
    username: ENC[AES256_GCM,data:5m37M3NZT2FRq0cp,iv:sOtEsVtlo7VmzQ/fB5k0GHNaLtcFrW71PgLjF9zJSTY=,tag:gcg7NbmL8Y4vuxGKAdEeXw==,type:str]
    password: ENC[AES256_GCM,data:c28qT4t5H7Jxeqo81nBbdeDVDEl6Sa34P8cOy/l/lRhbb/G7R4kILDvwldPH1+Q6Q8DvzxdFy8XqlDY1,iv:vsNX6cMNtLisn/3GVWwD/k4dX/zmfEiczgBmwiMxGyA=,tag:BRv51djOWo0eeC5zUU4whA==,type:str]
sops:
    kms: []
    gcp_kms: []
    azure_kv: []
    hc_vault: []
    age:
        - recipient: age1qqlpm33xcr5ynjxq9s5zk7q4m4xft7sw29z2d4kk2tdwlp0e4q7q5n5l78
          enc: |
            -----BEGIN AGE ENCRYPTED FILE-----
            YWdlLWVuY3J5cHRpb24ub3JnL3YxCi0+IFgyNTUxOSBWL3hIYVk0amhkVGx2eHhj
            NGlITjZWV2t6bHpTa1hsaTE5MUthRXgzd21nCjIyT2xHaFBjSWl0eEw0ZmkwYmY5
            N3dPRG40bWYyTmFPVUxpZ1dxb1RyUDgKLS0tIFFFRDlZQWtFUW1GOTdqSEZjUDVI
            dzZmNE9xOHYrZ1ErU2VyS05WTjJSN3MK4h5REeQdfL7o6plfXWClGMYh1+hvJ++X
            VRlFp4N/0Hiw7s8eY5HYRqeIbYfAcwRetUBFDGObsM5vfojeZFttow==
            -----END AGE ENCRYPTED FILE-----
    lastmodified: "2024-07-09T08:28:21Z"
    mac: ENC[AES256_GCM,data:NlMRiiuM8uChn+j2MMR6C7Qr9OnWzQgc7e6yf306w5eDhPx0/SIPL/6E41KKs+571QObLI8HRQszJbwhxk9iTagdbo2es+sIXDZVYjRMkKQCM7R1glDLlXH/ZgoIOd2ZqoKQhN2bV5OA7TEexofEHH8jzpe2IUQdgs5YaPCDmIs=,iv:SGq4h6LTZhVkCQOHMMBkX/+BwccdS1TMf4c98f5zoXA=,tag:H0ZgB3/Qjpcz2xhY0hDYOA==,type:str]
    pgp: []
    unencrypted_suffix: _unencrypted
    version: 3.9.0
```

En este archivo, los valores sensibles están encriptados y solo pueden ser descifrados utilizando la clave privada correspondiente. Este archivo encriptado es el que subiremos a nuestro repositorio Git, asegurando que los datos sensibles permanezcan seguros y protegidos durante el proceso de despliegue.

### Decrypt

Si necesitamos desencriptar el archivo localmente para hacer algún cambio, podemos hacerlo utilizando el siguiente comando:

```
helm secrets decrypt values-secrets-enc.yaml > values-secrets.yaml
```

#### ¿Qué Hace Este Comando?

- `helm secrets decrypt`: Especifica que queremos desencriptar un archivo encriptado con Helm-Secrets.
- `values-secrets-enc.yaml`: Es el archivo encriptado que contiene los valores sensibles.
- `> values-secrets.yaml`: Redirige la salida desencriptada al archivo `values-secrets.yaml`.

Al ejecutar este comando, el contenido encriptado del archivo `values-secrets-enc.yaml` se desencriptará y se guardará en el archivo `values-secrets.yaml`.

#### Resultado

El archivo desencriptado `values-secrets.yaml` tendrá un aspecto similar al siguiente:

```
databaseSecret:
    username: dXNlcm5hbWU=
    password: ZWFzdGVyIGVnZzogc2kgbGVlcyBlc3RvIGVzY3JpYmVtZSBhbCBjb3JyZW8=
```

Proceso de Edición y Re-encriptación

1. Desencriptar el Archivo: Utilizamos el comando anterior para obtener el contenido desencriptado.

2. Editar el Archivo: Realizamos los cambios necesarios en el archivo `values-secrets.yaml`.

3. Re-encriptar el Archivo: Una vez realizados los cambios, volvemos a encriptar el archivo usando el comando:

```
helm secrets encrypt values-secrets.yaml > values-secrets-enc.yaml
```

4. Subir a Nuestro Repositorio Git: Finalmente, subimos el archivo encriptado `values-secrets-enc.yaml` a nuestro repositorio Git.

Este flujo de trabajo nos permite mantener los datos sensibles protegidos mientras realizamos las modificaciones necesarias de manera segura.

### Crear Secretos en OpenShift

Para permitir que ArgoCD desencripte los archivos de valores en nuestro clúster, subiremos el archivo de claves a OpenShift. Este paso asegura que las claves de desencriptación estén disponibles en el entorno de despliegue.

#### Crear un Secreto en OpenShift

Utilizaremos el siguiente comando para crear un secreto en OpenShift que contenga nuestro archivo de claves:

```
kubectl create secret generic sops-age --from-file=my-age-key.txt=my-age-key.txt --namespace=argocd
```

#### Explicación del Comando

- **kubectl create secret generic**: Especifica que estamos creando un secreto genérico.
- **sops-age**: Es el nombre del secreto que estamos creando.
- **--from-file=my-age-key.txt=my-age-key.txt**: Indica que estamos creando el secreto a partir del archivo `my-age-key.txt`. El primer `my-age-key.txt` es el nombre de la clave en el secreto, y el segundo `my-age-key.txt` es el nombre del archivo local.
- **--namespace=argocd**: Especifica que el secreto se creará en el namespace/project `argocd`.

Este comando sube el archivo de claves a OpenShift como un secreto, permitiendo que ArgoCD acceda a las claves necesarias para desencriptar los archivos durante el proceso de despliegue. Esto garantiza que las claves privadas permanezcan seguras y disponibles solo para los componentes autorizados del clúster.

## Configuración de ArgoCD para desencriptar

Vamos a configurar el archivo `values.yaml` del chart de [Helm de ArgoCD](https://github.com/argoproj/argo-helm/blob/main/charts/argo-cd/values.yaml) para habilitar la capacidad de desencriptar secretos utilizando el plugin Helm Secrets. Esto asegurará que ArgoCD pueda acceder y utilizar los valores encriptados de manera segura durante el despliegue de aplicaciones.

### Cambios en el values.yaml

A continuación, se muestra un segmento de `values.yaml` modificado con las configuraciones necesarias:

```
configs:
  cm:
    create: true

    helm.valuesFileSchemes: >-
      secrets
```

`configs.cm.data.helm.valuesFileSchemes: secrets`: Este cambio modifica el ConfigMap de ArgoCD para agregar la configuración `helm.valuesFileSchemes` con el valor `secrets`. Esto permite el uso del plugin Helm Secrets para manejar archivos de valores que contienen secretos encriptados.

```
repoServer:
  env:
      # Change Helm plugins dir to the shared volume
    - name: HELM_PLUGINS
      value: /custom-tools/helm-plugins/

      # Tell Helm Secrets plugin to use tools at specific paths
    - name: HELM_SECRETS_SOPS_PATH
      value: /custom-tools/sops
    - name: HELM_SECRETS_VALS_PATH
      value: /custom-tools/vals
    - name: HELM_SECRETS_KUBECTL_PATH
      value: /custom-tools/kubectl
    - name: HELM_SECRETS_CURL_PATH
      value: /custom-tools/curl
    - name: SOPS_AGE_KEY_FILE
      value: /sops/age/my-age-key.txt

    # https://github.com/jkroepke/helm-secrets/wiki/Security-in-shared-environments
    - name: HELM_SECRETS_VALUES_ALLOW_SYMLINKS
      value: "false"
    - name: HELM_SECRETS_VALUES_ALLOW_ABSOLUTE_PATH
      value: "false"
    - name: HELM_SECRETS_VALUES_ALLOW_PATH_TRAVERSAL
      value: "false"

  # -- Init containers to add to the repo server pods
  initContainers:
    - name: download-tools
      image: alpine:latest
      command: [sh, -ec]
      env:
        - name: HELM_SECRETS_VERSION
          value: "3.15.0"
        - name: KUBECTL_VERSION
          value: "1.22.13"
        - name: VALS_VERSION
          value: "0.18.0"
        - name: SOPS_VERSION
          value: "3.7.3"
      args:
        - |
          mkdir -p /custom-tools/helm-plugins
          wget -qO- https://github.com/jkroepke/helm-secrets/releases/download/v${HELM_SECRETS_VERSION}/helm-secrets.tar.gz | tar -C /custom-tools/helm-plugins -xzf-;
          wget -qO /custom-tools/sops https://github.com/mozilla/sops/releases/download/v${SOPS_VERSION}/sops-v${SOPS_VERSION}.linux.amd64
          wget -qO /custom-tools/kubectl https://dl.k8s.io/release/v${KUBECTL_VERSION}/bin/linux/amd64/kubectl
          chmod +x /custom-tools/*
      volumeMounts:
        - mountPath: /custom-tools
          name: custom-tools

  # -- Additional volumeMounts to the repo server main container
  volumeMounts:
    - mountPath: /custom-tools
      name: custom-tools
    - name: sops-age-volume
      mountPath: /sops/age
      readOnly: true

  # -- Additional volumes to the repo server pod
  volumes:
    - name: custom-tools
      emptyDir: { }
    - name: sops-age-volume
      secret:
        secretName: sops-age
```

- `env`: Aquí configuramos las variables de entorno necesarias para el repoServer de ArgoCD:
    - `HELM_PLUGINS`: Especifica el directorio donde se almacenarán los plugins de Helm.
    - `HELM_SECRETS_SOPS_PATH, HELM_SECRETS_VALS_PATH, HELM_SECRETS_KUBECTL_PATH, HELM_SECRETS_CURL_PATH`: Especifican las rutas a las herramientas necesarias como sops, vals, kubectl y curl respectivamente.
    - `SOPS_AGE_KEY_FILE`: Especifica la ubicación del archivo de claves de age que se utilizará para desencriptar los secretos.

- `initContainers`: Aquí definimos un contenedor `download-tools` que se ejecutará antes de iniciar el repoServer principal de ArgoCD. Este contenedor se encarga de descargar e instalar las herramientas necesarias como helm-secrets, sops, kubectl, entre otros. Esto asegura que todas las herramientas requeridas estén disponibles en el entorno de despliegue.

- `volumeMounts y volumes`: Estos bloques especifican los puntos de montaje y volúmenes necesarios para el repoServer de ArgoCD. Se monta un volumen vacío custom-tools para almacenar las herramientas descargadas y un volumen sops-age-volume que proviene del secreto creado anteriormente en OpenShift, donde se almacena el archivo de claves de `age`.

Estas configuraciones aseguran que ArgoCD esté correctamente configurado para desencriptar y utilizar los secretos durante el despliegue de aplicaciones, garantizando la seguridad y confidencialidad de los datos sensibles.

### Instalación de ArgoCD con los cambios

Con el archivo `values.yaml` modificado que contiene las configuraciones necesarias para integrar Helm Secrets y permitir la desencriptación de secretos en ArgoCD, podemos proceder a instalar ArgoCD en nuestro clúster Kubernetes utilizando Helm. A continuación, se muestra el comando para la instalación:

```
helm install argocd argo/argo-cd -n argocd --values values.yaml
```

## Despliegue de nuestra aplicación

Ahora que hemos configurado ArgoCD con Helm Secrets y hemos preparado todo para desplegar nuestra aplicación, podemos proceder con el despliegue en ArgoCD. A continuación, te guiaré a través del proceso de despliegue utilizando la interfaz de ArgoCD.

### Paso 1: Acceso a ArgoCD

Primero, accedemos a la interfaz de ArgoCD. Aquí te muestro cómo se verá la página de inicio de sesión:

![1](https://github.com/ernestovazquez/ernestovazquez.github.io/assets/32536051/4161617f-6901-4cc5-8e1c-7dc1af973ddc)

### Paso 2: Creación de una Nueva Aplicación

Una vez dentro de ArgoCD, hacemos clic en "+ NEW APP" para comenzar a crear una nueva aplicación:

![2](https://github.com/ernestovazquez/ernestovazquez.github.io/assets/32536051/6ede9017-17d7-413c-999f-00f86ff70b8f)

### Paso 3: Edición del YAML de la Aplicación

Seleccionamos "EDIT AS YAML" para poder editar directamente el YAML de la aplicación. Aquí agregamos el YAML de nuestra aplicación `api-service`:

![3](https://github.com/ernestovazquez/ernestovazquez.github.io/assets/32536051/760f2e4b-f2e1-42e8-b135-2c4a0f7ce635)

```
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: api-service
spec:
  destination:
    name: ''
    namespace: default
    server: 'https://kubernetes.default.svc'
  source:
    chart: api-service
    repoURL: 'git@bitbucket.org:my-org/my-repo.git'
    targetRevision: develop
    path: delivery/helm
    helm:
      valueFiles:
        - values.yaml
        - secrets://values-secrets-enc.yaml
  project: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

Explicación del Código

- `apiVersion y kind`: Define que estamos creando una aplicación en ArgoCD.
- `metadata.name`: Nombre de la aplicación.
- `spec.destination`: Especifica el servidor y el namespace donde se desplegará la aplicación.
- `spec.source`: Configura la fuente del repositorio Git que contiene nuestro chart Helm.
    - `repoURL`: URL del repositorio Git.
    - `targetRevision`: Versión o rama del repositorio a desplegar.
    - `chart y path`: Especifican la ubicación del chart Helm dentro del repositorio.
    - `helm.valueFiles`: Lista de archivos de valores que se utilizarán durante el despliegue (`values.yaml` y `secrets://values-secrets-enc.yaml`). Utilizamos `secrets://` para indicar que el archivo `values-secrets-enc.yaml` contiene datos sensibles encriptados. Esta convención le dice a ArgoCD que debe desencriptar automáticamente el archivo antes de aplicar los valores durante el despliegue.
- `spec.project`: Proyecto de ArgoCD donde se asignará la aplicación.
- `spec.syncPolicy`: Política de sincronización automática de la aplicación.

![4](https://github.com/ernestovazquez/ernestovazquez.github.io/assets/32536051/ffc7c9b8-86ba-4377-aa11-5bf54c990a4b)

### Paso 4: Guardar y Crear la Aplicación

Una vez que hemos agregado el YAML, guardamos los cambios haciendo clic en "SAVE". ArgoCD validará y rellenará automáticamente los detalles de la aplicación basados en nuestro YAML. Asegurémonos de que los valores en el apartado de HELM muestren correctamente los archivos `values.yaml` y `values-secrets-enc.yaml` como secretos reconocidos.

![5](https://github.com/ernestovazquez/ernestovazquez.github.io/assets/32536051/24beb57b-6493-49de-b6dc-54f0a6fb0f58)

### Paso 5: Crear la Aplicación

Finalmente, creamos la aplicación haciendo clic en "CREATE". ArgoCD comenzará el proceso de sincronización y despliegue según las configuraciones especificadas en el YAML. Una vez completado, verificamos que la aplicación se haya desplegado correctamente y que los secretos estén correctamente manejados.

![6](https://github.com/ernestovazquez/ernestovazquez.github.io/assets/32536051/14ee599c-b0bd-4bb4-a03f-d383c635fa5b)

## Conclusión

En este artículo hemos explorado cómo integrar y utilizar Helm Secrets junto con ArgoCD para gestionar de manera segura los secretos en nuestras aplicaciones desplegadas en Kubernetes. Comenzamos por configurar y generar claves de encriptación con `age`, luego utilizamos `sops` para encriptar nuestros archivos de valores sensibles. Posteriormente, configuramos ArgoCD para que pueda desencriptar estos archivos durante el despliegue, asegurando así la protección de datos sensibles como contraseñas y certificados.

A lo largo del proceso, también configuramos adecuadamente el entorno de ArgoCD mediante la modificación del archivo `values.yaml`, asegurándonos de que ArgoCD tuviera acceso a las herramientas necesarias y al archivo de claves encriptadas. Finalmente, desplegamos nuestra aplicación mediante ArgoCD, observando cómo los secretos fueron gestionados de manera segura y eficiente durante todo el ciclo de vida de la aplicación.

Este enfoque no solo mejora la seguridad de nuestras aplicaciones desplegadas en Kubernetes, sino que también automatiza y simplifica la gestión de secretos dentro de un entorno de CI/CD. Al adoptar estas prácticas, no solo mejoramos la seguridad, sino que también garantizamos un despliegue confiable y consistente de nuestras aplicaciones en cualquier entorno de Kubernetes compatible con ArgoCD.

