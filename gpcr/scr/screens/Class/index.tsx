import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Container, AddButtonText, AddButton } from './styles';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Title } from '../../components/Header/styles';

import Svg, { Rect, Text as SvgText } from 'react-native-svg';


function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const formattedDay = day < 10 ? '0' + day : day;
  const formattedMonth = month < 10 ? '0' + month : month;
  return `${formattedDay}/${formattedMonth}/${year}`;
}

function formatDate2(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const formattedDay = day < 10 ? '0' + day : day;
  const formattedMonth = month < 10 ? '0' + month : month;
  return `${year}-${formattedMonth}-${formattedDay}`;
}

function Legend({ color, label }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
      <View style={{ width: 15, height: 15, backgroundColor: color, marginRight: 5 }} />
      <Text>{label}</Text>
    </View>
  );
}

export function Class() {
  const route = useRoute();
  const navigate = useNavigation();
  const classInfo = route.params;
  const [currentDate, setCurrentDate] = useState('');
  const [currentDate2, setCurrentDate2] = useState('');

  const [green, setGreen] = useState(0);
  const [red, setRed] = useState(0);

  useEffect(() => {


    const fetchData = async () => {
      const interval = setInterval(() => {
        const currentDate = new Date();
        const currentDate2 = new Date();

        const formattedDate = formatDate(currentDate);
        setCurrentDate(formattedDate);

        const formattedDate2 = formatDate2(currentDate2);
        setCurrentDate2(formattedDate2);

      },1000 )
      try {
        await fetch('', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            turma_id: classInfo.id,
            data: currentDate2,
          }),
        });
        console.log(currentDate2)
        const response = await fetch(``);
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          
          const greenCount = data.presencas.filter(aluno => aluno.presente === true).length;
          const redCount = data.presencas.length - greenCount;
          
          setGreen(greenCount); 
          setRed(redCount); 
        } else {
          console.error('Erro ao obter presenças e faltas:', response.status);
        }
      } catch (error) {
        console.error('Erro ao atualizar presenças e faltas:', error);
      }
    };
  
    fetchData();
  }, []);
  
  const handleCall = () => {
    navigate.navigate('Attendance', classInfo);
  };

  
  
  
  const barWidth = 50;
  const chartWidth = barWidth + 20;
  const total = 200;
  
  const greenPercentage = green / (green + red);
  const redPercentage = red / (green + red);

  const greenBarHeight = greenPercentage * total;
  const redBarHeight = redPercentage * total;


  return (
    <Container>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Title style={{ fontSize: 18, marginTop: 20, marginBottom: 20 }}>{currentDate}</Title>
        <Svg width={chartWidth*2} height={total}>
        <Rect
            x={0}
            y={total - greenBarHeight} 
            width={barWidth}
            height={greenBarHeight} 
            fill="green"
        />
        <SvgText
          x={barWidth / 2} 
          y={total - greenBarHeight + 20} 
          fill="white" 
          fontSize="14" 
          textAnchor="middle" 
        >
          {green} 
        </SvgText>
        <Rect
              x={chartWidth}
              y={total - redBarHeight} 
              width={barWidth}
              height={redBarHeight} 
              fill="red"
        />
         <SvgText
          x={(barWidth*2)-5} 
          y={total - redBarHeight + 20} 
          fill="white" 
          fontSize="14" 
          textAnchor="middle" 
        >
          {red}
        </SvgText>
      </Svg>
        <View style={{ flexDirection: 'colunm', marginTop: 10 }}>
          <Legend color="#4caf50" label="Presença" />
          <Legend color="#f44336" label="Falta ou não verificado" />
        </View> 
      </View>
            <AddButton onPress={() => handleCall()} style={{ elevation: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', width: 240, height: 80,  borderColor: '#ccc', borderWidth: 1, borderRadius: 7 }}>
        <AddButtonText style={{ color: 'black', fontSize: 20 }}>Fazer Chamada</AddButtonText>
      </AddButton>
    </Container>
  );
}
