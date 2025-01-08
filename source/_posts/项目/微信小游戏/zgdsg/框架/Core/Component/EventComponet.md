```c#
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
/// <summary>
/// 事件组件
/// </summary>
public class EventComponet : MyBaseComponent
{
    private EventManager m_EventManager;


    protected override void OnAwake()
    {
        base.OnAwake();
        m_EventManager = new EventManager();
        SocketEvent = m_EventManager.SocketEvent;
        CommonEvent = m_EventManager.CommonEvent;
    }

    public override void ShutDown()
    {
        m_EventManager.Dispose();
    }

 

    /// <summary>
    /// socket事件
    /// </summary>
    public SocketEvent SocketEvent;
    public CommonEvent CommonEvent;
}

```