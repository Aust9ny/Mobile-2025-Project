import React from "react";
import { View, Image, StyleSheet, ActivityIndicator } from "react-native";
import Icon from "../assets/Icon.png"; 

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={Icon}
        style={styles.icon}
        resizeMode="contain" 
      />
      <ActivityIndicator
        size="large"
        color="#F8FCF8"
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#115566",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 150,    
    height: 150,  
  },
  loader: {
    marginTop: 20,
  },
});
