Pasos para correr ejemplo.

Ejecutar los siguientes comandos
```bash
nvm use
yarn install
```

abrir 2 tabs en la terminal. La idea es que en un tab simulemos al doctor y en el otro tab al paciente.

En el primer tab correr 

```bash
REACT_APP_ROL=doctor yarn start
```

En el segundo tab correr

```bash
REACT_APP_ROL=paciente yarn start
```

Si sale el siguiente mensaje `Would you like to run the app on another port instead?` escribir `y` y presionar `enter`.