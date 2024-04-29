import styled from 'styled-components/native';

export const Container = styled.TouchableOpacity`
  width: 100%;
  padding: 19px;
  align-items: center;
  justify-content: center;
  background-color: #DC1637;
  margin-bottom: 8px;
  margin-top: 8px;
  flex-direction: row;
  border-radius: 8px; 
`;

export const Title = styled.Text`
  font-size: 15px;
  color: #FFFFFF;
  margin-left: 7px;
`;

export const GoogleButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: #DB4437;
  height: 50px;
  padding-horizontal: 15px;
  border-radius: 7px;
`;

export const ButtonText = styled.Text`
  color: white;
  margin-left: 10px;
  font-size: 16px;
  font-weight: bold;
`;
