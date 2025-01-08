```C#
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// 用于HTTP请求后的事件处理
/// </summary>
public class SocketEvent : IDisposable
{
    public delegate void OnActionHandler(byte[] buffer);
    private Dictionary<ushort, List<OnActionHandler>> dic = new Dictionary<ushort, List<OnActionHandler>>();

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
    }
    #endregion

    #region Dispatch 派发
    /// <summary>
    /// 派发
    /// </summary>
    /// <param name="key"></param>
    /// <param name="p"></param>
    public void Dispatch(ushort key, byte[] buffer)
    {
        List<OnActionHandler> lstHandler = null;
        dic.TryGetValue(key, out lstHandler);
        int lstCount = lstHandler.Count;
        if (lstHandler != null)
        {
            for (int i = 0; i < lstCount; i++)
            {
                OnActionHandler handler = lstHandler[i];
                handler?.Invoke(buffer);
            }
        }
    }

    public void Dispatch(ushort key)
    {
        Dispatch(key, null);
    }
    #endregion
    //事件关闭时，让他自身清空即可
    public void Dispose()
    {
        dic.Clear();
    }
}

```