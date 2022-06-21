import React from "react";
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

const CustomButton = props => {

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={props.onPress}
            style={props.style}
        >
            <LinearGradient
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 0 }}
                colors={['#1DDE7D', '#72DFC5']}
                style={styles.button}>

                <Text style={styles.text}>{props.text} </Text>
                <MaterialIcons name="audiotrack" size={24} color="white" />

            </LinearGradient>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        height: 60,
        width: 150,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 15
    },
    text: {
        color: 'white',
        fontSize: 18,
    }
})

export default CustomButton;