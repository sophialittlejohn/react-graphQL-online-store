import App, { Container } from 'next/app';

import Page from '../components/Page';
import { lightTheme } from '../components/styles/themes/lightTheme';
import { darkTheme } from '../components/styles/themes/darkTheme';

class MyApp extends App {
  state = {
    switched: false
  };

  toggleSwitch = () => {
    this.setState(prevState => {
      return {
        switched: !prevState.switched
      };
    });
  };

  render() {
    const { Component } = this.props;

    return (
      <Container>
        <Page
          theme={this.state.switched ? darkTheme : lightTheme}
          onClick={this.toggleSwitch}
          on={this.state.switched}
        >
          <Component />
        </Page>
      </Container>
    );
  }
}

export default MyApp;
