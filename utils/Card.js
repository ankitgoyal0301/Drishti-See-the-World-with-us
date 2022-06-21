// import React, { useState } from 'react';
// import { View, TouchableOpacity, Text, StyleSheet, Platform, TouchableNativeFeedback, ImageBackground, Dimensions, Image } from 'react-native';
// // import { AntDesign } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';

// const Card = props => {

//     let TouchableCmp = TouchableOpacity

//     if (Platform.OS === 'android' && Platform.Version >= 21) {
//         TouchableCmp = TouchableNativeFeedback
//     }

//     return (
//         <View style={styles.iosShadow}>
//             <View style={styles.gridItem}>
//                 {/* <ImageBackground source={require("../../../assets/images/workoutCard/background.jpg")} resizeMode="cover" style={styles.image}> */}
//                 <TouchableCmp style={{ flex: 1 }} onPress={() => props.navigation.navigate({ name: "Statistics" })} >

//                     <LinearGradient
//                         start={{ x: 1, y: 0 }}
//                         end={{ x: 0, y: 0 }}
//                         colors={['#1DDE7D', '#72DFC5']}
//                         style={styles.button}>

//                         <Text style={styles.text}>{props.text} </Text>

//                     </LinearGradient>
//                     {/* <View style={styles.container} >
//                             <View style={styles.textContainer}>
//                                 <View style={{ alignItems: 'flex-start' }}>
//                                     <Text style={styles.textStyle}>2045 Steps</Text>
//                                     <Text style={{ ...styles.textStyle, fontFamily: 'open-sans', fontSize: 14 }}>Target: 8000</Text>
//                                 </View>
//                                 <View>
//                                     <Text style={styles.textStyle}>Distance: 1.23 km</Text>
//                                 </View>
//                             </View>
//                             <View style={styles.imageStyle}>
//                                 <Image source={require("../../../assets/images/workoutCard/running.png")} resizeMode="contain" />
//                             </View>
//                     </View> */}
//                 </TouchableCmp>
//                 {/* </ImageBackground> */}
//             </View>
//         </View >
//     )
// }

// const styles = StyleSheet.create({
//     iosShadow: {
//         shadowColor: 'black',
//         shadowOpacity: 0.26,
//         shadowOffset: { width: 0, height: 2 },
//         shadowRadius: 10,
//     },
//     image: {
//         flex: 1,
//         justifyContent: "center",
//         height: "100%",
//         width: "100%",
//     },
//     gridItem: {
//         // margin: 15,
//         height: Dimensions.get('window').height * 0.19,
//         width: Dimensions.get('window').width * 0.90,
//         borderRadius: 10,
//         backgroundColor: '#000000',//'#fafafa',
//         // for andriod
//         overflow: 'hidden',//Platform.OS === 'android' && Platform.Version >= 21 ? 'hidden' : 'visible', //child items can't be render outside the paent view
//         elevation: 10,

//     },
//     container: {
//         flex: 1,
//         flexDirection: 'row',
//         justifyContent: 'space-around'
//     },
//     textContainer: {
//         flexDirection: 'column',
//         justifyContent: 'space-around',
//         alignItems: 'flex-start'
//     },
//     imageStyle: {
//         justifyContent: 'center'
//     },
//     textStyle: {
//         fontFamily: 'open-sans-bold',
//         fontSize: 22,
//         textAlign: 'center',
//         marginTop: 5,
//         color: 'white'
//     }
// });

// export default Card;

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { Fontisto } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

const Card = props => {

    function symbol(text) {
        if (text === 'Currency Recognition') {
            return <FontAwesome name="money" size={25} color="white" />
        }
        else if (text === 'Text Detection - Document') {
            return <Entypo name="text-document" size={25} color="white" />
        }
        else if (text === "Live Location Sharing") {
            return <Entypo name="location" size={25} color="white" />
        }
        else {
            return <Fontisto name="fontisto" size={25} color="white" />
        }
    }

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onLongPress={() => Speech.speak(props.text)}
            onPress={props.onPress}
            style={props.style}
        >
            <LinearGradient
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 0 }}
                colors={['#1DDE7D', '#72DFC5']}
                style={styles.button}>

                <Text style={styles.text}>{props.text} </Text>
                {symbol(props.text)}
            </LinearGradient>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        height: Dimensions.get('window').height * 0.25,
        width: Dimensions.get('window').width * 0.9,
        borderRadius: 15,
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 15
    },
    text: {
        color: 'white',
        fontSize: 19,
    }
})

export default Card;