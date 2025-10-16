// React Native and Web Type Conflict Fix
// 声明React Native相关模块为空模块，阻止其类型定义加载
declare module 'react-native';
declare module '@types/react-native';
declare module '@types/react-native-vector-icons';
declare module 'react-native-vector-icons';
declare module '@react-native-async-storage/async-storage';
declare module '@react-native-community/netinfo';
declare module '@react-navigation/bottom-tabs';
declare module '@react-navigation/native';
declare module '@react-navigation/native-stack';
declare module 'react-native-paper';
declare module 'react-native-safe-area-context';
declare module 'react-native-screens';
declare module 'react-native-svg';

// 环境模块声明，避免全局范围扩大问题
declare module 'react-native-fix' {
  export interface FormData {}
  export interface URLSearchParams {}
  export interface XMLHttpRequest {}
  export type XMLHttpRequestResponseType = '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';
}