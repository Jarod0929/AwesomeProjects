/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableHighlight,
  TextInput,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import database from '@react-native-firebase/database';


function LogIn({ navigation }) {
  const [textUserName, changeTextUserName] = useState('');//For the Username Field
  const [textPassword, changeTextPassword] = useState('');//For the Password Field
  const [failed, changefailed] = useState(false);//Only sets to true when they failed once on account and sets feedback message
  /*const FirstUsers = database().ref("/Database/Users").push(); //First Account and is structure of how it should look
  FirstUsers.set({ 
    Username: "Fruit",
    Password: "Apple"
  });*/
  const samePassword = snapshot => {
    changefailed(true);
    changeTextPassword("");
    if(snapshot.val().Password === textPassword){
      changeTextUserName("");
      changefailed(false);
      navigation.navigate("ProjectList");
    }
    database().ref("/Database/Users").orderByChild("Username").equalTo(textUserName).off("child_added", samePassword); 
  };

  const isAccount = () => { //Checks if there is an account
    database().ref("/Database/Users").orderByChild("Username").equalTo(textUserName).on("child_added", samePassword);//Only works with on, not once
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <TouchableHighlight
        onPress = {() => navigation.navigate("CreateAccount")}
      >
        <View
          style = {styles.buttonLogIn}
        >
          <Text>Create Account</Text>
        </View>
      </TouchableHighlight>
      <TextInput
        style = {styles.textInputLogIn}
        onChangeText = {text => changeTextUserName(text)}
        placeholder = "UserName"
        value = {textUserName}
      />
      <TextInput
        style = {styles.textInputLogIn}
        onChangeText = {text => changeTextPassword(text)}
        placeholder = "Password"
        value = {textPassword}
      />
      <TouchableHighlight
        onPress = {isAccount}
      >
        <View
          style = {styles.buttonLogIn}
        >
          <Text>Press to LogIn</Text>
        </View>
      </TouchableHighlight>
      {failed &&
        <View>
          <Text>You Have Failed</Text>
        </View>
      }
    </View>
  );
}

function CreateAccount({ navigation }) {
  const [textUserName, changeTextUserName] = useState('');//For the Username Field
  const [textPassword, changeTextPassword] = useState('');//For the Password Field
  const [failed, changefailed] = useState(false);//Only sets to true when they failed once on account and sets feedback message
  const [succeed, changeSucceed] = useState(false);//Sets to true when succeed after passing by all names

  const anyPreviousUsernames = snapshot => {
    changeSucceed(false);
    changefailed(true);
    database().ref("/Database/Users").orderByChild("Username").equalTo(textUserName).off("child_added", anyPreviousUsernames); 
  };
  
  const createNewAccount = () => {
    //TODO: Find out way so Users can not spam and by pass multiple Usernames
    //Tried: Async and Promises shallowly
    //TODO: Also for some Reason you have to press the button twice
    changeSucceed(true);
    database().ref("/Database/Users").orderByChild("Username").equalTo(textUserName).on("child_added", anyPreviousUsernames);//Only works with on, not once

    if(succeed){
      changeSucceed(false);
      changefailed(false);
      database().ref("/Database/Users").push({
        Username: textUserName,
        Password: textPassword
      });
      navigation.navigate("LogIn");
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <TouchableHighlight
        onPress = {() => navigation.navigate("LogIn")}
      >
        <View
          style = {styles.buttonLogIn}
        >
          <Text>Go Back</Text>
        </View>
      </TouchableHighlight>
      <TextInput
        style = {styles.textInputLogIn}
        onChangeText = {text => changeTextUserName(text)}
        placeholder = "UserName"
        value = {textUserName}
      />
      <TextInput
        style = {styles.textInputLogIn}
        onChangeText = {text => changeTextPassword(text)}
        placeholder = "Password"
        value = {textPassword}
      />
      <TouchableHighlight
        onPress = {createNewAccount}
      >
        <View
          style = {styles.buttonLogIn}
        >
          <Text>Create Account</Text>
        </View>
      </TouchableHighlight>
      {failed &&
        <View>
          <Text>You Have Failed</Text>
        </View>
      }
    </View>
  );
}

function ProjectList ({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Hello World</Text>
    </View>
  );
}

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="LogIn">
        <Drawer.Screen name="LogIn" component={LogIn} />
        <Drawer.Screen name="CreateAccount" component={CreateAccount} />
        <Drawer.Screen name="ProjectList" component={ProjectList}/>
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  buttonLogIn: {
    alignItems: "center",
    backgroundColor: "orange",
    marginTop: 50,
    marginBottom: 50,
  },
  textInputLogIn: {
    marginTop: 50,
    marginBottom: 50,
  }
});