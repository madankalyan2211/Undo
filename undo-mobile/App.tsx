import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { Asset } from 'expo-asset';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const MOBILE_HTML = require('./assets/mobile.html');

export default function App() {
  const [htmlUri, setHtmlUri] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    Asset.fromModule(MOBILE_HTML).downloadAsync()
      .then((asset) => {
        if (active) setHtmlUri(asset.localUri || asset.uri);
      })
      .catch(() => {
        if (active) setLoadFailed(true);
      });
    return () => { active = false; };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />
      <View style={styles.container}>
        {htmlUri ? (
          <WebView
            source={{ uri: htmlUri }}
            originWhitelist={['file://*']}
            javaScriptEnabled
            domStorageEnabled
            allowFileAccess
            allowFileAccessFromFileURLs
            setSupportMultipleWindows={false}
            mixedContentMode="never"
            onError={() => setLoadFailed(true)}
          />
        ) : (
          <ActivityIndicator color={loadFailed ? '#ef4444' : '#ffffff'} size="large" />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
});
