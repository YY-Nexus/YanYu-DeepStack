// 解决React Native和Web类型定义冲突的声明文件

// 忽略React Native的全局类型声明
declare module 'react-native' {}
declare module '@types/react-native' {}
declare module '@react-native-async-storage/async-storage' {}
declare module '@react-native-community/netinfo' {}
declare module '@react-navigation/bottom-tabs' {}
declare module '@react-navigation/native' {}
declare module '@react-navigation/native-stack' {}
declare module '@types/react-native-vector-icons' {}
declare module 'react-native-paper' {}
declare module 'react-native-safe-area-context' {}
declare module 'react-native-screens' {}
declare module 'react-native-svg' {}
declare module 'react-native-vector-icons' {}

// 重新声明冲突的全局类型，使用Web版本
interface FormData {}
interface URLSearchParams {}
interface XMLHttpRequest {}
type XMLHttpRequestResponseType = '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';