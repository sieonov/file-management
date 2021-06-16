import styled from 'styled-components';

export const StyledManageFile = styled.div`
  padding: 50px 30px;
  .header {
    height: 200px;
  }
  .configured {
    height: 190px;
    background-color: #d9f7be;
    font-size: 1rem;
    font-weight: 600;
    color: white;
    border-radius: 10px;
  }

  .execute-btn {
    min-width: 100px;
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