import React from 'react';
import { Dimensions, View } from 'react-native';

const HorizontalLine = props => {
    return <View
        style={{
            borderBottomColor: '#E5E5E5',
            borderBottomWidth: 0.5,
            width: Dimensions.get('window').width
        }}
    />
}

export default HorizontalLine