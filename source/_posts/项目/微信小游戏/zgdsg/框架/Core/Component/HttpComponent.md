```C#
using System.Collections;
using System.Collections.Generic;

using UnityEngine;


    public class HttpComponent : MyBaseComponent
    {
        /// <summary>
        /// 正式账号服务器Url
        /// </summary>
        [SerializeField]
        [Header("正式账号服务器Url")]
        private string m_WebAccountUrl;

        /// <summary>
        /// 测试账号服务器Url
        /// </summary>
        [SerializeField]
        [Header("测试账号服务器Url")]
        private string m_TestWebAccountUrl;

        /// <summary>
        /// 是否测试环境
        /// </summary>
        [SerializeField]
        [Header("是否测试环境")]
        private bool m_IsTest;

        /// <summary>
        /// 真实账号服务器Url
        /// </summary>
        public string RealWebAccountUrl
        {
            get
            {
                return m_IsTest ? m_TestWebAccountUrl : m_WebAccountUrl;
            }
        }

        /// <summary>
        /// 连接失败后重试次数
        /// </summary>
        public int Retry
        {
            get;
            private set;
        }

        /// <summary>
        /// 连接失败后重试间隔（秒）
        /// </summary>
        public int RetryInterval
        {
            get;
            private set;
        }
        /// <summary>
        /// http管理器
        /// </summary>
        HttpManager m_HttpManager;
        protected override void OnAwake()
        {
            base.OnAwake();
            m_HttpManager = new HttpManager();
        }
        /// <summary>
        /// 发送Http数据
        /// </summary>
        /// <param name="url"></param>
        /// <param name="callBack"></param>
        /// <param name="isPost"></param>
        /// <param name="isGetData"></param>
        /// <param name="dic"></param>
        public void SendData(string url, HttpSendDataCallBack callBack, bool isPost = false,  Dictionary<string, object> dic = null)
        {
            m_HttpManager.SendData(url, callBack, isPost, dic);
        }
        public override void ShutDown()
        {

        }

    }
```