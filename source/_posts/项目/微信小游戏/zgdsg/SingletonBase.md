```C#
using UnityEngine;

/// <summary>
/// 泛型单例
/// </summary>
/// <typeparam name="T"></typeparam>
public class SingletonBase<T> : MonoBehaviour where T : SingletonBase<T>
    //该类是继承至MonoBehavior的泛型类，且该泛型需为SingletonMono类或其子类
{
    public static T Instance;//泛型单例

    protected virtual void Awake()
    {
        //if (Instance == null)
        //{
        //    Instance = (T)this;
        //}

        // 如果Instance为空，设置当前实例为Instance
        if (Instance == null)
        {
            Instance = (T)this;
            // DontDestroyOnLoad(gameObject);  // 保持当前物体不被销毁
        }
    }
}
```
