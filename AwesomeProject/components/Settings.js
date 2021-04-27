import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  TouchableHighlight,
  FlatList,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import database from '@react-native-firebase/database';
import * as styles from './styles.js';

const Drawer = (props)=>{
  const [drawer, changeDrawer] = useState(false);
  return(
    <View>
      <TouchableHighlight 
        style={styles.navigationButtons}
        onPress = {() => {
          changeDrawer(!drawer);
        }}
      >
        <Text>Open Navigation Drawer</Text>
      </TouchableHighlight>
      {drawer &&
        <View style={styles.Drawercont}>
          <TouchableHighlight 
            onPress={()=> 
              changeDrawer(!drawer)
            } 
            style={styles.navigationButtons}
          >
            <Text>Close</Text>
          </TouchableHighlight>
          <TouchableHighlight 
            onPress={()=>
              props.navigation.navigate("ProjectCreation", {user:props.userInfo})
            }
            style={styles.navigationButtons}
          >
            <Text>Project Creation</Text>
          </TouchableHighlight>
          <TouchableHighlight 
            onPress={()=>
              props.navigation.navigate("ProjectList", {user:props.userInfo})
            }
            style={styles.navigationButtons}
          >
            <Text>ProjectList</Text>
          </TouchableHighlight>
        </View>
      }
    </View>
  );
}
  
const TopBar = (props) => {
  return (
    <View style = {styles.container}>
      <View style = {styles.topBarContainer}>
        <TouchableHighlight
          onPress = {()=>{
            props.navigation.goBack();
          }}
        >
          <View>
            <Text>Go Back</Text>
          </View>
        </TouchableHighlight>
      </View>
      {props.children}
    </View>
  )
};

//Settings Page for the current logged in User takes in
//route, user- this is the usersID

export function Settings({ route, navigation }) {
  const [userEnteredPassword,changeUserEnteredPassword]=useState(''); // user entered password
  const [userEnteredPasswordForUsername,changeUserEnteredPasswordForUsername]=useState(''); // this takes a password first then a new username second
  const [password,changePassword]=useState(''); // pulled database password
  const [username,changeUser]=useState(''); // username
  const [inputTextForPassword,changeinputTextForPassword]=useState('Password'); // input text for background of box
  const [inputTextForUsername,changeinputTextForUsername]=useState('Password');
  const [Accepted,changeAccepted]=useState("False"); // password is true or false 
  const [usernameChangeValid,changeUsernameValidity]=useState("False"); // for changing the username

  //finds the username of the current logged in user
  const handleUsername = snapshot => {
      changeUser(snapshot.val().Username);
  }
  //finds the password of the current logged in user
  const handlePassword = snapshot => {
      changePassword(snapshot.val());
     
  }
  
  //test to see if the typed in password is the correct one
  const isPassword = () =>{
  
    //If the user entered the correct password and they have typed in a new password and hit enter
    // then their password will be changed
    if(Accepted=='True'){
      if(userEnteredPassword != ''){
        database().ref("/Database/Users/" + route.params.user).update({Password: userEnteredPassword});
        changeUserEnteredPassword('');
        changeAccepted('False');
        changeinputTextForPassword('Enter your password');
        database().ref("/Database/Users/" + route.params.user+"/Password").on("value", handlePassword);
      
      } else {
        changeAccepted('False');
        changeinputTextForPassword("Something Went Wrong");
      }    

    // If it its the correct password the user will enter in their new desired password
    } else if(userEnteredPassword==password){
      console.log("right");
      changeUserEnteredPassword('');
      changeAccepted('True');
      changeinputTextForPassword("Enter New Password");
    } else {
      console.log("wrong Password Try again");
      
      
    }
  }
  const changeUsername=()=>{
    if(userEnteredPasswordForUsername==password){
      changeUserEnteredPasswordForUsername('');
      changeUsernameValidity('True');
      changeinputTextForUsername("Enter New Username");
    }
    else if(usernameChangeValid=='True'){
      if(userEnteredPassword != ''){
        database().ref("/Database/Users/" + route.params.user).update({Username: userEnteredPasswordForUsername});
        changeUserEnteredPassword('');
        changeUsernameValidity('False');
        changeinputTextForUsername('Enter your password');
        database().ref("/Database/Users/" + route.params.user+"/Username").once("value", handleUsername);
      } else {
        changeUserEnteredPassword('');
        changeinputTextForUsername("Something Went Wrong");
      }   
    }
    else{
      console.log("wrong password try again");
    }
  }
  
  // finds username of current logged in user
  if(username==''){
    database().ref("/Database/Users/" + route.params.user).once("value", handleUsername);
  }
  //finds password of current logged in user
  if(password==''){
      database().ref("/Database/Users/" + route.params.user+"/Password").once("value", handlePassword);
  }

  return(
    <TopBar navigation = {navigation}>
      <Drawer userInfo={route.params.user} navigation={navigation}/>
      <View style={styles.settingsPage}>
        <View style = {styles.flexAlignContainer}>
          <Text>Hello {username} Welcome to your Settings</Text> 
          <Text>Enter your password to Change Your Username</Text>
          <View style={styles.textInputContainer}>
            <TextInput 
              onChangeText = {text => changeUserEnteredPasswordForUsername(text)}
              placeholder = {inputTextForUsername}
              value = {userEnteredPasswordForUsername}
            />
          </View>
          <TouchableHighlight 
            style={styles.buttonContainer} 
            onPress={()=>
              changeUsername()
            }
          >
            <Text style={styles.buttonText}>Enter</Text>
          </TouchableHighlight>
          <Text>Enter your password to Change Your password</Text>
          <View style={styles.textInputContainer}>
            <TextInput 
              onChangeText = {text => changeUserEnteredPassword(text)}
              placeholder = {inputTextForPassword}
              value = {userEnteredPassword}
            />
          </View>
          <TouchableHighlight 
            style={styles.buttonContainer} 
            onPress={()=>
              isPassword()
            }
          >
            <Text style={styles.buttonText}>Enter</Text>
          </TouchableHighlight>
        </View>
      </View>
    </TopBar>
  );
}
    