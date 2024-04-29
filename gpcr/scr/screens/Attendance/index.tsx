import React, { useEffect, useState, useRef } from 'react';
import { Dimensions, Image, Keyboard, KeyboardAvoidingView, TouchableOpacity, TouchableWithoutFeedback, View, Text, Modal, Button, ActivityIndicator } from 'react-native';
import { Container, WelcomeText, AddButton, ClassTitle, ClassItem, ClassSubtitle } from './styles'; 
import { useRoute } from '@react-navigation/core';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { Camera, useCameraDevice, useFrameProcessor, useCameraPermission, CameraPosition, useCameraDevices } from 'react-native-vision-camera';

interface User {
  email: string;
  id: string;
  name: string;
  photo: string;
}

interface Class {
  id: string;
  name: string;
  subject: string;
}
interface Student {
  id: string;
  name: string;
  registration: string;
}

export function Attendance() {
  const route = useRoute();
  const navigate = useNavigation();
  const camera = useRef(null);
  const intervalRef = useRef(null);
  const classInfo = route.params;
  const [classes, setClasses] = useState<Student[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const {hasPermission, requestPermission} = useCameraPermission();
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>('front');
  const [imageSource, setImageSource] = useState('');
  const [alunoId, setAlunoId] = useState(0); 

  const renderIcon = () => {
    switch (status.icon) {
      case 'spinner':
        return <ActivityIndicator color="black" size="small" />;
      case 'check':
        return <FontAwesome name="check-circle" size={24} color="black" />;
      case 'times':
        return <FontAwesome name="times-circle" size={24} color="black" />;
      default:
        return null;
    }
  };
  const device = useCameraDevice('front')
  const [status, setStatus] = useState({ text: 'Analisando...', color: 'rgba(255, 255, 0, 0.8)', icon: 'spinner' }); 

  const enviarFoto = async () => {
    try {
      if (!alunoId || alunoId === '') {
        console.error('Nenhum aluno selecionado.');
        return;
      }
  
      if (!imageSource) {
        console.error('Nenhuma imagem selecionada.');
        return;
      }

  
      const verificarFotoResponse = await fetch(``);
  
      if (!verificarFotoResponse.ok) {
        console.error('Erro ao verificar a foto:', verificarFotoResponse.status);
      }
  
      const verificarFotoData = await verificarFotoResponse.json();
      if (verificarFotoData.foto_base64) {
        console.error('O aluno já possui uma foto associada.');
        return;
      }
      const imageResponse = await fetch(`file://${imageSource}`);
      const blobData = await imageResponse.blob();
      const base64Data = await blobToBase64(blobData)


      const uploadResponse = await fetch(``, {
        method: 'POST',
        body: JSON.stringify({ foto: base64Data }),
        headers: {
          'Content-Type': 'application/json',
          },
        });

  

    if (uploadResponse.ok) {
      console.log('Imagem enviada com sucesso.');
      setImageSource('');
      handleCloseModal();
    } else {
      console.error('Falha ao enviar imagem:', uploadResponse.statusText);
    }
  } catch (error) {
    console.error('Erro ao enviar imagem:', error);
  }
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      switch (status.text) {
        case 'Analisando':
          setStatus({ text: 'Confirmado', color: 'rgba(0, 255, 0, 0.8)', icon: 'check' });
          break;
        case 'Confirmado':
          setStatus({ text: 'Face não reconhecida', color: 'rgba(255, 0, 0, 0.8)', icon: 'times' });
          break;
        case 'Face não reconhecida':
          setStatus({ text: 'Analisando', color: 'rgba(255, 255, 0, 0.8)', icon: 'spinner' });
          break;
        default:
          break;
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if(!hasPermission) {
      requestPermission();
    }
    setStatus({ text: 'Face não reconhecida', color: 'red', icon: 'times' });
  }, [hasPermission]);

  if(!hasPermission){
    return <ActivityIndicator />
  }
  if(!device){
    return <Text>Camera device not found</Text>
  }

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(``);
        if (response.ok) {
          const data = await response.json();
          setClasses(data);
        } else {
          console.error('Erro ao obter alunos da turma:', response.status);
        }
      } catch (error) {
        console.error('Erro ao obter alunos da turma:', error);
      }
    };

    fetchStudents();
  }, [classInfo.id]); 

  const handleOpenModal = (alunoId: string) => {
    console.log("Aluno selecionado:", alunoId);
    setAlunoId(alunoId);

    setIsModalVisible(true);
  };
  
  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    startCapture(); 
  }, [alunoId]);

  const startCapture = () => {
    intervalRef.current = setInterval(async () => {
      try {
        
        if (camera.current !== null) {
          const photo = await camera.current.takePhoto();
          setImageSource(photo.path);
          await enviarFoto();
  
          clearInterval(intervalRef.current);
        }
      } catch (error) {
        console.error('Erro ao capturar ou enviar a foto:', error);
      }
    }, 3000); 
  };


  function blobToBase64(blob){
    return new Promise((resolve, _) =>{
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob)
  });
  }

  
  return (
    <Container  >
      <View style={{ height: Dimensions.get("screen").height*0.80 , width: Dimensions.get("screen").width, marginTop:20 }}>

      <FlashList 
       data={classes.sort((a, b) => a.nome.localeCompare(b.nome))}
        renderItem={({ item }) =>  
        <TouchableOpacity onPress={()=>{handleOpenModal(item.id) }}>
      <ClassItem 
        style={{ 
          marginBottom: 0, 
          marginTop: 0, 
          backgroundColor: item.presente ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)', 
          paddingTop: 0, 
          paddingBottom: 0
        }}
      >
        <ClassTitle style={{ textAlign: 'left', marginBottom: 0, marginTop: 0 }}>
        {`${item.matricula} - ${item.nome.toUpperCase()}`}
        </ClassTitle>
      </ClassItem>
    </TouchableOpacity>
  }
  estimatedItemSize={53} 

/>
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>

          <TouchableOpacity onPress={handleCloseModal} style={{ position: 'absolute', top: 0, left: 0, padding: 10, zIndex: 999 }}>
            <FontAwesome name="arrow-left" size={28} color="black" />
          </TouchableOpacity>

    
              <Camera device={device} isActive={true} style={{ height: Dimensions.get("screen").height * 0.6, width: Dimensions.get("screen").width }}  photo={true} ref={camera}/>
            
          
          <View style={{ position: 'absolute', bottom: 20, backgroundColor: `${status.color}66`, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center' }}>
            {renderIcon()}
            <Text style={{ color: 'black', textAlign: 'center', marginLeft: 10 }}>{status.text}</Text>
          </View>

        </View>
      </Modal>
    </Container>
  );
}


