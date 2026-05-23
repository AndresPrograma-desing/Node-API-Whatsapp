### Node API para WhatsApp
Este proyecto es una API desarrollada en Node.js que permite interactuar con WhatsApp utilizando la biblioteca `whatsapp-web.js`. La API ofrece funcionalidades para enviar mensajes, gestionar sesiones y mantener la conexión activa con WhatsApp.

## Características
- Envío de mensajes de texto a través de WhatsApp.
- Gestión de sesiones para mantener la conexión activa.
- Integración con Supabase para almacenamiento de datos.
## Requisitos
- Node.js (versión 14 o superior)
- npm (Node Package Manager)
## Instalación
1. Clona el repositorio:
   ```bash
   git clone
    ```
2. Navega al directorio del proyecto:
    ```bash
    cd Node-API-Whatsapp
    ```
3. Instala las dependencias:
    ```bash
    npm install
    ```
4. Configura las variables de entorno:
    - Crea un archivo `.env` en la raíz del proyecto.
    - Copia el contenido de `.env.example` al archivo `.env` y completa los valores con tu configuración.
    ```env
PORT=Tu puerto deseado (por ejemplo, 3000)
NODE_ENV=development
SUPABASE_URL=Tu URL de Supabase (por ejemplo, https://erqccjztiworthuytgez.supabase.co)
SUPABASE_KEY=Tu clave de Supabase (por ejemplo, sb_publishable_qn
ODpnygymGcf6TY63cpDQ_6h5ZSJA-)
KEEP_ALIVE_NUMBER=Tu número de WhatsApp para mantener la sesión activa (por ejemplo, 580129341132)
    ```
## Uso
1. Inicia la API:
    ```bash
    npm start
    ```
2. La API estará disponible en `http://localhost:PORT` (reemplaza `PORT` con el valor configurado en tu archivo `.env`).
3. Puedes enviar solicitudes a los endpoints definidos en la API para interactuar con WhatsApp.
## Contribución
Si deseas contribuir al proyecto, por favor sigue estos pasos:
1. Haz un fork del repositorio.
2. Crea una nueva rama para tu característica o corrección de errores:
    ```bash
    git checkout -b feature/nueva-caracteristica
    ```
3. Realiza tus cambios y haz commit de ellos:
    ```bash
    git commit -m "Descripción de la nueva característica o corrección de errores"
    ```
4. Envía tus cambios a tu repositorio fork:
    ```bash
    git push origin feature/nueva-caracteristica
    ```
5. Abre una Pull Request en el repositorio original para que tus cambios sean revisados e integrados.
## Endpoints
- `POST /send-message`: Envía un mensaje de texto a un número de WhatsApp
- `GET /status/:clientId`: Obtiene el estado de la sesión de WhatsApp
- `POST /init-session`: Inicia una nueva sesión de WhatsApp
- `POST /keep-alive`: Mantiene la sesión activa enviando un mensaje a un número específico
- `GET /clients`: Obtiene una lista de los clientes conectados
- `POST /register-tenant`: Registra un nuevo tenant en la base de datos

##Postman
Puedes importar la colección de Postman para probar los endpoints de la API. La colección se encuentra en el archivo `POSTMAN/collection.json` del repositorio.

## Mas información
Para más detalles sobre cómo utilizar la API, puedes consultar la documentación adicional en el repositorio o contactar al desarrollador.

    ESTE API SE ENCUENTRA EN DESARROLLO, POR LO QUE ALGUNAS FUNCIONALIDADES PUEDEN NO ESTAR COMPLETAS O PUEDEN CAMBIAR EN EL FUTURO. SI TIENES SUGERENCIAS O DESEAS CONTRIBUIR, NO DUDES EN HACERLO.

    DEVELOPED BY: [IGNACIO ANGEL]
    CONTACT: [
    - Email: ignacioangel671@gmail.com
    ]
    DATE: 2024-05-23
## Extra
  Ejecuta el archivo index.html que se encuantra en la ruta public\document\web\index.html para escanear el codigo QR que te devuelva el api
## final del README.md
