import React, { Component } from "react";
import { Button, Dimensions, StyleSheet, View, Text, BackHandler, ScrollView } from "react-native";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import * as TaskManager from "expo-task-manager";
import ModalPopUp from "../utils/ModalPopUp";
import AddGaurdianButton from "../utils/AddGaurdianButton";
import HorizontalLine from "../utils/HorizontalLine";
import ToggleSwitch from 'toggle-switch-react-native';
import { backend_ip } from "../constants/constants";
import * as Speech from 'expo-speech';

const LOCATION_TASK_NAME = "background-location-task";

let emailList = []

export default class LocationSharing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            region: null,
            error: '',
            modalOn: false,
            locationShare: false
        };
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.toggleHandler = this.toggleHandler.bind(this);
    }

    _getLocationAsync = async () => {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            enableHighAccuracy: true,
            distanceInterval: 1,
            timeInterval: 20000 // time set to update after 10 seconds
        });
        // watchPositionAsync Return Lat & Long on Position Change
        this.location = await Location.watchPositionAsync(
            {
                enableHighAccuracy: true,
                distanceInterval: 1,
                timeInterval: 20000
            },
            newLocation => {
                let { coords } = newLocation;
                let region = {
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    latitudeDelta: 0.045,
                    longitudeDelta: 0.045
                };
                this.setState({ region: region });
            },
            error => console.log(error)
        );
        return this.location;
    };

    async UNSAFE_componentWillMount() {
        // Asking for device location permission
        const { status } = await Permissions.askAsync(Permissions.LOCATION);

        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

        if (status === "granted") {
            this._getLocationAsync();
        } else {
            this.setState({ error: "Locations services needed" });
        }
        // userId = (await AsyncStorage.getItem("userId")) || "none";
        // userName = (await AsyncStorage.getItem("userName")) || "none";
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick = () => {
        if (this.state.modalOn === true) {
            this.setState({ modalOn: !this.state.modalOn })
        }
    }

    modalHandler = () => {
        this.setState({ modalOn: !this.state.modalOn })
    }

    toggleHandler = async (isOn) => {
        if (this.state.locationShare === true) {
            this.setState({ locationShare: !this.state.locationShare })
            Speech.speak("Live location sharing stopped.")
        }
        else {


            if (emailList.length === 0) {
                Speech.speak("No gaurdians added. Kindly add atleast one gaurdian to the list and enable the toggle to start live location sharing!")
            }
            else {
                this.setState({ locationShare: !this.state.locationShare })
                Speech.speak("Live location sharing started.")
                let response = await fetch(backend_ip + "/send-location", {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 'emailList': emailList }),
                });
                const prediction = await response.json();
                console.log(prediction)
            }
        }

    }

    render() {
        return (
            <View style={styles.container}>
                <MapView
                    initialRegion={this.state.region}
                    showsCompass={true}
                    showsUserLocation={true}
                    rotateEnabled={true}
                    ref={map => {
                        this.map = map;
                    }}
                    style={{ height: Dimensions.get('window').height * 0.5 }}
                />
                <ScrollView >
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ paddingLeft: 30, paddingVertical: 14, fontSize: 20, fontWeight: 'bold' }}>
                                Gaurdian List
                            </Text>
                            <View style={{ justifyContent: 'center', left: Dimensions.get('window').width * 0.20 }}>
                                <ToggleSwitch
                                    isOn={this.state.locationShare}
                                    onColor="#1DDE7D"
                                    offColor="grey"
                                    label=""
                                    labelStyle={{ color: "black", fontWeight: "90" }}
                                    size="small"
                                    onToggle={isOn => this.toggleHandler(isOn)}
                                />
                            </View>
                        </View>

                        <HorizontalLine />
                        {emailList.length === 0 ?
                            <Text style={{ marginTop: '3%', paddingBottom: 10, fontSize: 15 }}>No Gaurdian added</Text> :
                            emailList.map(function (item, i) {
                                return (
                                    <View style={{ marginTop: '3%' }}>
                                        <Text style={{ fontSize: 15.5, marginHorizontal: '5%' }}>{item['name']}</Text>
                                        <View style={{ paddingTop: 2, paddingBottom: 5, marginBottom: '3%', marginHorizontal: '5%', flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ fontSize: 13.3 }}>{item['email']}</Text>
                                            <Text style={{ fontSize: 13.3 }}>{item['phone']}</Text>
                                        </View>
                                        <HorizontalLine />
                                    </View>
                                )
                            })
                            //     Object.keys(emailList).map((index, key) => (
                            // <View>
                            //     {console.log(index, key)}
                            //     <Text>{key['name']}</Text>
                            //     <Text>{key['email']}</Text>
                            //     <Text>{key['phone']}</Text>
                            // </View>
                            // ))
                        }
                        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: '5%' }}>
                            <AddGaurdianButton onPress={this.modalHandler} />
                        </View>
                    </View>
                </ScrollView>
                {this.state.modalOn ? <ModalPopUp modalHandler={this.modalHandler} isVisible={this.state.modalOn} emailList={emailList} /> : null}
            </View>
        );
    }
}

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
        console.log(error);
        return;
    }
    if (data) {
        const { locations } = data;
        let lat = locations[0].coords.latitude;
        let long = locations[0].coords.longitude;

        try {
            let response = await fetch(backend_ip + "/update-location", {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "lat": lat, 'long': long }),
            });
            const prediction = await response.json();
            console.log(prediction)
        }
        catch (error) {
            console.log('error : ' + error);
            return error;
        }
        // userId = (await AsyncStorage.getItem("userId")) || "none";

        // Storing Received Lat & Long to DB by logged In User Id
        // axios({
        //     method: "POST",
        //     url: "http://000.000.0.000/phpServer/ajax.php",
        //     data: {
        //         action: "saveLocation",
        //         userId: userId,
        //         lat,
        //         long
        //     }
        // });
        // console.log("Received new locations for user = ", userId, locations);
    }
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        height: Dimensions.get('window').height * 0.5,
    }
});

/*
import React, { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch"
import * as Location from 'expo-location';
import { sendEmail } from '../utils/email/send-email';

let lastTimeUpdate = null
let mapLink = null

const LOCATION_TASK_NAME = "background-location-task";

export default function LocationSharing() {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [mounted, setMounted] = useState(null);
    // const [lastTimeUpdate, setLastTimeUpdate] = useState(null);
    // const [mapLink, setMapLink] = useState(null)

    async function getLocation() {
        if (Platform.OS === 'android' && !Constants.isDevice) {
            setErrorMsg(
                'Oops, this will not work on Snack in an Android Emulator. Try it on your device!'
            );
            return;
        }
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
        }

        const { status2 } = await Permissions.askAsync(Permissions.LOCATION);

        // const { status2 } = await Location.requestBackgroundPermissionsAsync();
        // if (status2 !== 'granted') {
        //     setErrorMsg('Permission to access location was denied2');
        //     return;
        // }

        let location = await Location.getCurrentPositionAsync({});
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.Balanced,
        });
        setLocation(location);
    }

    useEffect(() => {
        getLocation()
    }, []);

    let text = 'Waiting..';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = JSON.stringify(location);
        var time = new Date(location['timestamp']).toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
        var mapUrl = 'https://maps.google.com/?ll=' + location['coords']['latitude'] + ',' + location['coords']['longitude']
        // setLastTimeUpdate(time)
        // setMapLink(mapUrl)
        if (lastTimeUpdate === null) {
            lastTimeUpdate = time
        }
        if (mapLink === null) {
            mapLink = mapUrl
        }
    }

    if (mounted === null) {
        setMounted(true)
        // zaroori()
    }

    const [mapRegion, setmapRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    return (
        <View style={styles.container}>
            <MapView
                initialRegion={mapRegion}
                showsCompass={true}
                showsUserLocation={true}
                rotateEnabled={true}
                ref={map => {
                    this.map = map;
                }}
                style={{ flex: 1 }}
            />
            <Text style={styles.paragraph}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    paragraph: {
        fontSize: 18,
        textAlign: 'center',
    },
});

// TaskManager.defineTask(LOCATION_TASK_NAME, () => {
//     const receivedNewData = "Simulated fetch " + Math.random()
//     console.log("My task ", receivedNewData)

// })
// async function zaroori() {


//     try {
//         await BackgroundFetch.registerTaskAsync(LOCATION_TASK_NAME, {
//             minimumInterval: 5, // seconds,
//         })
//         console.log("Task registered")
//     } catch (err) {
//         console.log("Task Register failed:", err)
//     }
// }


// TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
//     if (error) {
//         console.log(error);
//         return;
//     }
//     if (data) {
//         const { locations } = data;
//         let lat = locations[0].coords.latitude;
//         let long = locations[0].coords.longitude;
//         // userId = (await AsyncStorage.getItem("userId")) || "none";

//         // Storing Received Lat & Long to DB by logged In User Id
//         // axios({
//         //     method: "POST",
//         //     url: "http://000.000.0.000/phpServer/ajax.php",
//         //     data: {
//         //         action: "saveLocation",
//         //         userId: userId,
//         //         lat,
//         //         long
//         //     }
//         // });
//         // console.log("Received new locations for user = ", userId, locations);
//     }
// });

*/