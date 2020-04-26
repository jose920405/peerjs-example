Pasos para correr ejemplo.

Ejecutar los siguientes comandos
```bash
nvm use
yarn install
```

abrir 2 tabs en la terminal. La idea es que en un tab simulemos al doctor y en el otro tab al paciente.

En el primer tab correr 

```bash
REACT_APP_ROL=doctor yarn start // Distribuciones UNIX
set "REACT_APP_ROL=doctor" && yarn start // Windows
```

En el segundo tab correr

```bash
REACT_APP_ROL=paciente yarn start // Distribuciones UNIX
set "REACT_APP_ROL=paciente" && yarn start // Windows
```

Si sale el siguiente mensaje `Would you like to run the app on another port instead?` escribir `y` y presionar `enter`.

**PDTA: La mayoría de los logs aparecen en la consola del navegador, así que por favor habilitarla para ir viendo información de lo que está ocurriendo**

Hay botones que permiten enviar mensajes entre doctor y paciente.

## LLamadas

Para probar las llamadas se tiene que tener 2 personas en diferentes dispositivos para garantizar un correcto funcionamiento, lo de generar los 2 tabs es solo es para confirmar un correcto funcionamiento de la comunicación con `peerJS` 

***Seguir los siguientes pasos:***

1) Del lado del paciente pegar el id generado desde el lado del doctor

2) Del lado del doctor cuando se haya generado la conexión, presionar sobre el boton `Llamar a paciente`

3) Del lado del paciente contestar.

La Video llamada debería empezar sin ningún inconveniente.

#### Datos importantes.

Para que el video sea compartido ambos deben poder compartir video, de otra manera, ningún lado podrá visualizar el video, incluso si alguno de los 2 si tenga video camara.

Para hacer pruebas con celulares es importante probar con conexíones seguras `(https)`, sin esto hay restricción para acceder a los dispositivos multimedia internos del celuar `(Microfono y Camara)`. La mejor forma para esto es usar `ngrok` y exponer el puerto en el que esta corriendo la aplicación que es por defecto `3000`. El use de ngrok es super simple, Lo pueden ver [aquí](https://ngrok.com/)