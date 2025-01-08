```C#

using LitJson;

using System;
using System.Collections;
using System.Collections.Generic;

using UnityEngine;
using UnityEngine.Networking;


/// <summary>
/// Http发送数据的回调委托
/// </summary>
/// <param name="args"></param>
public delegate void HttpSendDataCallBack(HttpCallBackArgs args);

/// <summary>
/// Http访问器
/// </summary>
public class HttpRoutine
{
    #region 属性

    /// <summary>
    /// Http请求回调
    /// </summary>
    private HttpSendDataCallBack m_CallBack;

    /// <summary>
    /// Web请求回调数据
    /// </summary>
    private HttpCallBackArgs m_CallBackArgs;

    /// <summary>
    /// 是否繁忙
    /// </summary>
    public bool m_IsBusy
    {
        get;
        private set;
    }

    /// <summary>
    /// 当前重试次数
    /// </summary>
    private int m_CurrRetry = 0;

    /// <summary>
    /// Url
    /// </summary>
    private string m_Url;

    /// <summary>
    /// 是否获取data数据
    /// </summary>
    private bool m_IsGetData = false;

    /// <summary>
    /// Post
    /// </summary>
    private bool m_IsPost = false;

    /// <summary>
    /// 发送的数据
    /// </summary>
    private Dictionary<string, object> m_Dic;
    #endregion

    public HttpRoutine()
    {
        m_CallBackArgs = new HttpCallBackArgs();
    }

    #region SendData 发送web数据
    /// <summary>
    /// 发送web数据
    /// </summary>
    /// <param name="url"></param>
    /// <param name="callBack"></param>
    /// <param name="isPost"></param>
    /// <param name="json"></param>
    public void SendData(string url, HttpSendDataCallBack callBack, bool isPost = false, Dictionary<string, object> dic = null)
    {
        if (m_IsBusy) return;

        m_IsBusy = true;
        m_CallBack = callBack;

        if (!isPost)
        {
            GetUrl(url);
        }
        else
        {
            //web加密
            //if (dic != null)
            //{
            //    //客户端标识符
            //    dic["deviceIdentifier"] = DeviceUtil.DeviceIdentifier;

            //    //设备型号
            //    dic["deviceModel"] = DeviceUtil.DeviceModel;


            //    long t = GameEntry.Data.SysDataManager.CurrServerTime;
            //    //签名
            //    dic["sign"] = EncryptUtil.Md5(string.Format("{0}:{1}", t, DeviceUtil.DeviceIdentifier));

            //    //时间戳
            //    dic["t"] = t;
            //}
            string json=string.Empty;
            if (dic != null)
            {
                json=JsonMapper.ToJson(dic);
                GameEntry.Pool.EnqueueClassObject(dic);
            }
            PostUrl(url, json);
          
        }
    }
    #endregion

    #region GetUrl Get请求
    /// <summary>
    /// Get请求
    /// </summary>
    /// <param name="url"></param>
    private void GetUrl(string url)
    {
        UnityWebRequest Data = UnityWebRequest.Get(url);
        GameEntry.Http.StartCoroutine(Request(Data));
    }
    #endregion

    #region PostUrl Post请求
    /// <summary>
    /// Post请求
    /// </summary>
    /// <param name="url"></param>
    /// <param name="json"></param>
    private void PostUrl(string url, string json)
    {
        //定义一个表单
        WWWForm form = new WWWForm();
        form.AddField("", json);

        UnityWebRequest www = UnityWebRequest.Post(url, form);

        GameEntry.Http.StartCoroutine(Request(www));
    }
    #endregion

    #region Request 请求服务器
    /// <summary>
    /// 请求服务器
    /// </summary>
    /// <param name="www"></param>
    /// <returns></returns>
    private IEnumerator Request(UnityWebRequest Data)
    {
        yield return Data.SendWebRequest();

        m_IsBusy = false;
        if(Data.result==UnityWebRequest.Result.ConnectionError||Data.result== UnityWebRequest.Result.ProtocolError)
        {
            if (m_CallBack != null)
            {
                Debug.Log(Data.error);
                m_CallBackArgs.HasError = true;
                m_CallBackArgs.Value = Data.error;
                m_CallBack(m_CallBackArgs);
            }
        }
        else
        {
            if (m_CallBack != null)
            {
                m_CallBackArgs.HasError = false;
                m_CallBackArgs.Value = Data.downloadHandler.text;
                m_CallBack(m_CallBackArgs);
            }
        }
        Data.Dispose();
        Data = null;
        //Http访问器回池
        GameEntry.Pool.EnqueueClassObject(this);
#if UNITY_EDITOR_64
        Debug.Log("Http访问器回池");
#endif
    }
    #endregion
}
```