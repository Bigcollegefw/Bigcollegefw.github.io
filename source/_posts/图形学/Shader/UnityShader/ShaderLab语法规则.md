---
title: ShaderLab语法规则
date:
  "{ date }": 
categories:
  - 图形学
  - Shader
  - Unity Shader
tags:
  - 图形学
---
### Shader名字
直接修改Shader文件中Shader后的名字即可
Shader名字决定了在材质面板的选择路径

注意不要使用中文。Shader文件名和在文件中的命名最好保持一致。

### Shader属性
在Shader编写会使用到不同类型变量或贴图资源
为了增加Shader可调节性，将变量作为开放属性来在材质面板上定义
特点：可以在材质面板编辑，可以在后续当作输入变量提供给所有子着色器使用

### Shader属性的基本语法
分成三大类：数值，颜色和向量，纹理贴图

基本语法：
```
_Name("Display Name",type) = defaultValue[{options}]
```

_\_Name:属性名字，规则是需要在前面加一个下划线，方便在之后获取
Display Name:材质面板上显示的名字
type:属性的类型
defaultValue:将Shader指定给材质的时候初始化的默认值

### 数值类型属性
```C#
// 整形
_Name("MyInt",Int) = number
// 浮点型
_Name("MyFloat",Float) = number
// 范围浮点型
_Name("MyRange",Range(min,max)) = number
```
Unity Shader中数值类型属性基本都是浮点型（Float）数据

### 颜色和向量类型属性
 
```
    Properties
    {
        _MainTex ("Texture", 2D) = "white" {}
        // 向量和颜色类型
        _MyColor ("MyColor",Color) = (0.5,0.5,0.5,1)
        _MyVector("MyVector",Vector) = (99,95,93,123)
    }
```

### 贴图纹理类型
