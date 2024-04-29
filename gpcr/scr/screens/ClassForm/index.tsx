import React, { useEffect, useState } from 'react';
import { Dimensions, Keyboard, KeyboardAvoidingView, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Modal, StyleSheet } from 'react-native';
import { Container, WelcomeText, AddButton, Text, ClassTitle, ClassItem, ClassSubtitle } from './styles';
import { FontAwesome } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { User } from '@react-native-google-signin/google-signin';
import { useNavigation, useRoute  } from '@react-navigation/native';

import DocumentPicker from 'react-native-document-picker';
import {writeFile,readFile, DownloadDirectoryPath} from 'react-native-fs';
import FileSystem from "expo-file-system"
import RNFetchBlob from 'rn-fetch-blob';
import XLSX from 'xlsx';

interface Student {
  name: string;
  registration: string;
}

export function ClassForm() {
  const [className, setClassName] = useState('');
  const [classNumber, setClassNumber] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');


  const [students, setStudents] = useState<Student[]>([]); 
  const [modalVisible, setModalVisible] = useState(false);
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  const [fileResponse, setFileResponse] = useState([]);

  const navigation = useNavigation();
  const route = useRoute();

  const userId = route.params.userId;


  const handleOpenExplanationModal = () => {
    setShowExplanationModal(true);
  };

  const handleCloseExplanationModal = () => {
    setShowExplanationModal(false);
  };


  const handleAddStudent = () => {
    if (!studentNumber || !studentName) {
      
      alert('Por favor, preencha todos os campos para adicionar um aluno.');
      return;
    }
    const isDuplicate = students.some(student => student.registration === studentNumber);
        if (isDuplicate) {
      alert('Matrícula já existe na lista!');
      return;
    }
    const newStudent = {
      name: studentName.toUpperCase(), 
      registration: studentNumber.toUpperCase(), 
    
    };
    
    setStudents([...students, newStudent]);
    setModalVisible(false);
    setStudentName('');
    setStudentNumber('');
  };
  const handleFileUpload = async () => {
    try {
      const pickedFile = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      readFile(pickedFile[0].uri, 'ascii')
      .then(pickedFile =>{

        const wb = XLSX.read(pickedFile, {type: 'binary'});
        const wsname = wb.SheetNames[0];
        const ws = wb. Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, {header:1});
        const newStudents = [];


        
        for (let i = 1; 1 < data.length; ++i){

          const isDuplicate = students.some(student => student.registration === data[i][0])
          const newStudent: Student = {
            name: data[i][1],
            registration: data[i][0]
          };
          if(!isDuplicate){
            newStudents.push(newStudent);
            setStudents([...students, ...newStudents]);
          }
          

        }

      }


      )
    } catch (error) {
      console.error('Erro ao selecionar o arquivo:', error);
    }  }

  

  function handleGoBack(): void {
    navigation.goBack();
  }


  const handleSaveClass = async () => {
    try {
      const response = await fetch('', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: className,
          numero: classNumber,
          professor_id: userId, 
        }),
      });
      if (response.ok) {
        const turmaData = await response.json();
        const alunosData = students.map(aluno => ({
          nome: aluno.name,
          matricula: aluno.registration,
          foto: null, 
          turma_id: turmaData.id, 
        }));
  
        const alunoResponse = await fetch('', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ turma_id: turmaData.id, alunos: alunosData }),
        });
  
        if (alunoResponse.ok) {
          console.log('Todos os alunos foram cadastrados com sucesso na turma.');
          handleGoBack(); 
        } else {
          const errorMessage = await alunoResponse.text();
          console.error('Erro ao cadastrar alunos:', errorMessage);
        }
      } else {
        const errorMessage = await response.text();
        console.error('Erro ao cadastrar turma:', errorMessage);
      }
    } catch (error) {
      console.error('Erro ao enviar a solicitação para cadastrar turma:', error);
    }
  };


  return (
    <Container>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior="padding" enabled>
          <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
          <WelcomeText>Cadastro de Turma
          </WelcomeText>
          <TouchableOpacity style={styles.button} onPress={() => handleOpenExplanationModal()}>
                <FontAwesome name="question-circle" size={25} color="black" />
            </TouchableOpacity>
        
          </View>
          
          <View style={{ height: Dimensions.get("screen").height / 2, width: Dimensions.get("screen").width }}>
            <ClassItem>
              <TextInput
                style={{ borderColor: 'black', height: 50, borderWidth: 1, borderRadius: 5, paddingHorizontal: 10 }}
                placeholder="Digite a disciplina  ex: PROGRAMAÇÃO I"
                onChangeText={text => setClassName(text)}
                value={className}
              />
            </ClassItem>

            <ClassItem>
              <TextInput
                style={{ height: 50, borderColor: 'black', borderWidth: 1, borderRadius: 5, paddingHorizontal: 10 }}
                placeholder="Digite a turma   ex: TURMA 01"
                onChangeText={text => setClassNumber(text)}
                value={classNumber}
              />
            </ClassItem>

            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <AddButton style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', width: 80, height: 80, borderRadius: 10, marginRight: 30 }}>
                <TouchableOpacity style={{ width: 80, height: 80, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderRadius: 50 }} onPress={() => setModalVisible(true)} >
                  <FontAwesome name="user-plus" size={18} color="black" />
                </TouchableOpacity>
              </AddButton>

              <AddButton style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', width: 80, height: 80, borderRadius: 10,   marginRight: -15
 }}>
                <TouchableOpacity style={{ width: 80, height: 80, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderRadius: 50 }} onPress={() =>handleFileUpload()   }>
                  <FontAwesome name="file-excel-o" size={18} color="black" />
                </TouchableOpacity>
              </AddButton>
             
            </View>
            <Text style={{ color: '#333', fontSize: 16, marginTop: 0, marginBottom: 10 }}>Quantidade de Alunos: {students.length}</Text>

            <View style={{ height: Dimensions.get("screen").height / 4, width: Dimensions.get("screen").width }}>

              <FlashList
                data={students} 
                renderItem={({ item }) =>
                  <ClassItem style={{ marginBottom: 0, marginTop: 0, backgroundColor: 'white', paddingBottom: 1, paddingTop: 0 }}>
                    <ClassTitle style={{ textAlign: 'left', marginBottom: 0, marginTop: 0 }}> 
                   {"  "}{item.registration} - {item.name.length > 25 ? item.name.toUpperCase().substring(0, 22) + '...' : item.name.toUpperCase()}
                    </ClassTitle>
                  </ClassItem>
                }
                estimatedItemSize={100} 
              />
            </View>
            <AddButton style={{ elevation: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', width: 140, height: 80,  borderColor: '#ccc', borderWidth: 1, borderRadius: 7 }}>
              <TouchableOpacity onPress={() => handleSaveClass()} style={{ justifyContent: 'center', alignItems: 'center', width: 90, height: 80 }}>
                <ClassSubtitle style={{ color: 'black', fontSize: 20, fontWeight: 'bold', textAlign: 'center' }} >Cadastrar</ClassSubtitle>
              </TouchableOpacity>
            </AddButton>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer} >
          <View style={styles.modalContent}>
            <TextInput
              style={{ height: 50, borderColor: 'black', borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginBottom: 10 }}
              placeholder="Matrícula"
              onChangeText={text => setStudentNumber(text)} 
              value={studentNumber}
            />
            <TextInput
              style={{ height: 50, borderColor: 'black', borderWidth: 1, borderRadius: 5, paddingHorizontal: 10 }}
              placeholder="Nome"
              onChangeText={text => setStudentName(text)} 
              value={studentName}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <AddButton style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', width: 80, height: 80, borderRadius: 10, marginRight: 30 }}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={{ justifyContent: 'center', alignItems: 'center', borderRadius: 20, width: 80, height: 80 }}>
                  <FontAwesome name="arrow-left" size={28} color="black" />
                </TouchableOpacity>
              </AddButton>
              <AddButton style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', width: 80, height: 80, borderRadius: 10 }}>
                <TouchableOpacity onPress={() => handleAddStudent()} style={{ justifyContent: 'center', alignItems: 'center', borderRadius: 20, width: 80, height: 80 }}>
                    <FontAwesome name="check" size={28} color="black" />
                  </TouchableOpacity>
                </AddButton>
              </View>

          </View>
        </View>
      </Modal>

      <Modal
        visible={showExplanationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => handleCloseExplanationModal()}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>- O campo "Disciplina" é onde você digita o nome da disciplina, por exemplo, "CÁlCULO II".</Text>
            <Text style={styles.modalText}>- O campo "Turma" é onde você digita o identificador da turma, como um número, por exemplo, "TURMA 01".</Text>
            <Text style={styles.modalText}>- Você pode preencher os alunos individualmente no botão <FontAwesome name="user-plus" size={18} color="black" />.</Text>
            <Text style={styles.modalText}>- Também é possível preencher os alunos por meio de um arquivo CSV pressionando o botão  <FontAwesome name="file-excel-o" size={18} color="black" />.</Text>
            <Text style={styles.modalText}>- Certifique-se de que o arquivo CSV tenha duas colunas, uma para o número de registro (ou matrícula) e outra para o nome, nessa ordem.</Text>
            <Text style={styles.modalText}>- Após preencher os dados, a lista de alunos e sua quantidade serão exibidos abaixo para que você possa conferir.</Text>
            
          </View>
        </View>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    borderColor: "black"

  },
  modalText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom:10,
    marginTop:0,
    textAlign: 'justify'
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    
    width: 25,
    height: 25,
    marginTop: 20,
    marginRight: 20,


  },
 
  closeButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'flex-end',
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
function setUserInfo(user: User) {
  throw new Error('Function not implemented.');
}

