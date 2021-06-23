import styled from 'styled-components';

export const StyledManageFile = styled.div`
  padding: 50px 30px;
  .config-area {
    .file {
      min-height: 200px;
      max-height: 400px;
      overflow: auto;
      border: 1px solid #eee;
      padding: 16px;
    }
  }
  .configured {
    height: 190px;
    background-color: #d9f7be;
    font-size: 1rem;
    font-weight: 600;
    color: white;
    border-radius: 10px;
  }

  .execute-wrap {
    .execute-btn {
      min-width: 100px;
      margin-left: auto;
    }
  }
  
  .results {
    background-color: #69c0ff;
    margin-top: 30px;
    padding: 3rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    color: white;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    h3 {
      color: #000;
    }
  }
`;