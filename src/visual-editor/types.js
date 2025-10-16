"use strict";
// 可视化编辑器的类型定义
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCardComponent = exports.isNavComponent = exports.isChartComponent = exports.isTableComponent = exports.isDividerComponent = exports.isRadioComponent = exports.isCheckboxComponent = exports.isInputComponent = exports.isContainerComponent = exports.isImageComponent = exports.isButtonComponent = exports.isTextComponent = void 0;
// 导出类型工具函数
var isTextComponent = function (component) {
    return component.type === 'text' || component.type === 'heading';
};
exports.isTextComponent = isTextComponent;
var isButtonComponent = function (component) {
    return component.type === 'button';
};
exports.isButtonComponent = isButtonComponent;
var isImageComponent = function (component) {
    return component.type === 'image';
};
exports.isImageComponent = isImageComponent;
var isContainerComponent = function (component) {
    return component.type === 'container';
};
exports.isContainerComponent = isContainerComponent;
var isInputComponent = function (component) {
    return component.type === 'input' || component.type === 'password';
};
exports.isInputComponent = isInputComponent;
var isCheckboxComponent = function (component) {
    return component.type === 'checkbox';
};
exports.isCheckboxComponent = isCheckboxComponent;
var isRadioComponent = function (component) {
    return component.type === 'radio';
};
exports.isRadioComponent = isRadioComponent;
var isDividerComponent = function (component) {
    return component.type === 'divider';
};
exports.isDividerComponent = isDividerComponent;
var isTableComponent = function (component) {
    return component.type === 'table';
};
exports.isTableComponent = isTableComponent;
var isChartComponent = function (component) {
    return component.type === 'chart';
};
exports.isChartComponent = isChartComponent;
var isNavComponent = function (component) {
    return component.type === 'nav' || component.type === 'header';
};
exports.isNavComponent = isNavComponent;
var isCardComponent = function (component) {
    return component.type === 'card';
};
exports.isCardComponent = isCardComponent;
