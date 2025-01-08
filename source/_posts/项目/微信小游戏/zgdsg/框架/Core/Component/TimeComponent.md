```C#
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TimeComponent : MyBaseComponent,IUpdateComponent
{
    protected override void OnAwake()
    {
        base.OnAwake();
        GameEntry.RegisterUpdateComponent(this);
        m_TimeManger = new TimeManager();
    }
    private TimeManager m_TimeManger;
    public TimeAction CreateTimeAction()
    {

        return GameEntry.Pool.DequeueClassObject<TimeAction>();
    }
    internal void RegisterTimeAction(TimeAction action)
    {
        m_TimeManger.RegisterTimeAction(action);

    }
    internal void RemoveTimeAction(TimeAction action)
    {
        m_TimeManger.RemoveTimeAction(action);
        GameEntry.Pool.EnqueueClassObject(action);
    }
    public void OnUpdate()
    {
        m_TimeManger.OnUpdate();
    }
    public override void ShutDown()
    {
        m_TimeManger.Dispose();
    }
}

```