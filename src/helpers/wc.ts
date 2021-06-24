import { get, isEmpty } from 'lodash';
import { SOMETHING_WRONG } from '../constant';
import { IArgType, cbType } from './types';

const wc = async (args: IArgType, cb?: cbType) => {
  // start of function code. assume that "args" and "callback" are already defined
  const success = get(cb, 'success');
  const fail = get(cb, 'fail');

  let count_what = '';
  let input_file = null;
  
  const flag = get(args, 'flag');
  if (flag === '-l') {
    count_what = 'lines';
  } else if (flag === '-c') {
    count_what = 'bytes';
  } else {
    fail && fail({ message: 'Please correct Flag.' });
    return;
  }

  input_file = get(args, 'inputFile.0');
  if (isEmpty(input_file)) {
    fail && fail({ message: 'Please select a file' });
    return;
  }

  let result;
  try {
    // @ts-ignore
    let blob = await lq_em_fs.getBlob(input_file);
    // @ts-ignore
    lq_em_fs.ls();
    console.log('blob', blob);
    blob = new Blob([blob]);
    if (count_what === 'lines') {
      const str: string = await blob.text();
      result = str ? str.split('\n').length : '';
    } else {
      result = blob.size;
    }

    success && success({ success: result });
  } catch (error) {
    fail && fail({ message: get(error, 'message', SOMETHING_WRONG) });
  }
}

export default wc;
