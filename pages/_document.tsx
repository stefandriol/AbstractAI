import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <script
            type="text/javascript"
            id="MathJax-script"
            async
            src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
            onLoad={() => {
              window.MathJax = {
                tex: {
                  inlineMath: [['$', '$']]
                },
                startup: {
                  ready: () => {
                    window.MathJax.startup.defaultReady();
                  }
                }
              };
            }}
          ></script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;


