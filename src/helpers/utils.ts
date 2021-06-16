const stream_file = (file: any, chunk_size: number, cb: Function) => {
  var offset = 0;
  var fr = new FileReader();

  function getNextChunk() {
    // getNextChunk(): will fire 'onload' event when specified chunk size is loaded
    var slice = file.slice(offset, offset + chunk_size);
    fr.readAsArrayBuffer(slice);
  }

  fr.onload = function() {
    // @ts-ignore
    var view = new Uint8Array(fr.result);
    if(!cb(null, view)) {
      offset += chunk_size;

      if(offset < file.size && view.length)
        getNextChunk();
      else // all done
        cb(null, null);
    }
  };

  fr.onerror = function() {
    cb('read error');
  };

  getNextChunk();
}

const write_file_from_input = async (file: any, target_filename: string, cb?: Function) => {
  if (!cb) {
    cb = (e: any) => {};
  }
  // @ts-ignore
  var f = lq_em_fs.fopen(target_filename, 'wb');
  if(!f) {
    cb(`Unable to open  ${target_filename} for writing`);
  } else {
    var done = 0;
    var written = 0;
    var write_cb = function(err: any, data: any) {
      if(done) {
        console.log('Unexpected write calls after file close');
        return;
      }
      if(err) {
        // @ts-ignore
        lq_em_fs.fclose(f);
        // @ts-ignore
        cb(err);
        done = 1;
      }  else {
        if(data) {
          // @ts-ignore
          lq_em_fs.fwrite(data, 1, data.length, f);
          written += data.length;
        } else {
          done = 1;
          // @ts-ignore
          lq_em_fs.fclose(f);
          // @ts-ignore
          cb(null, written)
        }
      }
    }
    stream_file(file, 1024, write_cb)
  }
}

export {
  write_file_from_input,
}
