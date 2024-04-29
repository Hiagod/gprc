  import React, { useEffect, useState } from 'react';
  import { Dimensions, Keyboard, KeyboardAvoidingView, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
  import { Container, WelcomeText, AddButton, Text,  ClassTitle, ClassItem, ClassSubtitle,AddButtonText } from './styles';
  import { useRoute } from '@react-navigation/core';
  import { FontAwesome } from '@expo/vector-icons';
  import { FlashList } from "@shopify/flash-list";
  import { useNavigation } from '@react-navigation/native';

  interface User {
    email: string,
    id: string, 
    name: string, 
    photo: string
  }

  interface Class {
    id: string;
    name: string;
    subject: string;
  }

  export function Home() {
    const [load,setLoad] = useState(true)

    const [userInfo, setUserInfo] = useState(null);
    const [userId, setUserId] = useState(null);

    const [classes, setClasses] = useState<Class[]>([]);
    const navigation = useNavigation();

    const handleAdd = () => {
    navigation.navigate('ClassForm', {userId:userId});

    };

    const handleSelectClass = (id: string) => {
      navigation.navigate('Class', {userId:userId,id:id});
  
    };
    const route = useRoute(); 
    useEffect(() => { 
      const fetchUserInfo = async () => {
        if (route.params) {
          const user: User = route.params;
          setUserInfo(user);
  
          const response = await fetch(``);
          if (response.ok) {
            const data = await response.json();
            setUserId(data.id);
  
            const turmasResponse = await fetch(``);
            if (turmasResponse.ok) {
              const turmasData = await turmasResponse.json();
              setClasses(turmasData); 
       
               } else {
              console.error('Erro ao obter turmas do professor:', turmasResponse.status);
            }
          } else {
            console.error('Erro ao obter ID do professor:', response.status);
          }
        }
      };
      fetchUserInfo();
    }, [route.params,load]);

    useEffect(()=>{
      navigation.addListener('focus', ()=>setLoad(!load))
   },[load, navigation])
    
  
    if (!userInfo) {
      return null;
    }

    const userName = userInfo.name;
    return (
      <Container>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior="position" enabled>
          <WelcomeText>Bem-vindo,{"\n"}{userName}</WelcomeText>
          <Text>Suas Turmas</Text>
          {classes.length > 0 ? (
            <View style={{ height: Dimensions.get("screen").height/2 , width: Dimensions.get("screen").width }}>
              <FlashList
                data={classes}
                renderItem={({ item }) =>  
                  <TouchableOpacity onPress={() => handleSelectClass(item.id)}>
                    <ClassItem>
                      <ClassTitle>{item.nome} - {item.numero}</ClassTitle>
                    </ClassItem>
                  </TouchableOpacity>
                }
                estimatedItemSize={100} 
              />
            </View>
          ) : (
            <Text>Você ainda não tem turmas cadastradas</Text>
          )}
          <AddButton style={{elevation: 4}} onPress={()=> handleAdd()}>
            <AddButtonText> Adicionar nova turma </AddButtonText>
          </AddButton>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Container >

    );
  }
function useFocusEffect(arg0: () => void) {
  throw new Error('Function not implemented.');
}

