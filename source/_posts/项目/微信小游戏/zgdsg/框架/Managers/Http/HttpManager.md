```C#
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

    public class HttpManager : ManagerBase, IDisposable
    {
      

        public void Dispose()
        {

        }

        //public override void Init()
        //{
        //    m_WebAccountUrl = GameEntry.ParamsSettings.WebAccountUrl;
        //    m_TestWebAccountUrl = GameEntry.ParamsSettings.TestWebAccountUrl;
        //    m_IsTest = GameEntry.ParamsSettings.IsTest;

        //    Retry = GameEntry.ParamsSettings.GetGradeParamData(ConstDefine.Http_Retry, GameEntry.CurrDeviceGrade);
        //    RetryInterval = GameEntry.ParamsSettings.GetGradeParamData(ConstDefine.Http_RetryInterval, GameEntry.CurrDeviceGrade);
        //}

        /// <summary>
        /// 发送消息
        /// </summary>
        /// <param name="url"></param>
        /// <param name="callBack"></param>
        /// <param name="isPost"></param>
        /// <param name="isGetData"></param>
        /// <param name="dic"></param>
        public void SendData(string url, HttpSendDataCallBack callBack, bool isPost = false, Dictionary<string, object> dic = null)
        {
            Debug.Log("发送消息");
            HttpRoutine http = GameEntry.Pool.DequeueClassObject<HttpRoutine>();
            http.SendData(url, callBack, isPost, dic);
        }
    }
```