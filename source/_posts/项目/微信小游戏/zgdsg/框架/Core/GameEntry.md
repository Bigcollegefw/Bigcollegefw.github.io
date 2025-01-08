```C#

using LitJson;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GameEntry : MonoBehaviour
{
    /// <summary>
    /// 事件
    /// </summary>
    public static EventComponet Event
    {
        get;
        private set;
    }
    /// <summary>
    /// 数据
    /// </summary>
    public static DataComponent Data
    {
        get;
        private set;
    }
    /// <summary>
    /// 时间
    /// </summary>
    public static TimeComponent Time
    {
        get;
        private set;
    }

    /// <summary>
    /// http
    /// </summary>
    public static HttpComponent Http
    {
        get;
        private set;
    }
    public static DataTableComponent DataTable
    {
        get;
        private set;
    }
    public static PoolComponent Pool
    {
        get;
        private set;
    }
    public static ResourceComponent Resource
    {
        get;
        private set;
    }
    internal static void RegisterBaseComponent(MyBaseComponent component)
    {
        Type type = component.GetType();
        LinkedListNode<MyBaseComponent> curr = m_BaseComponentList.First;
        while (curr != null)
        {
            if (curr.Value.GetType() == type) return;
            curr = curr.Next;
        }
        m_BaseComponentList.AddLast(component);
    }

    public static T GetBaseComponent<T>() where T : MyBaseComponent
    {
        return (T)GetBaseComponent(typeof(T));
    }
    internal static MyBaseComponent GetBaseComponent(Type type)
    {
        LinkedListNode<MyBaseComponent> curr = m_BaseComponentList.First;
        while (curr != null)
        {
            if (curr.Value.GetType() == type)
                return curr.Value;
            curr = curr.Next;
        }
        return null;
    }
    private static readonly LinkedList<MyBaseComponent> m_BaseComponentList = new LinkedList<MyBaseComponent>();


    private static readonly LinkedList<IUpdateComponent> m_UpdateComponentList = new LinkedList<IUpdateComponent>();

    public static void RegisterUpdateComponent(IUpdateComponent component)
    {
        m_UpdateComponentList.AddLast(component);
    }

    /// <summary>
    /// 移除更新组件
    /// </summary>
    public static void RemoveUpdateComponent(IUpdateComponent component)
    {
        m_UpdateComponentList.Remove(component);
    }



    void Awake()
    {
        //if(GameObject.FindObjectsOfType<GameEntry>() == null)
        //{
        DontDestroyOnLoad(this);
        //}
        InitBaseComponents();

    }
    private void Start()
    {


        DataTable.LoadDataTableAsync();
        GetServerData();
    }



    private static void InitBaseComponents()
    {

        Event = GetBaseComponent<EventComponet>();
        Time = GetBaseComponent<TimeComponent>();
        Data = GetBaseComponent<DataComponent>();
        Resource = GetBaseComponent<ResourceComponent>();
        DataTable = GetBaseComponent<DataTableComponent>();
        Http = GetBaseComponent<HttpComponent>();
        Pool = GetBaseComponent<PoolComponent>();



    }

    public class TestObject
    {
        public int Modeule;
        public string ModuleName;
        public string Content;
    }
    TimeAction m_TimeTest;
    private string url = "https://minigame.zijieapi.com/mgplatform/api/apps/jscode2session";
    private string appid = "tta1a9d7143e9ea8b207";
    private string secret = "de0014476c1da0d39e3675d87b14c8239cca0005";
    private string Code = "";
    private string AnonymousCode = "";
    private string OpenID = "";
    private string signature;
    private string iv;
    private string encryptedData;
    void GetServerData()
    {
        m_TimeTest = new TimeAction();
        m_TimeTest.Init(3, 1, 1000, () => { print("开始"); }, (int loop) =>
        {
            Dictionary<string, object> Dic = Pool.DequeueClassObject<Dictionary<string, object>>();
            Dic.Clear();
            Dic["Type"] = 1;
            Dic["Value"] = "这是测试";
            Http.SendData("http://192.168.0.102:9876/api/account", SendDataCallBack, true, Dic);
        },
        () =>
        {
            print("执行完毕");
        }
        ).Run();
        #region
        //StarkSDKSpace.StarkSDK.API.GetAccountManager().Login(
        //    (c1, c2, isLogin) =>
        //    {
        //        Code = c1;
        //        AnonymousCode = c2;

        //      Register();

        //    },
        //    (msg) =>
        //    {
        //        Debug.LogError("登录失败 ：" + msg);
        //        Debug.Log("请重新登录");
        //    },
        //    true
        //    );
        //Dictionary<string, object> dic = new Dictionary<string, object>();
        //dic["Type"] = 0;
        //dic["Code"] = Code;

        #endregion
    }

    private void Register()
    {
        //StarkSDK.API.Authorize(scope: "scope.userInfo",
        //               (string arg1, StarkSDKSpace.UNBridgeLib.LitJson.JsonData arg2) =>
        //               {
        //                   Debug.Log("获取授权成功");
        //                   Dictionary<string, object> dic = new Dictionary<string, object>();
        //                   dic["Type"] = 0;
        //                   dic["Code"] = Code;
        //                   NetWorkHttp.Instance.SendData("http://www.sangliangban.com:9987/api/user", OnRegRequestCallBack,dic,true );
        //               }, fail);
    }
    private void fail(string arg1, string arg2)
    {
        Debug.Log("获取授权失败");
        //GetUserOpenID();
    }
    private void SendDataCallBack(HttpCallBackArgs args)
    {
        JsonData data = JsonMapper.ToObject(args.Value.ToString());
        string Value = data["Value"].ToString();
        TestObject to = JsonMapper.ToObject<TestObject>(Value);
#if UNITY_EDITOR_64
        print(to.Modeule + to.ModuleName + to.Content);
#endif

    }

    // Update is called once per frame
    void Update()
    {
        for (LinkedListNode<IUpdateComponent> curr = m_UpdateComponentList.First; curr != null; curr = curr.Next)
        {
            curr.Value.OnUpdate();
        }
    }
    private void OnDestroy()
    {

        for (LinkedListNode<MyBaseComponent> curr = m_BaseComponentList.First; curr != null; curr = curr.Next)
        {
            curr.Value.ShutDown();
        }
    }
}


```