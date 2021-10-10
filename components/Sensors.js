import { View, Text, Switch } from 'react-native';
import React from 'react';
import theme from '../constants/theme';
import sensorStyles from '../constants/sensorStyles';

export default function Sensor({
  subscription,
  subscribe,
  unsubscribe,
  sensorName,
}) {
  return (
    <View style={[sensorStyles.sensorToggle]}>
      <Switch
        trackColor={{
          false: theme.trackFalseColor,
          true: theme.trackTrueColor,
        }}
        thumbColor={subscription ? theme.thumbColor : theme.thumbColor}
        onValueChange={() =>
          subscription ? unsubscribe(sensorName) : subscribe(sensorName)
        }
        value={subscription !== null}
      />
      <Text style={[sensorStyles.text, sensorStyles.sensorName]}>
        {sensorName}
      </Text>
    </View>
  );
}

//                     #######
//                ################
//             #########     #########
//         #########             ##########
//     #########        ######        #########
//    ##########################################
//   #####      #####################       #####
//   #####          ##############          #####
//   #####    ###       ######       ###    #####
//   #####    #######            #######    #####
//   #####    ###########    ###########    #####
//   #####    ##########################    #####
//   #####    ##########################    #####
//   #####      ######################     ######
//    ######        #############        #######
//      #########        ####       #########
//           #########          #########
//               ######### #########
//                    #########
