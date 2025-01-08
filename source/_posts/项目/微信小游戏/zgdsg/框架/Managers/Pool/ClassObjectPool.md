```C#
using System;
using System.Collections;
using System.Collections.Generic;

using UnityEngine;

public class ClassObjectPool : IDisposable
{

    public Dictionary<int, byte> ClassObjectCount
    {
        get;
        private set;
    }

    /// <summary>
    /// 类对象池字典
    /// </summary>
    private Dictionary<int, Queue<object>> m_ClassObjectPoolDic;
#if UNITY_EDITOR_64
    /// <summary>
    /// 在监视面板显示的类对象池的信息
    /// </summary>
    public Dictionary<Type, int> m_InspectorClassObjectPoolDic = new Dictionary<Type, int>();
#endif
    public ClassObjectPool()
    {
        ClassObjectCount = new Dictionary<int, byte>();
        m_ClassObjectPoolDic = new Dictionary<int, Queue<object>>();
    }
    public T DequeueClassObject<T>() where T : class, new()
    {
        lock (m_ClassObjectPoolDic)
        {
            int Key = typeof(T).GetHashCode();
            Queue<object> queue = null;
            m_ClassObjectPoolDic.TryGetValue(Key, out queue);
            if (queue == null) { queue = new Queue<object>(); m_ClassObjectPoolDic[Key] = queue; };

            if (queue.Count > 0)
            {
                object obj = queue.Dequeue();
#if UNITY_EDITOR_64
                obj.GetType();
                InspectorCtrl(obj.GetType(), -1);

                Debug.Log("对象" + Key + "存在 在池中获取");
#endif
                return (T)obj;
            }
            else
            {
#if UNITY_EDITOR_64
                Debug.Log("对象" + Key + "不存在进行实例化");
#endif
                return new T();
            }
        }
    }
    public void SetClassObjectResideCount<T>(byte count) where T : class
    {
        int Key = typeof(T).GetHashCode();

        ClassObjectCount[Key] = count;

    }


    /// <summary>
    /// 对象回池
    /// </summary>
    public void EnqueueClassObject(object obj)
    {
        lock (m_ClassObjectPoolDic)
        {
            int key = obj.GetType().GetHashCode();
            Debug.Log("对象" + key + "回池了"+ m_ClassObjectPoolDic[key].Count);
            Queue<object> queue = null;
            m_ClassObjectPoolDic.TryGetValue(key, out queue);
#if UNITY_EDITOR_64

            InspectorCtrl(obj.GetType(), 1, 1);
#endif
            if (queue != null) queue.Enqueue(obj);
        }
    }
    private void InspectorCtrl(Type t, int param, int initValue = 0)
    {
#if UNITY_EDITOR_64
        if (m_InspectorClassObjectPoolDic.ContainsKey(t))
        {
            m_InspectorClassObjectPoolDic[t] += param * 1;
        }
        else
        {
            m_InspectorClassObjectPoolDic[t] = initValue;
        }
#endif
    }
    /// <summary>
    /// 释放对象池
    /// </summary>
    public void Clear()
    {
        lock (m_ClassObjectPoolDic)
        {
            var enumerator = m_ClassObjectPoolDic.GetEnumerator();
            int queueCount = 0;
            while (enumerator.MoveNext())
            {
                int key = enumerator.Current.Key;
                Queue<object> queue = m_ClassObjectPoolDic[key];
#if UNITY_EDITOR_64
                Type t = null;
#endif
                queueCount = queue.Count;
                byte resideCout = 0;
                ClassObjectCount.TryGetValue(key, out resideCout);

                while (queueCount > resideCout)
                {
                    queueCount--;
                    object obj = queue.Dequeue();
#if UNITY_EDITOR_64
                    t = obj.GetType();
                    m_InspectorClassObjectPoolDic[t]--;
#endif
                }
                if (queueCount == 0)
                {
                    //会造成在池中取出对象已经取出但是执行GC了，让出池的对象无法回池 
                    //if (resideCout == 0)
                    //{
                    //    m_ClassObjectPoolDic[key] = null;
                    //    m_ClassObjectPoolDic.Remove(key);
                    //}
#if UNITY_EDITOR_64
                    if (t != null) m_InspectorClassObjectPoolDic.Remove(t);
#endif
                }
            }
            GC.Collect();
        }
    }
    public void Dispose()
    {
        m_ClassObjectPoolDic.Clear();
    }
}
```