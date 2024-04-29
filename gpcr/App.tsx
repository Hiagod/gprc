import React from 'react';
import { SignIn } from './scr/screens/SignIn';
import { Home } from './scr/screens/Home';
import { Class } from './scr/screens/Class';
import { ClassForm } from './scr/screens/ClassForm';
import { Attendance } from './scr/screens/Attendance';



import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function App() {
  return (

    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false

        }}
        
        initialRouteName="Sign"
        >
        <Stack.Screen name="Sign" component={SignIn} />
        <Stack.Screen name="Home" component={Home}  />
        <Stack.Screen name="Class" component={Class}  />
        <Stack.Screen name="Attendance" component={Attendance}  />
        <Stack.Screen name="ClassForm" component={ClassForm}  />



      </Stack.Navigator>
    </NavigationContainer>

  );
}