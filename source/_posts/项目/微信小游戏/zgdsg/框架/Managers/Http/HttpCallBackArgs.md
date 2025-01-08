```C#

using System;


/// <summary>
/// Http请求的回调数据
/// </summary>
public class HttpCallBackArgs : EventArgs
{
    public bool HasError;
    public object Value;
}
```