```C#


using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class PoolComponent : MyBaseComponent, IUpdateComponent
{
    private PoolManager m_PoolManager;
    public PoolManager PoolManager
    {
        get { return m_PoolManager; }
        private set { }
    }
    protected override void OnAwake()
    {
        base.OnAwake();
        m_NextRunTime = Time.time;
        m_PoolManager = new PoolManager();
        GameEntry.RegisterUpdateComponent(this);
        InitGameObectPool();
        SetClassObjectCount<VarInt>(10);

    }
    protected override void OnStart()
    {
        base.OnStart();
        InitClassReside();
    }
    public override void ShutDown()
    {
        m_PoolManager.Dispose();
    }

    /// <summary>
    /// 取出一个对象
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <returns></returns>
    public T DequeueClassObject<T>() where T : class, new()
    {
        return m_PoolManager.ClassObjectPool.DequeueClassObject<T>();
    }



    /// <summary>
    /// 对象回池
    /// </summary>
    public void EnqueueClassObject(object obj)
    {
        m_PoolManager.ClassObjectPool.EnqueueClassObject(obj);
    }


    /// <summary>
    /// 释放间隔
    /// </summary>
    [SerializeField]
    public float m_ClearInterval = 30;
    /// <summary>
    /// 下次运行时间
    /// </summary>
    private float m_NextRunTime = 0f;
    public void OnUpdate()
    {
        if (Time.time > m_NextRunTime + m_ClearInterval)
        {
            //该释放了
            m_NextRunTime = Time.time;
            PoolManager.ClearClassObjectPool();
        }
    }
    /// <summary>
    /// 设置类对象在池中常驻数量
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <param name="count"></param>
    public void SetClassObjectCount<T>(byte count) where T : class
    {
        int Key = typeof(T).GetHashCode();
        m_PoolManager.ClassObjectPool.SetClassObjectResideCount<T>(count);
    }
    /// <summary>
    /// 初始化常用类常驻数量
    /// </summary>
    private void InitClassReside()
    {
        m_PoolManager.ClassObjectPool.SetClassObjectResideCount<HttpRoutine>(3);
        m_PoolManager.ClassObjectPool.SetClassObjectResideCount<Dictionary<string, object>>(3);
    }
    #region 游戏物体对象池
    /// <summary>
    /// 对象池的分组
    /// </summary>
    [SerializeField]
    private GameObjectPoolEntity[] m_GameObjectPoolGroups;
    #endregion

    /// <summary>
    /// 初始化游戏物体对象池 
    /// </summary>
    public void InitGameObectPool()
    {
        StartCoroutine(PoolManager.GameObjectPool.Init(m_GameObjectPoolGroups, transform));
    }

    /// <summary>
    /// 从对象池中获取游戏物体对象
    /// </summary>
    /// <param name="poolId">池Id</param>
    /// <param name="prefab">游戏物体的预制体</param>
    /// <param name="onComplete">取出后的回调</param>
    public void GameObjectSpawn(byte poolId, Transform prefab, Action<Transform> onComplete)
    {
        PoolManager.GameObjectPool.Spawn(poolId, prefab, onComplete);
    }
    public void GameObjectDespawn(byte poolId, Transform instance)
    {
        PoolManager.GameObjectPool.Despawn(poolId, instance);
    }
    #region 变量对象池

    /// <summary>
    /// 变量对象池锁
    /// </summary>
    private object m_VarObjectLock = new object();

#if UNITY_EDITOR_64

    /// <summary>
    /// 在监视面板显示的信息
    /// </summary>
    public Dictionary<Type, int> VarObjectInspectorDic = new Dictionary<Type, int>();
#endif
    /// <summary>
    /// 取出一个变量对象
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <returns></returns>
    public T DequeueVarObject<T>() where T : VariableBase, new()
    {
        lock (m_VarObjectLock)
        {
            T item = DequeueClassObject<T>();
#if UNITY_EDITOR_64
            Type t = item.GetType();
            if (VarObjectInspectorDic.ContainsKey(t))
            {
                VarObjectInspectorDic[t]++;
            }
            else
            {
                VarObjectInspectorDic[t] = 1;
            }

#endif
            return DequeueClassObject<T>();
        }

    }
    /// <summary>
    /// 变量对象回池
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <param name="item"></param>
    public void EqueueVarObject<T>(T item) where T : VariableBase
    {
        lock (m_VarObjectLock)
        {
            EnqueueClassObject(item);
#if UNITY_EDITOR_64
            Type t = item.GetType();

            if (VarObjectInspectorDic.ContainsKey(t))
            {
                VarObjectInspectorDic[t]--;
                if (VarObjectInspectorDic[t] == 0)
                {
                    VarObjectInspectorDic.Remove(t);
                }
            }
#endif
        }
    }

    #endregion

}

```