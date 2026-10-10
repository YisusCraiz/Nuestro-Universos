# Corrección del audio en los regalos

Versión v19-audio-regalos. No necesita nuevas instrucciones SQL.

La regla compartida .gift-media aplicaba height:auto al audio. La comprobación en navegador midió altura 0 con el estilo anterior y 54 píxeles con la corrección. El MP3 podía estar guardado mientras el reproductor quedaba invisible.

Se fija la altura solo para audio, se comprueba que la respuesta del guardado conserva ruta y tipo de archivo y se abre la vista previa al guardar. Se muestra el estado del archivo, errores de reproducción y se admiten los nombres MIME alternativos de MP3, M4A y WAV. Un reintento tras un fallo del guardado reutiliza el archivo ya subido.

Pruebas: navegador real para el tamaño del reproductor; guardado simulado de regalos 3 y 4, formatos, respuesta incompleta, error de red, reintento sin duplicar, archivo existente y límites. Pasaron también las pruebas de integración, archivos, idiomas/PWA y traducción. No se inició sesión ni se modificaron regalos reales para probar.
