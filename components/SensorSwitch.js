import React from 'react';
import { View, Text, Switch } from 'react-native';
import sensorStyles from '../constants/sensorStyles';
import theme from '../constants/theme';

const SensorSwitch = ({
  sensorName,
  sensorSubcription,
  switchOn,
  switchOff,
  labelColor,
  bgColor,
  sizeScale,
}) => {
  return (
    <View style={[sensorStyles.sensorToggle]}>
      <Switch
        trackColor={{
          false: theme.trackFalseColor,
          true: theme.trackTrueColor,
        }}
        thumbColor={sensorSubcription ? theme.thumbColor : theme.thumbColor}
        onValueChange={() =>
          sensorSubcription ? switchOff(sensorName) : switchOn(sensorName)
        }
        value={sensorSubcription !== null}
        style={{
          transform: [{ scaleX: sizeScale || 1 }, { scaleY: sizeScale || 1 }],
        }}
      />
      <Text
        style={[
          sensorStyles.text,
          sensorStyles.sensorName,
          { color: labelColor },
        ]}
      >
        {sensorName || 'switch sensorName'}
      </Text>
    </View>
  );
};

export default SensorSwitch;
