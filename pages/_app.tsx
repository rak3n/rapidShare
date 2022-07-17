import '../styles/globals.css';
import '../styles/DragnDrop.css';
import { ChakraProvider } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import Head from 'next/head'

function MyApp({ Component, pageProps }: AppProps) {
	return (<ChakraProvider>
    <Head>
        <title>Rapid Share</title>
        <meta name="description" content="Share files blazingly fast" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
		<Component {...pageProps} />
	</ChakraProvider>);
}

export default MyApp;
