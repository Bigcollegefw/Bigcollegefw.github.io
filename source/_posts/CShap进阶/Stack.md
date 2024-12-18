## 1.Stack的本质
栈是C#为我们封装好的类，本质也是object类型数组，封装了特殊的存储规则。
栈是一种先进后出的数据结构Stack是栈存储容器，类比为一个装羽毛球的那个容器。
## 2.申明
在using System.Collections命名空间中。
```C#
Stack stack = new Stack();
```
## 3.增取查改
- [ ] 增
```C#
// 压栈
stack.Push(1);
stack.Push("123");
stack.Push(true);
stack.Push(1.2f);
stack.Push(new Test());
```
- [ ] 取
```C#
// 栈中不存在删除的概念
// 取 ：称为弹栈
object v = stack.Pop();
Console.WriteLine(v);
// 取出来的是栈最后进入的元素，就是栈顶的元素
v = stack.Pop();
Console.WriteLine(v);
```
- [ ] 查
```C#
1.栈无法查看指定位置的元素，只能查看栈顶的内容，类似诸葛亮的观星
v = stack.Peek();
Console.WriteLine(v);
2.查看元素是否存于栈中
if( stack.Contains(1.2f))
{
	Console.WriteLine("存在");
}
```
- [ ] 改
```C#
栈无法改变元素，只能压和弹
stack.Clear();
```
## 4. 遍历
1.长度
```C#
Console.WriteLine(stack.Count);
```

2.foreach遍历
不能用for来遍历，栈里面没有索引器。
```C#
遍历出来的顺序是从栈顶到栈底
foreach(object item in stack){ 
	Console.WriteLine(item);
}
```

## 5.装箱拆箱


