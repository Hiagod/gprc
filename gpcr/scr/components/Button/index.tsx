import React, { useState } from 'react';
import { TouchableOpacity, TouchableOpacityProps, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';


import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from "expo-web-browser"
import * as Google from "expo-auth-session/providers/google"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useAuthRequest } from 'expo-auth-session/providers/google';
import { GoogleButton, ButtonText } from '../Button/styles';

WebBrowser.maybeCompleteAuthSession();

export function Button() {
  const [userInfo, setUserInfo] = React.useState(null)
  const [request, response, promptAsync] = useAuthRequest({
    iosClientId: "26036069333-q46pu4m77hdq9bb8nb0a88n2nt0vm7ep.apps.googleusercontent.com",
    androidClientId:"26036069333-ev4jgnbb6g9sc304cq269nfaeloldsvu.apps.googleusercontent.com",
    webClientId: "26036069333-q571f6km4j65uh0480g3in7qu4pivo07.apps.googleusercontent.com",


  })
  
  React.useEffect(() => 
  {
    
    handleSignInWithGoogle();
  }, [response])
  
  const navigation = useNavigation();
  async function handleSignInWithGoogle() {
    
    const user = await AsyncStorage.getItem("@user")

    if( !user) {
      if(response?.type === "success"){

        await getUserInfo(response.authentication.accessToken)

      }
    }
    else {
      setUserInfo(JSON.parse(user));
    }
  }

  const getUserInfo = async (token: string) => {

    if (!token) {return}
    try {
      console.log(token)
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}`}
        }
      );
      const user = await response.json();
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      setUserInfo(user);

    }catch(error){
      console.log(error)
    }
  }
  const handleSignInPress = async () => {
    const result = await promptAsync(); 
    if (result.type === 'success') {
      try {
      await cadastrarProfessor(userInfo);
    } catch (error) {
      console.log('Autenticação falhou:', error);
    }
      navigation.navigate('Home', userInfo);
    } else {

      console.log('Autenticação falhou:');
    }
  };

  const cadastrarProfessor = async (userInfo) => {
    try {
      const response = await fetch('', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: userInfo.name,
        email: userInfo.email,
        token: userInfo.id
      }),
    }
    );
      if (response.ok) {
        console.log('Professor cadastrado com sucesso');
        await AsyncStorage.setItem('@user', JSON.stringify(userInfo));
        setUserInfo(userInfo);
      } else {
        console.log('Erro ao cadastrar professor:', response.statusText);
      }
    } catch (error) {

      console.error('Erro ao cadastrar professor:', error);
    }
  };
  return (
    <GoogleButton onPress={handleSignInPress} style={{elevation: 4}}>
    <FontAwesome name="google" size={24} color="white" />
    <ButtonText>Entrar com conta Google</ButtonText>
  </GoogleButton>
  );
}