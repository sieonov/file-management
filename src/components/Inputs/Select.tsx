import { Select } from 'antd';
import React from "react";

const { Option } = Select;

const InputSelect = (props: any) => {
  const {
    // type,
    // name,
    // value,
    mode={undefined},
    options = [],
    placeholder,
    onChange,
    onFocus,
    onBlur,
    onSearch,
    className,
    isDefault = false,
  } = props;

  return (
    <Select
      mode={mode}
      className={className}
      showSearch
      style={{ width: '100%' }}
      placeholder={placeholder}
      optionFilterProp="children"
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onSearch={onSearch}
      // filterOption={(input, option) =>
      //   option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      // }
    >
      {isDefault ? <Option value="" key="-1">---</Option> : ''}
      {options.map((option: any) => <Option value={option.value} key={option.value}>{option.label}</Option>)}
    </Select>
  );
};

export default InputSelect;
