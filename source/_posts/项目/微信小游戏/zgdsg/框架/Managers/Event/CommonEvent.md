```C#
using System;
using System.Collections;
using System.Collections.Generic;

using UnityEngine;

public class CommonEvent : IDisposable
{
    public delegate void OnActionHandler(object userData);
    public Dictionary<ushort, List<OnActionHandler>> dic = new Dictionary<ushort, List<OnActionHandler>>();

    #region AddEventListener 添加监听
    /// <summary>
    /// 添加监听
    /// </summary>
    /// <param name="key"></param>
    /// <param name="handler"></param>
    public void AddEventListener(ushort key, OnActionHandler handler)
    {
        List<OnActionHandler> lstHandler = null;
        dic.TryGetValue(key, out lstHandler);
        if (lstHandler == null)
        {
            lstHandler = new List<OnActionHandler>();
            dic[key] = lstHandler;
        }

        lstHandler.Add(handler);
    }
    #endregion

    #region RemoveEventListener 移除监听
    /// <summary>
    /// 移除监听
    /// </summary>
    /// <param name="key"></param>
    /// <param name="handler"></param>
    public void RemoveEventListener(ushort key, OnActionHandler handler)
    {
        List<OnActionHandler> lstHandler = null;
        dic.TryGetValue(key, out lstHandler);

        if (lstHandler != null)
        {
            lstHandler.Remove(handler);
            if (lstHandler.Count == 0)
            {
                dic.Remove(key);
            }
        }
        else
        {
            Debug.Log("通用事件字典中没有数据了");
        }
    }
    #endregion

    #region Dispatch 派发
    /// <summary>
    /// 派发
    /// </summary>
    /// <param name="key"></param>
    /// <param name="p"></param>
    public void Dispatch(ushort key, object userData = null)
    {
        List<OnActionHandler> lstHandler = null;
        dic.TryGetValue(key, out lstHandler);
        if (lstHandler != null)
        {
            int lstCount = lstHandler.Count;
            for (int i = 0; i < lstCount; i++)
            {
                OnActionHandler handler = lstHandler[i];
                handler?.Invoke(userData);
            }
        }
    }
    #endregion

    //事件关闭时，让他自身清空即可
    public void Dispose()
    {
        dic.Clear();
    }

  
}

```