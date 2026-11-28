# Nuestro Mundo en GitHub Codespaces

La prueba está aislada en la rama `pruebas/minecraft-codespaces`.

1. Abre tu Codespace existente. Desde la terminal, ejecuta estos comandos para crear una carpeta de trabajo aparte y conservar la rama y los cambios que ya tengas abiertos:

   ```bash
   git fetch origin pruebas/minecraft-codespaces
   git worktree add --detach .git/minecraft-prueba FETCH_HEAD
   cd .git/minecraft-prueba/prueba-minecraft
   java -version
   node --version
   npm ci
   ```

   El piloto usa Java 21 y Node.js 22 o posterior. Si el Codespace actual no los tiene, la rama incluye una configuración de contenedor para esos runtimes. El procedimiento anterior no reconstruye el Codespace ni cambia el checkout principal.

2. En esa terminal ejecuta `bash setup.sh`. Revisa la [EULA de Minecraft](https://www.minecraft.net/es-es/eula). Si la aceptas, cambia `eula=false` a `eula=true` en `servidor/eula.txt`.
3. Ejecuta `bash minecraft.sh`. Cuando la consola muestre `Done`, escribe `whitelist add TU_NOMBRE`, una vez por jugador, con los nombres de sus cuentas de Minecraft Java.
4. En otra terminal, desde la raíz del repositorio, ejecuta `cd .git/minecraft-prueba/prueba-minecraft && npm run proxy`. En **Ports**, copia la dirección HTTPS del puerto **42622**. Para que Julie pueda abrir el proxy desde el cliente web sin iniciar sesión en GitHub, ese puerto debe ser público. Publica únicamente ese puerto después de configurar la lista de jugadores. El servidor Java conserva la autenticación de Microsoft y la lista privada. El proxy solo permite el destino `127.0.0.1:25565`.
5. En [mcraft.fun](https://mcraft.fun/), abre **Connect to server**. En ambos dispositivos usa `127.0.0.1:25565` como servidor, `1.21.4` como versión y la URL HTTPS del puerto como proxy. Activa el inicio de sesión de Microsoft. La dirección 127.0.0.1 se refiere al servidor que ve el proxy dentro del Codespace.
6. Entra tú desde el navegador del PC y Julie desde el navegador del teléfono. Coloquen un bloque. Escribe `stop` en la consola de Minecraft, ejecuta otra vez `bash minecraft.sh` y comprueba que el bloque sigue ahí al volver. Para esta primera prueba ambos usan el cliente web. El puerto reenviado por GitHub sirve HTTPS para el proxy y no equivale a publicar el TCP de Minecraft para el launcher.

## Cerrar la sesión

Escribe `stop` en la consola de Minecraft antes de detener el Codespace. El mundo vive en `servidor/` dentro de ese Codespace. Conserva una copia fuera del Codespace si quieres poder recuperar el mundo después de eliminarlo. Para retomar una partida, abre el mismo Codespace y vuelve a iniciar el servidor y el proxy en la misma carpeta. No repitas `git worktree add`.

## Si la prueba falla

- **Proxy:** abre `URL_DEL_PUERTO/api/vm/net/connect`. Debe devolver JSON y no una pantalla de acceso a GitHub. Si la organización impide publicar puertos, ese Codespace no servirá para este flujo con el cliente web público.
- **Acceso al juego:** revisa la versión, el nombre en la lista y que la cuenta elegida tenga Minecraft Java.
- **WebGL:** si el fallo aparece antes de entrar a un servidor, prueba el modo Singleplayer en el mismo dispositivo para verificar el arranque gráfico por separado.
