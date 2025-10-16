"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEditorContext = exports.EditorProvider = void 0;
var react_1 = require("react");
var EditorContext = (0, react_1.createContext)(null);
var EditorProvider = function (_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)("light"), theme = _b[0], setTheme = _b[1];
    var _c = (0, react_1.useState)({ name: "默认团队", members: ["你"] }), team = _c[0], setTeam = _c[1];
    return (<EditorContext.Provider value={{ theme: theme, setTheme: setTheme, team: team, setTeam: setTeam }}>
      {children}
    </EditorContext.Provider>);
};
exports.EditorProvider = EditorProvider;
var useEditorContext = function () {
    var ctx = (0, react_1.useContext)(EditorContext);
    if (!ctx)
        throw new Error("useEditorContext must be used within EditorProvider");
    return ctx;
};
exports.useEditorContext = useEditorContext;
