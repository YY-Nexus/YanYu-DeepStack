// visualEditorSlice Redux状态管理切片
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 组件接口定义
interface Component {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  padding?: number;
  fontSize?: number;
  textColor?: string;
  visible?: boolean;
  locked?: boolean;
  [key: string]: any;
}

// 历史记录项接口
interface HistoryItem {
  action: 'add' | 'update' | 'delete';
  componentId?: string;
  component?: Component;
  previousState?: Component;
}

// 状态接口
interface VisualEditorState {
  components: Record<string, Component>;
  selectedComponentId: string | null;
  history: HistoryItem[];
  historyIndex: number;
}

// 初始状态
const initialState: VisualEditorState = {
  components: {},
  selectedComponentId: null,
  history: [],
  historyIndex: -1
};

// 创建切片
const visualEditorSlice = createSlice({
  name: 'visualEditor',
  initialState,
  reducers: {
    // 添加组件
    addComponent: (state, action: PayloadAction<Omit<Component, 'id'>>) => {
      const id = `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newComponent: Component = {
        id,
        type: 'basic',
        x: 100,
        y: 100,
        width: 120,
        height: 60,
        ...action.payload
      };
      
      state.components[id] = newComponent;
      state.selectedComponentId = id;
      
      // 记录历史
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push({
        action: 'add',
        componentId: id,
        component: newComponent
      });
      state.historyIndex++;
    },
    
    // 更新组件
    updateComponent: (state, action: PayloadAction<{
      componentId: string;
      updates: Partial<Component>;
    }>) => {
      const { componentId, updates } = action.payload;
      const component = state.components[componentId];
      
      if (component) {
        // 记录更新前的状态
        const previousState = { ...component };
        
        // 应用更新
        state.components[componentId] = { ...component, ...updates };
        
        // 记录历史
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push({
          action: 'update',
          componentId,
          previousState,
          component: { ...state.components[componentId] }
        });
        state.historyIndex++;
      }
    },
    
    // 删除组件
    deleteComponent: (state, action: PayloadAction<string>) => {
      const componentId = action.payload;
      const component = state.components[componentId];
      
      if (component) {
        // 记录历史
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push({
          action: 'delete',
          componentId,
          component
        });
        state.historyIndex++;
        
        // 删除组件
        delete state.components[componentId];
        
        // 如果删除的是选中的组件，清除选中状态
        if (state.selectedComponentId === componentId) {
          state.selectedComponentId = null;
        }
      }
    },
    
    // 选择组件
    selectComponent: (state, action: PayloadAction<string | null>) => {
      state.selectedComponentId = action.payload;
    },
    
    // 移动组件
    moveComponent: (state, action: PayloadAction<{
      componentId: string;
      deltaX: number;
      deltaY: number;
    }>) => {
      const { componentId, deltaX, deltaY } = action.payload;
      const component = state.components[componentId];
      
      if (component && !component.locked) {
        state.components[componentId] = {
          ...component,
          x: component.x + deltaX,
          y: component.y + deltaY
        };
      }
    },
    
    // 重置编辑器
    resetEditor: (state) => {
      state.components = {};
      state.selectedComponentId = null;
      state.history = [];
      state.historyIndex = -1;
    },
    
    // 撤销操作
    undo: (state) => {
      if (state.historyIndex >= 0) {
        const historyItem = state.history[state.historyIndex];
        
        switch (historyItem.action) {
          case 'add':
            // 撤销添加操作，删除组件
            if (historyItem.componentId) {
              delete state.components[historyItem.componentId];
              if (state.selectedComponentId === historyItem.componentId) {
                state.selectedComponentId = null;
              }
            }
            break;
            
          case 'update':
            // 撤销更新操作，恢复到之前的状态
            if (historyItem.componentId && historyItem.previousState) {
              state.components[historyItem.componentId] = historyItem.previousState;
            }
            break;
            
          case 'delete':
            // 撤销删除操作，恢复组件
            if (historyItem.componentId && historyItem.component) {
              state.components[historyItem.componentId] = historyItem.component;
            }
            break;
        }
        
        state.historyIndex--;
      }
    },
    
    // 重做操作
    redo: (state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        const historyItem = state.history[state.historyIndex];
        
        switch (historyItem.action) {
          case 'add':
            // 重做添加操作，重新添加组件
            if (historyItem.componentId && historyItem.component) {
              state.components[historyItem.componentId] = historyItem.component;
            }
            break;
            
          case 'update':
            // 重做更新操作，应用更新
            if (historyItem.componentId && historyItem.component) {
              state.components[historyItem.componentId] = historyItem.component;
            }
            break;
            
          case 'delete':
            // 重做删除操作，删除组件
            if (historyItem.componentId) {
              delete state.components[historyItem.componentId];
              if (state.selectedComponentId === historyItem.componentId) {
                state.selectedComponentId = null;
              }
            }
            break;
        }
      }
    },
    
    // 批量添加组件
    addComponents: (state, action: PayloadAction<Array<Omit<Component, 'id'>>>) => {
      const newComponents: Record<string, Component> = {};
      const historyItems: HistoryItem[] = [];
      
      action.payload.forEach((componentData) => {
        const id = `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newComponent: Component = {
          id,
          type: 'basic',
          x: 100,
          y: 100,
          width: 120,
          height: 60,
          ...componentData
        };
        
        newComponents[id] = newComponent;
        historyItems.push({
          action: 'add',
          componentId: id,
          component: newComponent
        });
      });
      
      // 合并新组件
      state.components = { ...state.components, ...newComponents };
      
      // 记录历史
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history = [...state.history, ...historyItems];
      state.historyIndex = state.history.length - 1;
    },
    
    // 加载组件配置
    loadComponents: (state, action: PayloadAction<Record<string, Component>>) => {
      state.components = action.payload;
      state.selectedComponentId = null;
      state.history = [];
      state.historyIndex = -1;
    }
  }
});

// 导出action creators
export const { 
  addComponent, 
  updateComponent, 
  deleteComponent, 
  selectComponent, 
  moveComponent, 
  resetEditor, 
  undo, 
  redo,
  addComponents,
  loadComponents
} = visualEditorSlice.actions;

// 导出reducer
export default visualEditorSlice.reducer;