# Configuración de entorno

El archivo .env se encuentra en la raíz de este repositorio. La URL y el token están pendientes de los datos oficiales del docente.

src/config/env.js centraliza la lectura de las variables y expone isApiConfigured. Si falta algún valor, la pantalla base muestra el estado pendiente y el cliente HTTP rechaza la petición antes de acceder a la red.

El token de aplicación se enviará en x-api-token. El JWT de usuario se obtendrá al iniciar sesión y se pasará al cliente como Authorization Bearer; no debe fijarse como variable de entorno.

La plantilla .env.example se versiona. El archivo .env real no está incluido en los commits. La entrega de Classroom contiene una copia vacía para cada plataforma.
