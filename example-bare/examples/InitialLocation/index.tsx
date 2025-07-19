import * as React from 'react';
import { SafeAreaView, useWindowDimensions } from 'react-native';
import { Reader, ReaderProvider } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/file-system';
import { styles } from './styles';

const replaceLinksScriptString = /* js */ `
  // replaceLinks stolen from https://github.com/futurepress/epub.js/blob/f09089cf77c55427bfdac7e0a4fa130e373a19c8/src/utils/replacements.js#L75
  // Modified to use onmouseup instead of onclick and to stand on its own without custom Url or Path classes.
  const replaceLinks = (contents, fn) => {
    var links = contents.querySelectorAll("a[href]");

    if (!links.length) {
      return;
    }

    var base = contents.ownerDocument.querySelector("base");
    var location = base ? base.getAttribute("href") : undefined;
    var replaceLink = function(link){
      var href = link.getAttribute("href");
      if(href.indexOf("mailto:") === 0){
        return;
      }
      var absolute = (href.indexOf("://") > -1);
      if (absolute) {
        link.setAttribute("target", "_blank");
      } else {
        var linkUrl;
        try {
          // Changed from epubjs custom Url to native URL
          linkUrl = new URL(href, location);
        } catch(error) {
          // NOOP
        }
        // Changed from onclick, since that isn't happening in the webview
        link.onmouseup = function(){
          if(linkUrl && linkUrl.hash) {
            // changed from linkUrl.Path.path.
            fn(linkUrl.pathname + linkUrl.hash);
          } else if(linkUrl){
            // changed from linkUrl.Path.path.
            fn(linkUrl.pathname);
          } else {
            fn(href);
          }

          return false;
        };
      }
    }.bind(this);
    for (var i = 0; i < links.length; i++) {
      replaceLink(links[i]);
    }
  }
  const replaceAllRenderedLinks = () => rendition.getContents().forEach(x => replaceLinks(x.content, (href) => {
    x.emit("linkClicked", href);
  }));
  replaceAllRenderedLinks();
  rendition.on("relocated", replaceAllRenderedLinks);
`;

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
            /* js */ `
              setTimeout(() => {
                ${replaceLinksScriptString}
              }, 500)
            `
          }
        />
      </SafeAreaView>
    </ReaderProvider>
  );
}
