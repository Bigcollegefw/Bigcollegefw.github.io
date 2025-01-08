```C#
using PathologicalGames;

using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
public class GameObjectPool : IDisposable
{
    private Dictionary<byte, GameObjectPoolEntity> m_SpawnPoolDic;
    public GameObjectPool()
    {
        m_SpawnPoolDic = new Dictionary<byte, GameObjectPoolEntity>();
    }
    public IEnumerator Init(GameObjectPoolEntity[] arr, Transform parent)
    {
        int len = arr.Length;
        for (int i = 0; i < len; i++)
        {
            GameObjectPoolEntity entity = arr[i];
            if (entity.Pool != null)
            {
                UnityEngine.Object.Destroy(entity.Pool.gameObject);
                yield return null;
                entity.Pool = null;
            }
            //创建对象池
            SpawnPool pool = PathologicalGames.PoolManager.Pools.Create(entity.PoolName);
            pool.group.parent = parent;
            pool.poolName = entity.PoolName;
            pool.group.localPosition = Vector3.zero;
            entity.Pool = pool;
            m_SpawnPoolDic[entity.PoolId] = entity;
        }
    }
    public void Spawn(byte poolId, Transform prefab, Action<Transform> onComplete)
    {
        GameObjectPoolEntity entity = m_SpawnPoolDic[poolId];
        PrefabPool prefabPool = entity.Pool.GetPrefabPool(prefab);
        if (prefabPool == null)
        {
            prefabPool = new PrefabPool(prefab);
            prefabPool.cullDespawned = entity.CullDespawned;
            prefabPool.cullDelay = entity.CullDelay;
            prefabPool.cullAbove = entity.CullAbove;
            prefabPool.cullMaxPerPass = entity.CullMaxPerPass;
            entity.Pool.CreatePrefabPool(prefabPool);
        }
        onComplete?.Invoke(entity.Pool.Spawn(prefab));
    }
    public void Despawn(byte poolId, Transform instance)
    {
        GameObjectPoolEntity entity = m_SpawnPoolDic[poolId];
        entity.Pool.Despawn(instance);
    }

    public void Dispose()
    {
        m_SpawnPoolDic.Clear();
    }
}
```