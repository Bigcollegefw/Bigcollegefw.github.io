```C#
using PathologicalGames;

using System.Collections;
using System.Collections.Generic;
using UnityEngine;
/// <summary>
/// 配置物体对象池的实体
/// </summary>
[System.Serializable]
public class GameObjectPoolEntity
{
    /// <summary>
    /// 对象池编号
    /// </summary>
    public byte PoolId;
    /// <summary>
    /// 对象池名称
    /// </summary>
    public string PoolName;
    /// <summary>
    /// 是否开启缓存模式
    /// </summary>
    public bool CullDespawned;
    /// <summary>
    /// 缓存池自动清理,但是始终保留几个对象不清理
    /// </summary>
    public int CullAbove;
    /// <summary>
    /// 多长时间清理一次
    /// </summary>
    public int CullDelay;
    /// <summary>
    /// 每次清理几个
    /// </summary>
    public int CullMaxPerPass;
    /// <summary>
    /// 对应的游戏物体对象池
    /// </summary>
    public SpawnPool Pool;
}

```