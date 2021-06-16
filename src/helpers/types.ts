type cbType = { success?: Function; fail?: Function; };
interface IArgBasicType {
  description: string;
  flag?: string;
  type?:
    'integer'
    | 'none'
    | 'string'
    | 'integer'
    | 'filename'
    | 'new_filename';
}

interface IArgType extends IArgBasicType {
  inputFile?: string;
  integer_range?: number;
}

interface IParameter extends IArgBasicType {
  integer_range?: Array<number>;
}

export type {
  cbType,
  IArgType,
  IParameter,
}
