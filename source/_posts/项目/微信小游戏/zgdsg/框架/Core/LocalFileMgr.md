```C#
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using UnityEngine;

public class LocalFileMgr 
{
    private static LocalFileMgr instance;
    public static LocalFileMgr Instance 
    {
        get
        {

            if (Instance == null)
            {
                instance = new LocalFileMgr();
                return instance;
            }
            else
            {
                return instance;
            }
        }
    }



    /// <summary>
    /// 读取本地文件到byte数组
    /// </summary>
    /// <param name="path"></param>
    /// <returns></returns>
    public byte[] GetBuffer(string path)
    {
        //byte[] buffer = null;
        TextAsset textAsset=null;
        try
        {
            textAsset = Resources.Load<TextAsset>(path);
        }
        catch (Exception e)
        {
            Debug.Log(e.ToString());
        }
        return textAsset.bytes;


    }
}


```