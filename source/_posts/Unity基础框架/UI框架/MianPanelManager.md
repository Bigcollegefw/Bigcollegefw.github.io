```C#
using System;
using System.Collections;
using System.Collections.Generic;

using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
public enum PanelType
{
    BagPanel,
    WeaponPanel,
    TalentPanel,
    RolePanel,
    PetPanel
}
public class MainPanelManager : MonoBehaviour
{
    [SerializeField]
    public List<GameObject> PanelList = new List<GameObject>();
    private Dictionary<string, GameObject> PanelDic = new Dictionary<string, GameObject>();
    [SerializeField]
    private Transform BtnParent;
    [SerializeField]
    private Button[] PanelAr;
    //[SerializeField]
    //private Sprite[] BtnSprite;
    [Header("金币框")]
    [SerializeField]
    private Text GoldValue;
    [Header("提示页面")]
    [SerializeField]
    private Transform TipPanel;
    [Header("战斗页面")]
    [SerializeField]
    private Transform BattlePanel;

    [Header("进入战斗")]
    [SerializeField]
    private Button m_StartGameBattle;
    [Header("战斗失败页面")]
    [SerializeField]
    private Transform m_OverPanel;
    /// <summary>
    /// 初始化界面
    /// </summary>
    [SerializeField]
    private GameObject InitPanel;
    //private Dictionary<string, Image> BtnImage = new Dictionary<string, Image>();
    private GameObject CurrActivePanel;
   
    private void Awake()
    {
        InitAddListener();
        TransInit();
        gameObject.SetActive(false);
    }
    // 找到面板物品，初步设置按钮对应效果
    void TransInit()
    {
        int count = PanelList.Count;
        for (int i = 0; count > i; i++)
        {
            // 将所有面板加入字典中
            if (!PanelDic.ContainsKey(PanelList[i].name)) PanelDic[PanelList[i].name] = PanelList[i];
        }
        PanelAr = BtnParent.GetComponentsInChildren<Button>();
        int Btnlength = PanelAr.Length;
        for (int i = 0; i < Btnlength; i++)
        {
            // 将EventTriggerListener.Get()方法返回的委托设置为BtnCtrl,设置每个按钮可以发送数据到服务端
            EventTriggerListener.Get(PanelAr[i].gameObject).onClick = BtnCtrl;
            //BtnImage[PanelAr[i].name] = PanelAr[i].GetComponent<Image>();

        }
        // 设置开始战斗场景按钮点击后开始战斗
        EventTriggerListener.Get(m_StartGameBattle.gameObject).onClick = StartGameBattleBtnCtrl;
    }
    void InitAddListener()
    {
        GameEntry.Event.CommonEvent.AddEventListener(SysEventId.LoadOneDataTableComplete, OnLoadOneDataTableCompleteCallBack);
        GameEntry.Event.CommonEvent.AddEventListener(SysEventId.OnEnterBattleScene, OnEnterBattleSceneCallBack);
        GameEntry.Event.CommonEvent.AddEventListener(SysEventId.BattleToMain, BattleToMainCallBack);
        //GameEntry.Event.CommonEvent.AddEventListener(SysEventId.ClickModules, ClickModulesCallBack);
    }

    //private void ClickModulesCallBack(object userData)
    //{
    //    BtnImage[userData.ToString()].sprite = BtnSprite[0];
    //}

    private void SendDataCallBack(HttpCallBackArgs args)
    {
        print(args.HasError);
        print(args.ToString());
        print(args.Value);
    }

    private void BattleToMainCallBack(object userData)
    {
        gameObject.SetActive(true);
        m_OverPanel.gameObject.SetActive(false);
        BattlePanel.gameObject.SetActive(false);
    }

    private void OnEnterBattleSceneCallBack(object userData)
    {
        BattlePanel.gameObject.SetActive(true);
        gameObject.SetActive(false);
    }

    private void Update()
    {

    }
    private void StartGameBattleBtnCtrl(GameObject go)
    {
        LoadSceneManager.Instance.LoadScene("CombatScene");
    }
    /// <summary>
    /// 数据加载完成跳转场景
    /// </summary>
    /// <param name="userData"></param>
    private void OnLoadOneDataTableCompleteCallBack(object userData)
    {
        LoadSceneManager.Instance.LoadScene("MainEntry");
        gameObject.SetActive(true);
        StartCoroutine(InitCtrl());
    }

    private IEnumerator InitCtrl()
    {
        yield return new WaitForSeconds(1);
        InitPanel.gameObject.SetActive(false);
       
    }

    public void BtnCtrl(GameObject go)
    {
        GameObject panel = PanelDic[go.name];
        if (go.name == "TalentPanel")
        {
            GameEntry.Http.SendData("http://192.168.0.102:9876/api/account?id=3", SendDataCallBack);
        }
        panel.SetActive(!panel.activeSelf);
        //if (CurrActivePanel != null)
        //{
        //    if (panel.activeSelf)
        //    {
        //        if (CurrActivePanel.name != panel.name)
        //        {
        //            CurrActivePanel.SetActive(false);
        //            BtnImage[CurrActivePanel.name].sprite = BtnSprite[0];
        //            panel.SetActive(true);
        //            CurrActivePanel = panel;
        //            BtnImage[CurrActivePanel.name].sprite = BtnSprite[1];
        //        }
        //        else
        //        {

        //            BtnImage[CurrActivePanel.name].sprite = BtnSprite[!panel.activeInHierarchy ? 0 : 1];
        //        }

        //    }
        //    else
        //    {
        //        BtnImage[CurrActivePanel.name].sprite = BtnSprite[0];
        //    }
        //}
        //else
        //{
        //    CurrActivePanel = panel;
        //    BtnImage[CurrActivePanel.name].sprite = BtnSprite[1];
        //}
    }

}

```
