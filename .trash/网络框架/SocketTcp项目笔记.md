
Server服务器端脚本思路
在Update里面起一个协程，每隔几秒来轮取一下现在跑的这个流m_NetStream = m_Client.GetStream();然后从流里面去m_NetStream.BeginRead，读取客户端数据，并且通过MessageReceived回调函数处理数据，MessageReceived会传一个异步的IAsyncResult，完成后去EndRead(result)，再去GetString得到真正的Message。 

这里遇到一个多态的思考
- 如果你在`CustomServer`里重写了[ServerLog](vscode-file://vscode-app/d:/DevTool/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)，并且场景中挂载的是`CustomServer`组件，那么即使是在基类[Server](vscode-file://vscode-app/d:/DevTool/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)的方法（如[StartServer](vscode-file://vscode-app/d:/DevTool/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)）里调用[ServerLog(...)](vscode-file://vscode-app/d:/DevTool/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)，也会执行子类重写后的方法（这就是C#的多态特性）。
- 如果是[Server](vscode-file://vscode-app/d:/DevTool/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)实例，调用的是基类方法。
- 如果是`CustomServer`实例，调用的是子类重写的方法。

客户端Client的协程是监听服务端的消息，但是客户端的协程只用在点击启动客户端按钮的时候开启？而Server的协程也只是在m_ListenClientMsgsCoroutine不为空的时候进去一次。

一般Unity或C#服务器开发，推荐用TcpListener+SetSocketOption，除非你有特殊需求才用Socket全自定义。
```C#
m_Server.Server.SetSocketOption(SocketOptionLevel.Socket, SocketOptionName.ReuseAddress, 1);
```
这是**直接创建一个Socket对象**，你需要自己管理Socket的绑定、监听、接收、发送等所有细节。
```C#
Socket socketTcp = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
```