---
title: URP Camera使用及动态设置
date:
  "{ date }": 
categories:
  - Unity
  - Unity入门到精通
tags:
  - Unity
---
在3D项目中创建出URP项目后摄像机会发生变化。
![](../../../../img/beishang20250105200009637.png)
相机类型
![](../../../../img/beishang20250105211111051.png)
- Render Type（渲染类型）
    - Base（基础相机）：渲染到特定渲染目标的通用相机，场景中必须至少有一个。
    - Overlay（叠加相机）：将其视图渲染在另一个摄像机的输出之上，必须与基础相机配合使用。
	如果上面没有Base的话,会出现一篇黑屏。