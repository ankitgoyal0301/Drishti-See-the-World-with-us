import React, { useState } from "react";
import { Text, View, Modal, StyleSheet, TouchableOpacity, Dimensions, TextInput, Alert } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import AddButton from "../utils/AddButton";
import * as Speech from 'expo-speech';

const ModalPopUp = props => {

    // const exercises = exerciseHelper(Object.keys(props.exercisesList))
    const [addExercise, setAddExercise] = useState(null);
    const [isFocus, setIsFocus] = useState(false);
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const phonenoregex = /^[1-9]{1}[0-9]{9}$/
    const emailRegex = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const addGaurdianHandler = () => {
        const trimmedPhoneno = phone.trim()
        const trimmedemail = email.trim()
        // console.log(trimmedemail)
        if (name.length === 0) {
            Alert.alert('Invalid Name', 'Name field cannot be empty...', [{ text: 'Okay!', style: 'default' }])
        }
        else if (trimmedemail === '' || !emailRegex.test(trimmedemail)) {
            Alert.alert('Invalid Email', 'Enter valid email address...', [{ text: 'Okay!', style: 'default' }])
        }
        else if (trimmedPhoneno === '' || !phonenoregex.test(trimmedPhoneno)) {
            Alert.alert('Invalid Phone Number', 'Enter 10 digit mobile number...', [{ text: 'Okay!', style: 'default' }])
        }
        else {
            props.emailList.push({ key: email, name: name, email: email, phone: phone })
            Speech.speak("Gaurdian details added.")
            props.modalHandler()
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={props.isVisible}
                onRequestClose={() => {
                    props.modalHandler(false)
                }}>
                <View style={styles.container}>
                    <View style={{ height: '25%' }}></View>
                    <View style={styles.modalView}>
                        <View style={styles.modal}>
                            <Text style={styles.headingStyle}>Add Gaurdian</Text>
                            <View style={{ width: Dimensions.get('window').width * 0.65, flexDirection: "row", alignItems: 'center', paddingVertical: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder="Name"
                                        value={name}
                                        onChangeText={name => {
                                            setName(name)
                                        }}
                                    />
                                </View>
                            </View>
                            <View style={{ width: Dimensions.get('window').width * 0.65, flexDirection: "row", alignItems: 'center', paddingVertical: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <TextInput
                                        style={styles.inputStyle}
                                        keyboardType={"email-address"}
                                        placeholder="Email ID"
                                        value={email}
                                        onChangeText={email => {
                                            setEmail(email)
                                        }}
                                    />
                                </View>
                            </View>
                            <View style={{ width: Dimensions.get('window').width * 0.65, flexDirection: "row", alignItems: 'center', paddingVertical: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <TextInput
                                        style={styles.inputStyle}
                                        keyboardType={"numeric"}
                                        placeholder="Phone No."
                                        value={phone}
                                        onChangeText={phone => {
                                            setPhone(phone)
                                        }}
                                    />
                                </View>
                            </View>
                            <View style={{ paddingVertical: 15, paddingTop: 20, left: '22%' }}>
                                <AddButton onPress={() => addGaurdianHandler()} />
                            </View>
                        </View>
                    </View>
                    <View style={{ height: '25%' }}></View>
                </View>
            </Modal>
        </View>
    )
}

export default ModalPopUp

const styles = StyleSheet.create({
    modalView: {
        height: "50%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'white',
        marginHorizontal: '6%',
        elevation: 10,
        borderRadius: 10,
        shadowColor: 'black',
        shadowOpacity: 0.26,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 10,
    },
    container: {
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    modal: {
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    headingStyle: {
        fontSize: 20,
        paddingBottom: '4%'
    },
    containerStyle: {
        width: "100%",
        marginTop: -20,
        marginBottom: -5,
        fontSize: 20,
        color: 'black'
    },
    inputStyle: {
        borderColor: '#828282',
        borderWidth: 0.7,
        borderRadius: 6,
        padding: 5,
        paddingHorizontal: 10,
        fontSize: 15,
        height: 45,
    }
})

const DropDownStyles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 16,
    },
    dropdown: {
        height: 45,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        width: Dimensions.get('window').width * 0.65
    },
    icon: {
        marginRight: 5,
    },
    label: {
        position: 'absolute',
        backgroundColor: 'white',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
});