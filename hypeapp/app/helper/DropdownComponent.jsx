import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Colors } from '@/constants/Colors';
import categories from "./categories"


const data = categories;
const DropdownComponent = ({value, onChange}) => {
  const renderItem = item => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.label}</Text>
      </View>
    );
  };
  return (
    <Dropdown
      style={styles.dropdown}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      iconStyle={styles.iconStyle}
      data={data}
      search
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder="Select item"
      searchPlaceholder="Search..."
      value={value}
      onChange={item=>onChange(item.value)}
      renderItem={renderItem}
    />
  );
};
export default DropdownComponent;
const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    width: 300,
    borderRadius: 10,
    borderColor: 'gray',
    borderWidth: 2,
    marginVertical: 10,
    paddingLeft: 10
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textItem: {
    fontSize: 14,
    color: 'gray',
  },
  placeholderStyle: {
    fontSize: 20,
    color: 'gray',
  },
  selectedTextStyle: {
    fontSize: 20,
    color: 'gray',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});