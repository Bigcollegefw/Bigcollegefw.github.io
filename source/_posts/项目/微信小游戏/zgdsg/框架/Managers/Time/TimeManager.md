```c#

using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TimeManager : ManagerBase, IDisposable
{
    private LinkedList<TimeAction> m_TimeActionList;
    public TimeManager()
    {
        m_TimeActionList = new LinkedList<TimeAction>();
    }
    public void Dispose()
    {
        m_TimeActionList.Clear();
    }
    internal void OnUpdate()
    {
        for (LinkedListNode<TimeAction> curr = m_TimeActionList.First; curr != null; curr = curr.Next)
        {
            curr.Value.OnUpdate();
        }
    }
    internal void RegisterTimeAction(TimeAction action)
    {
        m_TimeActionList.AddLast(action);
    }
    internal void RemoveTimeAction(TimeAction action)
    {
        m_TimeActionList.Remove(action);
    }
}

```