import React, { Component } from 'react';
import styled, { ThemeProvider, injectGlobal } from 'styled-components';

import Header from './Header';
import Meta from './Meta';

const StyledPage = styled.div`
  background: ${props => props.theme.backgroundColor};
  color: ${props => props.theme.textColor};
`;

const Inner = styled.div`
  max-width: ${props => props.theme.maxWidth};
  margin: 0 auto;
  padding: 2rem;
`;

injectGlobal`
@font-face {
  font-family: 'radnika_next';
  src: url('./static/radnikanext-medium-webfont.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}
  html {
    box-sizing: border-box;
    /* set base font size to 10 so all rems are base 10 */
    font-size: 10px;
  }
  /* reset box sizing everywhere */
  *, *:before, *:after {
    box-sizing: inherit;
  }
  body {
    padding: 0;
    margin: 0;
    font-size: 1.5rem;
    line-height: 2;
    font-family: 'radnika_next';

  }
  a {
    text-decoration: none;
    color: black
  }
`;

class Page extends Component {
  render() {
    const { theme, on, onClick } = this.props;

    return (
      <ThemeProvider theme={theme}>
        <StyledPage>
          <Meta />
          <button on={on} onClick={onClick}>
            Change Theme
          </button>
          <Header />
          <Inner>{this.props.children}</Inner>
        </StyledPage>
      </ThemeProvider>
    );
  }
}

export default Page;
