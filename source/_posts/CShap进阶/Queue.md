---
title: Queue
date:
  "{ date }": 
categories:
  - C#
  - C#进阶
tags:
---

## 1.Queue本质
栈是C#为我们封装好的类，本质也是object类型数组，封装了特殊的存储规则。

Queue是队列存储容器，一种先进先出的数据结构
## 2.申明
在using System.Collections命名空间中。
```C#
ArrayList queue = new Queue();
```
## 3.增取查改
- [ ] 增
只有一个一个的增。
```C#
queue.Enqueue(1);
queue.Enqueue("123");
queue.Enqueue(1.4f);
queue.Enqueue(new Test());
```
- [ ] 取
和栈一样不存在删除的概念，只有取，优先取出先加入的对象
```c#
object v = queue.Dequeue();
Console.WriteLine(v);
```
- [ ] 查
```C#
1.查看头部元素但不会移除
v = queue.Peek();
Console.WriteLine(v);
2.查看元素是否存在于队列中
if(queue.Contains(true)){ 
	console.WriteLine("队列中存在true");
}
```
- [ ] 改
```C#
没有索引器的概念，只能清空
queue.Clear();
```
## 4.遍历
1.长度
```C#
Console.WriteLine(queue.Count);
```

2.foreach遍历
不能用for来遍历，栈里面没有索引器。
```C#
遍历出来的顺序是先进到先出
foreach(object item in stack){ 
	Console.WriteLine(item);
}
```

3.将队列转换成object数组，再for遍历出来。遍历出来的顺序是从先进到先出。
```C#
object[] array = stack.ToArray();
for(int i = 0; i < array.Length; i++)
{
	Console.WriteLine(array[i]);
}
```

4.循环出列
出列完后什么都灭有了，相当隧道里的车全走了。
```C#
while( queue.Count > 0)
{ 
	object o = queue.Dequeue();
	Console.WriteLine(o);
}
```

## 5.拆箱装箱
 与栈几乎一致。

## 6.练习
使用队列存储消息，一次性存 10 条消息，每隔一段时间打印一条消息，并且控制台打印消息时有明显停顿感

```C#
using System;
using System.Collections.Generic;
using System.Threading;

class Program
{
    static Queue<string> messageQueue = new Queue<string>();

    static void Main()
    {
        // 一次性存入10条消息
        for (int i = 0; i < 10; i++)
        {
            messageQueue.Enqueue($"Message {i + 1}");
        }

        // 每隔一段时间打印一条消息
        while (messageQueue.Count > 0)
        {
            string message = messageQueue.Dequeue();
            Console.WriteLine(message);
            // 添加停顿感，这里停顿2秒
            Thread.Sleep(2000);
        }
    }
}
```