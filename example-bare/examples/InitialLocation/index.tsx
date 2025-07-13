import * as React from 'react';
import { SafeAreaView, useWindowDimensions } from 'react-native';
import { Reader, ReaderProvider } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/file-system';
import { styles } from './styles';

export function InitialLocation() {
  const { width, height } = useWindowDimensions();
  return (
    <ReaderProvider>
      <SafeAreaView style={styles.container}>
        <Reader
          src="https://s3.amazonaws.com/moby-dick/OPS/package.opf"
          width={width}
          height={height * 0.9}
          fileSystem={useFileSystem}
          initialLocation="toc.xhtml"
          injectedJavascript={
            // TODO: running below in console logs 'hoo boy' every 3 seconds, but not working here.
            /* js */ `setTimeout(() => {
            rendition.getContents().forEach(x => {
              const rootDoc = x.root().parentNode
              const script = rootDoc.createElement('script');
              script.innerHTML='setInterval(() => console.log("hoo boy"), 3000)'
              rootDoc.head.appendChild(script);
            })
          })`
          }
        />
      </SafeAreaView>
    </ReaderProvider>
  );
}
