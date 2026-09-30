'use strict';

function canDeleteMusic(post) {
  return Boolean(state.profile && post.kind === 'music' && post.author_id === state.profile.id);
}

// Delete the record before cleaning files, and verify uncertain network responses.
// Never remove media when the record's deletion has not been confirmed.
async function removeMusicRecord(post) {
  if (!canDeleteMusic(post)) throw Error('Solo puedes eliminar las canciones que tú subiste.');
  const { error } = await db.from('posts').delete()
    .eq('id', post.id).eq('author_id', state.profile.id).eq('kind', 'music');
  if (error) throw Error('No se pudo eliminar. Revisa tu conexión y ejecuta la actualización 03 de Supabase si todavía no lo hiciste.');
  const check = await db.from('posts').select('id').eq('id', post.id).maybeSingle();
  if (check.error) throw Error('No pudimos confirmar la eliminación. Reintenta; tus archivos no se han borrado.');
  if (check.data) throw Error('No se pudo eliminar. Revisa tu conexión y ejecuta la actualización 03 de Supabase si todavía no lo hiciste.');
}

async function cleanMusicFiles(post) {
  const paths = [...new Set([post.audio_path, post.image_path].filter(Boolean))];
  if (!paths.length) return;
  // Keep a file if another publication still references it.
  const results = await Promise.all([
    db.from('posts').select('audio_path,image_path').in('audio_path', paths),
    db.from('posts').select('audio_path,image_path').in('image_path', paths)
  ]);
  if (results.some(result => result.error)) throw Error('cleanup');
  const used = new Set(results.flatMap(result => result.data.flatMap(row => [row.audio_path,row.image_path])));
  const unused = paths.filter(path => !used.has(path));
  if (unused.length) {
    const { error } = await db.storage.from('universe').remove(unused);
    if (error) throw error;
  }
  paths.forEach(path => signedCache.delete(path));
}

function confirmDeleteMusic(post) {
  if (!canDeleteMusic(post)) { toast('Solo puedes eliminar las canciones que tú subiste.'); return; }
  modal(`<h2>¿Eliminar esta canción?</h2>
    <p translate="no" class="delete-song-title">${esc(post.title)}</p>
    <p>Se eliminarán la canción, su portada y sus comentarios para los dos. También se quitará de las playlists. Esta acción no se puede deshacer.</p>
    <p class="error" id="delete-error" role="alert"></p>
    <div class="row" style="margin-top:20px"><button class="btn secondary" id="cancel-delete">Cancelar</button><button class="btn danger" id="confirm-delete">Eliminar canción</button></div>`);
  const confirm = $('#confirm-delete');
  const cancel = $('#cancel-delete');
  let recordRemoved = false;
  const refreshOnClose = () => { if (recordRemoved && state.profile) navigate('music'); };
  $('#modal').addEventListener('close', refreshOnClose, {once:true});
  cancel.onclick = () => $('#modal').close();
  confirm.onclick = async () => {
    if (!ensureLive()) return;
    busyModal(true);confirm.disabled=true;cancel.disabled=true;
    confirm.textContent='Eliminando…';$('#delete-error').textContent='';
    try {
      if (!recordRemoved) { await removeMusicRecord(post);recordRemoved=true; }
      await cleanMusicFiles(post);
      $('#modal').close();toast('Canción eliminada');
    } catch (error) {
      $('#delete-error').textContent=recordRemoved
        ? 'La canción ya se eliminó de la lista, pero falta limpiar sus archivos. Pulsa Reintentar limpieza. Si cierras, podrás revisar esos archivos en Supabase Storage.'
        : error.message;
    } finally {
      busyModal(false);confirm.disabled=false;cancel.disabled=false;
      confirm.textContent=recordRemoved?'Reintentar limpieza':'Eliminar canción';
      cancel.textContent=recordRemoved?'Cerrar':'Cancelar';
    }
  };
}
