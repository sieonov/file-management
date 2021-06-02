import { Button, Col, Row, Upload } from 'antd';
import * as _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import { InputSelect } from '../../components/Inputs';
import sampleConfig from '../../jsons/sampleConfig.json';
import { StyledManageFile } from './styled';

interface ISelect {
  value: string;
  label: string;
  data: any;
};

const ManagerFile = (props: any) => {
  const [uploadFiles, changeUploadFiles] = useState<ISelect[]>([]);
  const [selectedFiles, changeSelectedFiles] = useState<ISelect[]>([]);
  const [actionOptions, changeActionOptions] = useState<ISelect[]>([]);

  const { addToast } = useToasts();

  useEffect(() => {
    setActionOptions();
  }, []);

  const setActionOptions = () => {
    if (sampleConfig.operations) {
      let tmpActionOptions = actionOptions;
      for (const key in sampleConfig.operations) {
        const tmpOperation = _.get(sampleConfig.operations, key);
        const tmpItem = {
          value: key,
          label: `${key} - ${tmpOperation.description}`,
          data: tmpOperation,
        };
  
        tmpActionOptions.push(tmpItem);
      }
      changeActionOptions(tmpActionOptions);
    }
  }
  
  const fileProps = {
    multiple: true,
    showUploadList: false,
    beforeUpload: (file: any) => {
      const tmpItem = {
        value: file.name,
        label: file.name,
        data: file,
      };
      const tmpUploadFiles = uploadFiles;
      tmpUploadFiles.push(tmpItem);
      changeUploadFiles(tmpUploadFiles);
      addToast(`Add file ${file.name} successfully!`, { appearance: 'success' });
      return false;
    },
  };

  const handChangeSelectFile = (values: string[]) => {
    const tmpSelectedFiles = uploadFiles.filter(file => values.includes(file.value));

    changeSelectedFiles(tmpSelectedFiles);
  }
  const handChangeAction = (value: string) => {
    const tmpAction = {
      selectedAction: _.get(sampleConfig.operations, value),
      selectedFiles: selectedFiles,
    }
    console.log(tmpAction);
  }
  
  return (
    <StyledManageFile>
      <Row className="header" gutter={16}>
        <Col span={8}>
          <Upload {...fileProps}>
            <Button type="primary">Upload a file</Button>
          </Upload>
          <InputSelect
            className="mt-2"
            placeholder={'Select a file:'}
            mode={'multiple'}
            options={uploadFiles}
            onChange={handChangeSelectFile}
            >
          </InputSelect>
        </Col>
        <Col span={8}>
          <InputSelect
            placeholder={'Select an action:'}
            options={actionOptions}
            onChange={handChangeAction}
            >
          </InputSelect>
        </Col>
        <Col span={8} className="configured"></Col>
      </Row>
      <Row className="body" gutter={16}>
        <Col span={24}></Col>
      </Row>
    </StyledManageFile>
  );
};

export default ManagerFile;