## 响应式
### 0.0.1
### 0.0.2 
问题：无关参数也会触发更新
### 0.0.3
解决：无关参数也会触发更新
### 0.0.4
提取 track 和 trigger 函数
### 0.0.5
分支切换 和 cleanup  
```
obj.ok ? obj.text : 'not'
```
### 0.0.6
解决： effect 嵌套
问题1：deps 重复添加 activeEffect
问题2：obj 属性读取报错
