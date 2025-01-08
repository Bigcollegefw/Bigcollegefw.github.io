```C#
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class MyComponent : MonoBehaviour
{
    /// <summary>
    /// 组件实例编号
    /// </summary>
    private int m_InstanceId;

    /// <summary>
    /// 实例编号
    /// </summary>
    public int InstanceID
    {
        get
        {
            return m_InstanceId;
        }
    }

    void Awake()
    {
        m_InstanceId = GetInstanceID();
        OnAwake();
    }
    private void Start()
    {
        OnStart();
    }
    private void OnDestroy()
    {
        BeforOnDestroy();
    }

    protected virtual void OnAwake() { }

    protected virtual void OnStart() { }

    protected virtual void BeforOnDestroy() { }

}

```