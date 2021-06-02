import React from 'react';
import {
  NavLink
} from 'react-router-dom';
import { StyledSideBar } from './styled';

function SideBar() {
  return (
    <StyledSideBar>
      <li className="name-app">File Management</li>
      <li>
        <NavLink exact to="/">Uploader</NavLink>
      </li>
    </StyledSideBar>
  );
}

export default SideBar;
