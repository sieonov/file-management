import React, { useEffect, useState } from 'react';
import { Button, Col, Row, Upload, Checkbox } from 'antd';
import { find, get, isEmpty, keys, set } from 'lodash';
import { useToasts } from 'react-toast-notifications';
import { InputSelect } from '../../components/Inputs';
import configData from '../../jsons/sampleConfig.json';
import { write_file_from_input } from '../../helpers/utils';
import { StyledManageFile } from './styled';
import { OPERATIONS_KEY, PARAMETERS_KEY, SOMETHING_WRONG, MAX_INPUT_COUNT } from '../../constant';
import { IParameter } from '../../helpers/types';

interface ISelect {
  value: string;
  label: string;
};

const ManagerFile = (props: any) => {
  const [allFiles, setAllFiles] = useState([]);
  const [actionOption, setActionOption] = useState<ISelect[]>([]);
  const [descriptionOption, setDescriptionOption] = useState<ISelect[]>([]);
  const [typeOption, setTypeOption] = useState<ISelect[]>([]);
  const [integer_rangeOption, setinteger_rangeOption] = useState<ISelect[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileOption, setFileOption] = useState<ISelect[]>([]);
  const [selectedConfigData, setSelectedConfigData] = useState({});
  const [result, setResult] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<Array<string>>([]);

  const { addToast } = useToasts();

  useEffect(() => {
    setConfig();
  }, []);

  const setConfig = () => {
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
      const fileList = fileOption;
      fileList.push(fileItem);
      setFileOption(fileList);

      const tmpAllFiles = allFiles;
      // @ts-ignore
      tmpAllFiles.push(file);
      setAllFiles(tmpAllFiles);
      addToast(`Add file ${file.name} successfully!`, { appearance: 'success' });
      return false;
    },
  };

  const handleChangeActionData = (name: string, value: any) => {
    let parametersData, descriptionData, parameter, typeData;
    switch (name) {
      case 'inputFile':
        setSelectedConfigData(Object.assign(
          {},
          selectedConfigData,
          {
            inputFile: value,
            actionName: '',
            'description-flag': '',
            type: '',
            integer_range: '',
          }
        ));
        break;
      case 'actionName':
        parametersData = get(configData, `${OPERATIONS_KEY}.${value}.${PARAMETERS_KEY}`, []);
        descriptionData = parametersData.map((v: IParameter) => ({
          label: v.flag ? `${v.flag} - ${v.description}` : v.description,
          value: JSON.stringify({ description: v.description, flag: v.flag }),
        }));
        setSelectedConfigData(Object.assign(
          {},
          selectedConfigData,
          {
            actionName: value,
            'description-flag': '',
            type: '',
            integer_range: '',
          }
        ));
        setDescriptionOption(descriptionData);
        setTypeOption([]);
        setinteger_rangeOption([]);
        break;
      case 'description-flag':
        parameter = find(
          get(configData, `${OPERATIONS_KEY}.${get(selectedConfigData, 'actionName')}.${PARAMETERS_KEY}`, []),
          { description: JSON.parse(value).description }
        );
        setSelectedConfigData(Object.assign(
          {},
          selectedConfigData,
          { 'description-flag': value, type: '', integer_range: '' }
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
    console.log('------------------onExecute-----------------');
    // console.log('selectedConfigData1', selectedConfigData);
    const actionName = get(selectedConfigData, 'actionName');
    if (!actionName) {
      addToast('Please specify an action', { appearance: 'error' });
      return;
    }

    if (!selectedFile.length) {
      addToast('Please select a file', { appearance: 'error' });
      return;
    }

    const minInputCount = get(configData, `${OPERATIONS_KEY}.${actionName}.min_input_count`) || 1;
    const maxInputCount = get(configData, `${OPERATIONS_KEY}.${actionName}.max_input_count`)
      || (minInputCount === 1 ? 1 : MAX_INPUT_COUNT);

    if (minInputCount > selectedFile.length || maxInputCount < selectedFile.length) {
      addToast('The number of files are out of a given range.', { appearance: 'error' });
      return;
    }

    try {
      const actionFunc = require(`../../helpers/${actionName}`);

      setIsLoading(true);
      // check if multiple files are allowed to pass
      set(selectedConfigData, 'inputFile', selectedFile);
      const configParam = {
        ...selectedConfigData,
        description: JSON.parse(get(selectedConfigData, 'description-flag')).description,
        flag: JSON.parse(get(selectedConfigData, 'description-flag')).flag,
      };

      await actionFunc.default(configParam, {
        success: (res: any) => {
          setIsLoading(false);
          console.log('res', res);
          setResult(get(res, 'success'));
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

  const ListFile = (props: any) => {
    const {records = [], selectedFile = []} = props;
    return records.map((record: any) => {
      return (
        <div key={record.value} className="mt-1">
        <Checkbox onChange={onSelectFile} value={record.label} checked={selectedFile.includes(record.label)}>{record.label}</Checkbox>
        </div>
      );
    })
  }
  const onSelectFile = (e: any) => {
    const isCheck = e.target.checked;
    const value = e.target.value;

    if (isCheck && !selectedFile.includes(value)) {
      setSelectedFile([...selectedFile, value]);
    } else {
      setSelectedFile([...selectedFile.filter(fileName => fileName !== value)]);
    }
  }

  return (
    <StyledManageFile>
      <Row>
        <Col span={24}>
          <Upload {...fileProps}>
            <Button type="primary">Upload a file</Button>
          </Upload>
        </Col>
      </Row>
      <Row className="config-area" gutter={[32, 32]}>
        <Col span={12} style={{borderRight: '1px solid #eee'}}>
          <Row className="file mt-2">
            <Col span={24}>
              <div>
                  <ListFile records={fileOption} selectedFile={selectedFile}/>
              </div>
            </Col>
          </Row>
        </Col>
        <Col span={12} className="mt-2">
          <Row>
            <Col span={8}>
              <label>Action</label>
            </Col>
            <Col span={16} >
              <InputSelect
                placeholder="Select an Action"
                options={actionOption}
                onChange={(v: string) => {handleChangeActionData('actionName', v)}}
              />
            </Col>
          </Row>

          <Row className="mt-1">
            <Col span={8}>
              <label>Parameters</label>
            </Col>
            <Col span={16} >
              <InputSelect
                placeholder="Select a Description"
                options={descriptionOption}
                value={get(selectedConfigData, 'description-flag')}
                onChange={(v: string) => {handleChangeActionData('description-flag', v)}}
                disabled={isEmpty(descriptionOption) || !get(selectedConfigData, 'actionName')}
              />
            </Col>
          </Row>
          <Row className="mt-1">
            <Col span={8} />
            <Col span={8} >
              <InputSelect
                placeholder="Select a Type"
                options={typeOption}
                value={get(selectedConfigData, 'type')}
                onChange={(v: string) => {handleChangeActionData('type', v)}}
                disabled={isEmpty(typeOption)}
              />
            </Col>
            <Col span={8} >
              <InputSelect
                placeholder="Select a Integer Range"
                options={integer_rangeOption}
                value={get(selectedConfigData, 'integer_range')}
                onChange={(v: string) => {handleChangeActionData('integer_range', v)}}
                disabled={isEmpty(integer_rangeOption)}
              />
            </Col>
          </Row>

          <Row className="execute-wrap mt-2">
            <Button
              className="execute-btn"
              type="primary"
              onClick={onExecute}
              loading={isLoading}
            >
              Execute
            </Button>
          </Row>
        </Col>
      </Row>
      <Row className="results" gutter={16}>
      {result === null
        ? <span>No result. Please select file, action, and parameters</span>
        : <h3>RESULTS: {result}</h3>
      }
      </Row>
    </StyledManageFile>
  );
};

export default ManagerFile;
