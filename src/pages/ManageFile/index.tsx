import React, { useEffect, useState } from 'react';
import { Button, Col, Row, Upload } from 'antd';
import { filter, find, get, includes, isEmpty, keys, last, map } from 'lodash';
import { useToasts } from 'react-toast-notifications';
import { InputSelect } from '../../components/Inputs';
import configData from '../../jsons/sampleConfig.json';
import { write_file_from_input } from '../../helpers/utils';
import { StyledManageFile } from './styled';
import { FILE_UPLOAD_TYPES_KEY, OPERATIONS_KEY, PARAMETERS_KEY, SOMETHING_WRONG } from '../../constant';
import { IParameter } from '../../helpers/types';

interface ISelect {
  value: string;
  label: string;
};

const ManagerFile = (props: any) => {
  const [allFiles, setAllFiles] = useState([]);
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([]);
  const [fileTypeOption, setFileTypeOption] = useState<ISelect[]>([]);
  const [actionOption, setActionOption] = useState<ISelect[]>([]);
  const [descriptionOption, setDescriptionOption] = useState<ISelect[]>([]);
  const [flagOption, setFlagOption] = useState<ISelect[]>([]);
  const [typeOption, setTypeOption] = useState<ISelect[]>([]);
  const [integer_rangeOption, setinteger_rangeOption] = useState<ISelect[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileOption, setFileOption] = useState<ISelect[]>([]);
  const [selectedConfigData, setSelectedConfigData] = useState({});
  const [result, setResult] = useState(null);

  const { addToast } = useToasts();

  useEffect(() => {
    setConfig();
  }, []);

  const setConfig = () => {
    const fileTypeList = get(configData, FILE_UPLOAD_TYPES_KEY, []).map(
      (v: string) => ({ label: v.toUpperCase(), value: v })
    );
    setFileTypeOption(fileTypeList);
    const operationsData = get(configData, OPERATIONS_KEY);
    if (!isEmpty(operationsData)) {
      setActionOption(keys(operationsData).map((v: string) => ({ label: v, value: v })));
    }
  }

  const fileProps = {
    multiple: true,
    showUploadList: false,
    beforeUpload: async (file: any) => {
      const fileName = file.name;
      const fileItem = {
        value: fileName,
        label: fileName,
      };

      await write_file_from_input(file, fileName, console.log);
      if (isEmpty(selectedFileTypes) || includes(selectedFileTypes, last(fileName.split('.')))) {
        const fileList = fileOption;
        fileList.push(fileItem);
        setFileOption(fileList);
      }

      const tmpAllFiles = allFiles;
      // @ts-ignore
      tmpAllFiles.push(file);
      setAllFiles(tmpAllFiles);
      addToast(`Add file ${file.name} successfully!`, { appearance: 'success' });
      return false;
    },
  };

  const handleChangeFileType = (values: string[]) => {
    setSelectedFileTypes(values);
    setFileOption(map(filter(
      allFiles,
      // @ts-ignore
      (file) => (includes(values, last(file.name.split('.'))))
      // @ts-ignore
    ), (file) => ({ label: file.name, value: file.name })));
  }

  const handleChangeActionData = (name: string, value: any) => {
    let parametersData, descriptionData, flagData, parameter, typeData;
    switch (name) {
      case 'inputFile':
        setSelectedConfigData(Object.assign(
          {},
          selectedConfigData,
          {
            inputFile: value,
            actionName: '',
            description: '',
            flag: '',
            type: '',
            integer_range: '',
          }
        ));
        break;
      case 'actionName':
        parametersData = get(configData, `${OPERATIONS_KEY}.${value}.${PARAMETERS_KEY}`, []);
        descriptionData = parametersData.map((v: IParameter) => ({ label: v.description, value: v.description }));
        flagData = parametersData.map((v: IParameter) => ({ label: v.flag, value: v.flag }));
        setSelectedConfigData(Object.assign(
          {},
          selectedConfigData,
          {
            actionName: value,
            description: '',
            flag: '',
            type: '',
            integer_range: '',
          }
        ));
        setDescriptionOption(descriptionData);
        setFlagOption(flagData);
        setTypeOption([]);
        setinteger_rangeOption([]);
        break;
      case 'description':
        parameter = find(
          get(configData, `${OPERATIONS_KEY}.${get(selectedConfigData, 'actionName')}.${PARAMETERS_KEY}`, []),
          { description: value }
        );
        const flagV = get(parameter, 'flag');
        if (flagV) {
          setFlagOption([{ label: flagV, value: flagV }]);
          setSelectedConfigData(Object.assign(
            {},
            selectedConfigData,
            { description: value, flag: flagV, type: '', integer_range: '' }
          ));
        } else {
          setFlagOption([]);
          setSelectedConfigData(Object.assign(
            {},
            selectedConfigData,
            { description: value, flag: '', type: '', integer_range: '' }
          ));
        }
        typeData = get(parameter, 'type');
        setTypeOption(typeData ? [{ label: typeData, value: typeData }] : []);
        setinteger_rangeOption(get(parameter, 'integer_range', []).map((v: number) => ({ label: v, value: v })))
        break;
      case 'flag':
        parameter = find(
          get(configData, `${OPERATIONS_KEY}.${get(selectedConfigData, 'actionName')}.${PARAMETERS_KEY}`, []),
          { flag: value }
        );
        let descriptionV = get(selectedConfigData, 'description');
        if (!descriptionV) {
          descriptionV = get(parameter, 'description');
        }
        setSelectedConfigData(Object.assign(
          {},
          selectedConfigData,
          { description: descriptionV, flag: value, type: '', integer_range: '' }
        ));
        typeData = get(parameter, 'type');
        setTypeOption(typeData ? [{ label: typeData, value: typeData }] : []);
        setinteger_rangeOption(get(parameter, 'integer_range', []).map((v: number) => ({ label: v, value: v })))
        break;
      case 'type':
        setSelectedConfigData(Object.assign(
          {},
          selectedConfigData,
          { type: value, integer_range: '' }
        ));
        break;
      case 'integer_range':
        setSelectedConfigData(Object.assign(
          {},
          selectedConfigData,
          { integer_range: value }
        ));
        break;
    }
  }

  const onExecute = async () => {
    const actionName = get(selectedConfigData, 'actionName');
    if (!actionName) {
      addToast('Please specify an action', { appearance: 'error' });
      return;
    }

    try {
      const actionFunc = require(`../../helpers/${actionName}`);
      setIsLoading(true);
      await actionFunc.default(selectedConfigData, {
        success: (res: any) => {
          setIsLoading(false);
          setResult(get(res, 'success', null));
        },
        fail: (error: any) => {
          setIsLoading(false);
          addToast(get(error, 'message', SOMETHING_WRONG), { appearance: 'error' });
        },
      });
    } catch (error) {
      addToast(error.toString(), { appearance: 'error' });
      return;
    }
  }

  console.log('selectedConfigData', selectedConfigData);

  return (
    <StyledManageFile>
      <Row className="header" gutter={[16, 16]}>
        <Col span={24}>
          <Upload {...fileProps}>
            <Button type="primary">Upload a file</Button>
          </Upload>
        </Col>
        <Col xs={24} sm={24} md={24} lg={8} >
          <InputSelect
            placeholder="Select File Type"
            mode={'multiple'}
            options={fileTypeOption}
            value={selectedFileTypes}
            onChange={handleChangeFileType}
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={8} >
          <InputSelect
            placeholder="Select a File"
            options={fileOption}
            onChange={(v: string) => {handleChangeActionData('inputFile', v)}}
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={8} >
          <InputSelect
            placeholder="Select an Action"
            options={actionOption}
            onChange={(v: string) => {handleChangeActionData('actionName', v)}}
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={6} >
          <InputSelect
            placeholder="Select a Description"
            options={descriptionOption}
            value={get(selectedConfigData, 'description')}
            onChange={(v: string) => {handleChangeActionData('description', v)}}
            disabled={isEmpty(descriptionOption) || !get(selectedConfigData, 'actionName')}
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={6} >
          <InputSelect
            placeholder="Select a Flag"
            options={flagOption}
            value={get(selectedConfigData, 'flag')}
            onChange={(v: string) => {handleChangeActionData('flag', v)}}
            disabled={isEmpty(flagOption)}
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={6} >
          <InputSelect
            placeholder="Select a Type"
            options={typeOption}
            value={get(selectedConfigData, 'type')}
            onChange={(v: string) => {handleChangeActionData('type', v)}}
            disabled={isEmpty(typeOption)}
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={6} >
          <InputSelect
            placeholder="Select a Integer Range"
            options={integer_rangeOption}
            value={get(selectedConfigData, 'integer_range')}
            onChange={(v: string) => {handleChangeActionData('integer_range', v)}}
            disabled={isEmpty(integer_rangeOption)}
          />
        </Col>
      </Row>
      <Row className="execute-wrap">
        <Button
          className="execute-btn"
          type="primary"
          onClick={onExecute}
          loading={isLoading}
        >
          Execute
        </Button>
      </Row>
      <Row className="results" gutter={16}>
        {
          result === null
            ? <span>No result. Please select file, action, and parameters</span>
            : <h3>RESULTS: {result}</h3> 
        }
      </Row>
    </StyledManageFile>
  );
};

export default ManagerFile;
