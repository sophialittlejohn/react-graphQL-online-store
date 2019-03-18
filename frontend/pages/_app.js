import App, { Container } from 'next/app';
import { ApolloProvider } from 'react-apollo';
import withData from '../lib/withData';

import Page from '../components/Page';
import { lightTheme } from '../components/styles/themes/lightTheme';
import { darkTheme } from '../components/styles/themes/darkTheme';
import { userInfo } from 'os';

class MyApp extends App {
  state = {
    switched: false
  };

  // this is needed because we're using next (server side rending)
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }
    // this exposes the query to the userInfo
    pageProps.query = ctx.query;
    return { pageProps };
  }

  toggleSwitch = () => {
    this.setState(prevState => {
      return {
        switched: !prevState.switched
      };
    });
  };

  render() {
    const { Component, apollo, pageProps } = this.props;

    return (
      <Container>
        <ApolloProvider client={apollo}>
          <Page
            theme={this.state.switched ? darkTheme : lightTheme}
            onClick={this.toggleSwitch}
          >
            <Component {...pageProps} />
          </Page>
        </ApolloProvider>
      </Container>
    );
  }
}

export default withData(MyApp);
