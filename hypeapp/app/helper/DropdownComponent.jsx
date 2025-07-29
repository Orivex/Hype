//import React, { useState } from 'react';
//import { StyleSheet, View, Text } from 'react-native';
//import { Dropdown } from 'react-native-element-dropdown';
//import categories from "./categories"
//import colors from './colors';
//
//
//const data = categories;
//const DropdownComponent = ({value, onChange, style}) => {
//  const renderItem = (item) => {
//    return (
//      <View style={style.item}>
//        <Text style={style.textItem}>{item.label}</Text>
//      </View>
//    );
//  };
//  return (
//    <Dropdown
//      style={style}
//      placeholderStyle={style.placeholderStyle}
//      selectedTextStyle={style.selectedTextStyle}
//      inputSearchStyle={style.inputSearchStyle}
//      iconStyle={style.iconStyle}
//      data={data}
//      search
//      activeColor={colors.yellow}
//      maxHeight={300}
//      labelField="label"
//      valueField="value"
//      placeholder="Select item"
//      searchPlaceholder="Search..."
//      value={value}
//      onChange={item=>onChange(item.value)}
//      renderItem={renderItem}
//    />
//  );
//};
//export default DropdownComponent;
//