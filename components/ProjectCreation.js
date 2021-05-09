import React, {useState} from 'react';
import {
  Text,
  useColorScheme,
  View,
  TouchableHighlight,
  TextInput,
  FlatList,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
} from 'react-native';
import DatePicker from 'react-native-datepicker'
import database from '@react-native-firebase/database';
import Icon from "react-native-vector-icons/AntDesign";
import LinearGradient from 'react-native-linear-gradient'

import * as basicStyles from './styles/basicStyles.js';
import * as topBarStyles from './styles/topBarStyles.js';
import * as projectCreationStyles from './styles/projectCreationStyles.js';


/**
 * Establishes the entire container with all the children under the bar
 * 
 * @param {tag} {children} The rest of the tags of LogIn
 * @returns Top blue bar with all its children below it
 */



/*Project creation Page*/
export function ProjectCreation ({ route, navigation }) { 
  const today = new Date();
  const today_format = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, '0') + "-" + String(today.getDate()).padStart(2, '0');

  const user = route.params.user;//Current User
  const [projectName, changeProjectName] = useState('');//For the projectName field
  const [invUsers, changeInvUsers] = useState('');//For the inviteUsers field
  const [invUsersList, addUsersList] = useState([user]);//For the inviteUsers button
  const [date, setDate] = useState(today_format);//Date selector
  const [checkUser, changeCheckUser] = useState(null);//Used to check if user exists
  
  const addProjectIds = (userId, projectId) => {
    console.log(userId);
    //Gets projects[] from user  
  let add = database().ref(`/Database/Users/${userId}/projects`).on('value', snap => {
    
      if(snap.val() != null){
        let temp = snap.val();
        temp.push(projectId);
        //updates users project[] with newly created project
        database().ref(`/Database/Users/${userId}`).update({
          projects: temp,
        });
        database().ref(`/Database/Users/${userId}/projects`).off("value", add);
      }
      else{
        database().ref(`/Database/Users/${userId}`).update({
          projects: [projectId],
        });
        database().ref(`/Database/Users/${userId}/projects`).off("value", add);
      }
    });
  }

  //Resets all relevant states
  const resetEverything = () => {
    changeProjectName("");
    changeInvUsers("");
    addUsersList([user]);
  };

  //Creates the new Project using the previous states
  const createNewProject = () => {
    //Creates Base Task
    const baseTask = database().ref("/Database/Tasks").push({
      parentTask: "none",
      title: "Click Me to Edit!",
      text: "Add a description..."
    });
    //baseTask ID
    const taskKey = baseTask.key;
    //Sets base Task ID
    baseTask.update({ID: taskKey});
    if(projectName != ""){
      //Initializes the new project
      const newData = database().ref("/Database/Projects").push({
        title: projectName,
        descripton: "Enter a description",
        users: invUsersList,
        tasks: [taskKey],
        dueDate: date 
      });
      //Project ID
      const newDataKey = newData.key;
      //Sets project ID
      newData.update({ID: newDataKey});
      //Loops through users in invUsersList and adds project: id 
      
      invUsersList.forEach(element => addProjectIds(element, newDataKey));
      changeProjectName("");
      addUsersList([user]);
      navigation.navigate("ProjectList", {user: route.params.user, changed: newDataKey});
    }
  };
  //Adds users to list state to be used in createNewProject()
  const addUsersToList = () =>{
    let userID = "";
    //Checks if users exist
    let something = database().ref("/Database/Users").orderByChild("Username").equalTo(invUsers).on("value", snapshot => {
      for(let key in snapshot.val()){
        userID = key;
      }
      //IFF user exists adds them to list
      if(invUsers != "" && userID != ""){
        let list = invUsersList.slice();
        list.push(userID);
        addUsersList(list);
        changeCheckUser(true)
      }
      //Displays user does not exist
      else{
        changeCheckUser(false);
      }
      database().ref("/Database/Users").orderByChild("Username").equalTo(invUsers).off("value", something);
    });
    //Resets field for invUsers
    changeInvUsers("");
  };
    
  return (// TopBar is supposed to handle the Drawer and don't forget about it
    <TopBar navigation = {navigation} reset = {resetEverything} userInfo = {route.params.user}>
      <View style = {projectCreationStyles.container}>
        <TopGradient
          colors = {["#187bcd", '#2a9df4', '#1167b1']}
          start = {{ x: 1, y: 1 }}
          end = {{ x: 0, y: 0 }}
          text = "Create a Project"
        >
          <TopIcon
            iconName = "addfolder"
            iconColor = "blue"
            iconSize = {100}
          />
        </TopGradient>
        <ContainerGradient
              style = {projectCreationStyles.bottomLayerGradient}
              colors = {['white', "lightgray"]}
              start = {{ x: 1, y: 1 }}
              end = {{ x: 1, y: 0 }}
        >
          <View style = {{width: "100%"}}>
            <CreationBox
              projectName = {projectName}
              changeProjectName = {changeProjectName}
              date = {date}
              setDate = {setDate}
              invUsers = {invUsers}
              changeInvUsers = {changeInvUsers}
              addUsersList = {addUsersToList}
              checkUser = {checkUser}
            >
              <InviteUsersTH 
                onPress = {addUsersToList}
                style = {projectCreationStyles.buttonIcon}
                activeOpacity = {0.6}
                underlayColor = "#00181"
              >
              <Icon
                name = "addusergroup" 
                size = {35} 
              />
              </InviteUsersTH>
            </CreationBox>              
            <ButtonIconBox 
              onPress = {createNewProject}
              style = {projectCreationStyles.createButton}
              colors = {["#187bcd", '#2a9df4']}
              start = {{ x: 1, y: 1 }}
              end = {{ x: 1, y: 0 }}
              activeOpacity = {0.1}
              underlayColor = "#00181"
              name = "pluscircleo"
              color = "white"
            />
          </View>
        </ContainerGradient>
      </View>
    </TopBar>
  );
}

const TopBar = (props) => {
  const [drawer, changeDrawer] = useState(false);
  return (
    <View style = {basicStyles.container}>
      <View style = {topBarStyles.topBarContainer}>
        <View style = {topBarStyles.openContainer}>
          <ButtonBoxForNavigation
            onClick = {() => {
              changeDrawer(!drawer);
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            }}
            text = {"Open"}
            style = {topBarStyles.openAndDrawerButton}
          />
           
        </View>
      </View>
      <View style = {[topBarStyles.drawerContainer, drawer? undefined: {width: 0}]}>
        <ButtonBoxForNavigation
          onClick = {() => 
            changeDrawer(!drawer)
          } 
          text = {"Close"}
          style = {topBarStyles.navigationButtons}
        />
        <ButtonBoxForNavigation
          onClick = {() =>{
            props.navigation.goBack();
          }}
          text = {"Go Back"}
          style = {topBarStyles.navigationButtons}
        />
        <ButtonBoxForNavigation
          onClick ={() =>
            props.navigation.navigate("ProjectList", {user:props.userInfo})
          } 
          text = {"ProjectList"}
          style = {topBarStyles.navigationButtons}
        />
      </View>
      {props.children}
    </View>
  )
};
const ButtonBoxForNavigation = props => {
  return(
    <TouchableHighlight 
      style = {props.style}
      onPress = {props.onClick}
    >
      <Text style = {topBarStyles.buttonText}>{props.text}</Text>
    </TouchableHighlight>
  );
};
const TopGradient = props =>{
  return(
    <LinearGradient
        style = {projectCreationStyles.topGradient}
        colors = {props.colors}
        start = {props.start}
        end = {props.end}
    >
      <Text
      //FONTSIZE INLINE STYLE IS FOR RESPONSIVE TEXT SIZE
        style = {[projectCreationStyles.topText, {fontSize: 35 * (Dimensions.get("screen").height/780)}]}
      >
        {props.text}
      </Text>
      {props.children}
    </LinearGradient>
  );
}
const TopIcon = props =>{
  return(
    <Icon name = {props.iconName} size={props.iconSize * (Dimensions.get("screen").height/780)} color={props.iconColor}  style={projectCreationStyles.topIcon} />
  );
}
const ContainerGradient = props =>{
  return(
    <LinearGradient
      style = {props.style}
      colors = {props.colors}
      start = {props.start}
      end = {props.end}
    >
      {props.children}
    </LinearGradient>
  );
}
const CreationBox = props => {
  return(
    <View style = {projectCreationStyles.creationBox}>
      <TextInputBox 
        titleStyle = {projectCreationStyles.center}
        titleText = "Project Name"
        inputStyle = {projectCreationStyles.topTextInput}
        placeholder = "Office Function"
        state = {props.projectName}
        changeState = {props.changeProjectName}
      />
      <DatePickerBox
        state = {props.date}
        changeState = {props.setDate}
      />  
      <TextInputBox 
        titleStyle = {projectCreationStyles.center}
        titleText = "Invite Users"
        inputStyle = {projectCreationStyles.bottomTextInput}
        placeholder = "Username"
        state = {props.invUsers}
        changeState = {props.changeInvUsers}
      />
      {props.children}
      {props.checkUser == true &&
      <Text style = {projectCreationStyles.center}>User Successfully Added!</Text>
      }
      {props.checkUser == false &&
        <Text style = {projectCreationStyles.center}>User Not Found</Text>
      }  
    </View>
  );
}
const TextInputBox = props => {
  return(
    <View style = {projectCreationStyles.textInputBoxView}>
      <Text style = {props.titleStyle}>{props.titleText}</Text>
      <TextInput
        style = {props.inputStyle}
        placeholder = {props.placeholder}
        onChangeText = {text => props.changeState(text)}
        value = {props.state}
      />
    </View>
  );
}
const DatePickerBox = props => {
  return(
    <View>
      <Text  style = {projectCreationStyles.dateTitle} >Due Date</Text>
      <DatePicker
        date = {props.state}
        mode = "date"
        onDateChange = {props.changeState}
        style = {projectCreationStyles.datePicker}
        customStyles = {{
        dateInput: {
          backgroundColor: "white", 
        }
        }}
      />
    </View>
  );
}
const InviteUsersTH = props =>{
  return(
    <TouchableHighlight 
      onPress = {props.onPress}
      style = {props.style}
      activeOpacity = {props.activeOpacity}
      underlayColor = {props.underlayColor}
    >
      {props.children}  
    </TouchableHighlight>
  );
}
const ButtonIconBox = props =>{
  return(
    <View style = {projectCreationStyles.buttonIconBoxView}>
      <ContainerGradient
        style = {props.style}
        colors = {props.colors}
        start = {props.start}
        end = {props.end}
      >
          <TouchableHighlight 
            onPress = {props.onPress}
            activeOpacity = {props.activeOpacity}
            underlayColor = {props.underlayColor}
            style = {projectCreationStyles.buttonIconBoxTH}
          >
            <Icon
              name = {props.name}
              color = {props.color}
              style ={projectCreationStyles.buttonIconBoxDetails}
            >
              {'  '}Create Project
            </Icon>
          </TouchableHighlight>
      </ContainerGradient>
    </View>
  );
}