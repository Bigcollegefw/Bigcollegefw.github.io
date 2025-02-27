### UnityShader
shader是一个通用的概念，用于描述图形渲染程序的着色器程序
UnityShader是特指在Unity中使用的着色器

Unity Shader是对Shader的一种封装

是对底层图形渲染技术的封装，提供了一种ShaderLab的语言

### Unity中材质和Shader
材质 Material 先创建
选中后在Inspector中Shader选项中选择对自对应的着色器进行关联

### 创建Shader
在Project窗口中右键创建Shader
Create ——> Shader
1.Standard Surface Shader(标准曲面着色器)
包含标准光照模型的表面着色器模板
2.Unlit Shader
不包含光照的基本顶点/片元着色器
3.Image Effect Shader
用于实现屏幕后梳理效果的基本模板
4.Compute Shader
利用GPU并行计算一些和常规渲染流水线无关的内容
5.Ray Tracing Shader
用于实现光线追踪效果的着色器

我们更多去学习顶点/片元着色器
