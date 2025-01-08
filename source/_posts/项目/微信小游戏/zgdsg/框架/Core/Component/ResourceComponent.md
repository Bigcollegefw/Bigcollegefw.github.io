```C#
using System.Collections;
using System.Collections.Generic;
using System.IO;

using UnityEngine;

public class ResourceComponent : MyBaseComponent
{
    public Dictionary<string, GameObject> GameObjectDic = new Dictionary<string, GameObject>();
    /// <summary>
    /// 本地文件路径
    /// </summary>
    public string LocalFilePath;
    protected override void OnAwake()
    {
        base.OnAwake();
        LocalFilePath = Application.dataPath;
        //#if DISABLE_ASSETBUNDLE
        //                LocalFilePath = Application.dataPath;
        //#else
        //        LocalFilePath = Application.persistentDataPath;
        //#endif
    }
    /// <summary>
    /// 读取本地文件到byte数组
    /// </summary>
    /// <param name="path"></param>
    /// <returns></returns>
    public byte[] GetFileBuffer(string path)
    {
        TextAsset textAsset = Resources.Load<TextAsset>(path);
        return textAsset.bytes;
    }

    public GameObject ResourcesLoad(string Name, string Path)
    {
        if (GameObjectDic.ContainsKey(Name)) return GameObjectDic[Name];
        GameObject Go = Resources.Load(Path) as GameObject;
        GameObjectDic[Name]=Go;
        return GameObjectDic[Name];
    }
    public override void ShutDown()
    {

    }
}

```