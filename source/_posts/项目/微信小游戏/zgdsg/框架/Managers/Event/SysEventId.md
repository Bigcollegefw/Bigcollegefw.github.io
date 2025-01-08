```C#
using System.Collections;
using System.Collections.Generic;

using UnityEngine;


/// <summary>
/// 系统事件编号(系统事件编号 采用4位 1001(10表示模块 01表示编号))
/// </summary>
public class SysEventId
{
    /// <summary>
    /// 加载表格完毕
    /// </summary>
    public const ushort LoadDataTableComplete = 1001;

    /// <summary>
    /// 加载单一表格完毕
    /// </summary>
    public const ushort LoadOneDataTableComplete = 1002;

    /// <summary>
    /// 加载Lua表格完毕
    /// </summary>
    public const ushort LoadLuaDataTableComplete = 1003;

    /// <summary>
    /// 加载进度条更新
    /// </summary>
    public const ushort LoadingProgressChange = 1101;

    /// <summary>
    /// 检查版本更新开始下载
    /// </summary>
    public const ushort CheckVersionBeginDownload = 1201;

    /// <summary>
    /// 检查版本更新下载资源中
    /// </summary>
    public const ushort CheckVersionDownloadUpdate = 1202;

    /// <summary>
    /// 检查版本更新下载完毕
    /// </summary>
    public const ushort CheckVersionDownloadComplete = 1203;

    /// <summary>
    /// 预加载开始
    /// </summary>
    public const ushort PreloadBegin = 1204;

    /// <summary>
    /// 预加载中
    /// </summary>
    public const ushort PreloadUpdate = 1205;

    /// <summary>
    /// 预加载完毕
    /// </summary>
    public const ushort PreloadComplete = 1206;

    /// <summary>
    /// 关闭检查版本更新UI
    /// </summary>
    public const ushort CloseCheckVersionUI = 1207;



    /// <summary>
    /// 进入战斗场景
    /// </summary>
    public const ushort OnEnterBattleScene = 1208;
    public const ushort OverBattle = 1209;
    /// <summary>
    /// 战斗场景返回
    /// </summary>
     public const ushort BattleToMain = 1210;
     public const ushort Tip=1211;
     public const ushort OpenShop=1212;
     public const ushort SettingShow=1213;
     public const ushort ResetAttack=1214;
     public const ushort WelfareShow=1215;
     //public const ushort ClickModules=1216;
}
```