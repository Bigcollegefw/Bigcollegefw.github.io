```C#
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public abstract class MyBaseComponent : MyComponent
{
    protected override void OnAwake()
    {
        GameEntry.RegisterBaseComponent(this);
        base.OnAwake();
    }

    protected override void OnStart()
    {
        base.OnStart();
    }
    public abstract void ShutDown();
}
```