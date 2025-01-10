```C#
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using UnityEngine;
using UnityEngine.UI;

public class LovePanel : MonoBehaviour
{
    public enum ButtonType
    {
        LovePanel,
        FriendPanel,
        HoursePanel
    }

    [Header("装页面的列表容器")]
    [SerializeField]
    public List<GameObject> PanelList = new List<GameObject>();
    // 列表中每个页面的名字作为字典的键
    private Dictionary<string, GameObject> PanelDic = new Dictionary<string, GameObject>();
    [Header("装按钮父节点的列表容器")]
    [SerializeField]
    private List<Transform> BtnParent;
    [Header("装每个父节点下面的所有按钮")]
    [SerializeField]
    private Button[] PanelAr;

    private GameObject CurrActivePanel;
    [Header("初始页面")]
    [SerializeField]
    private GameObject InitialActivePanel;


    [Header("动态加载出来的父节点")]
    [SerializeField]
    private Transform Content;

    [Header("人物框预制体")]
    [SerializeField]
    private GameObject m_Items;

    [Header("看广告框预制体")]
    [SerializeField]
    private GameObject g_Items;

    // 美女列表
    public List<int> TestBeautyList = new List<int>();

    // 显示出来的女角色的个数
    int showNum = 0;

    private void Awake()
    {
        InitializePanelDictionary();
        SetupButtonClickEvents();
        InitLovePanelCallBack();
    }

    // 初始化字典
    private void InitializePanelDictionary()
    {
        int count = PanelList.Count;
        for (int i = 0; count > i; i++)
        {
            // 将所有面板加入字典中
            if (!PanelDic.ContainsKey(PanelList[i].name))
                PanelDic[PanelList[i].name] = PanelList[i];
        }
    }
    // 找到面板物品，初步设置按钮对应效果
    private void SetupButtonClickEvents()
    {
        int btnParentCount = BtnParent.Count;
        for (int i = 0; i < btnParentCount; i++)
        {
            PanelAr = BtnParent[i].GetComponentsInChildren<Button>();
            int Btnlength = PanelAr.Length;
            for (int j = 0; j < Btnlength; j++)
            {
                // 将EventTriggerListener.Get()方法返回的委托设置为BtnCtrl
                EventTriggerListener.Get(PanelAr[j].gameObject).onClick = BtnCtrl;
                //BtnImage[PanelAr[i].name] = PanelAr[i].GetComponent<Image>();
            }
        }
    }

    //动态加载物品
    private void InitLovePanelCallBack()
    {
        // 可能的获取数据的方式
        //TalentList = GameEntry.DataTable.DataTableManager.TalentDataDBModel.GetList();

        for (int i = 0; i < TestBeautyList.Count; i++)
        {

            // 动态加载
            GameObject Go = Instantiate(m_Items);
            // 设置初始比例
            Go.transform.localScale = Vector3.one;
            // 父对象
            Go.transform.SetParent(Content);

            if (i < 1)
            {
                // 对于第一个预制体，直接设置为显示状态，已经解锁
                Go.SetActive(true);
            }
            else
            {
                // 对于非第一个预制体，先设置为隐藏状态，后续根据条件决定是否显示
                Go.SetActive(false);
            }

        }
        GameObject GG = Instantiate(g_Items);
        GG.transform.localScale = Vector3.one;
        // 父对象
        GG.transform.SetParent(Content);
        GG.GetComponent<UnLockItem>().SetUnLockItemUIData(LockBeatuty, Content);
    }

    // 解锁框对应的方法
    private void LockBeatuty(int nextIndex)
    {


        if (showNum <= TestBeautyList.Count-1)
        {
            showNum++;
            print("显示");

        }
        if(showNum == TestBeautyList.Count-1)
        {
            UnLockItem unLockItem = Content.GetChild(TestBeautyList.Count).GetComponent<UnLockItem>();
            unLockItem.gameObject.SetActive(false);
        }
        nextIndex = showNum;
        LoveItem nextItem = Content.GetChild(nextIndex).GetComponent<LoveItem>();
        nextItem.gameObject.SetActive(true);
        print("当前显示："+ nextIndex);
    
    }


    // 三个界面的切换
    public void BtnCtrl(GameObject go)
    {
        //为什么这里命名需要一致，因为go.name是传进来的PanelAr[j].gameObject的名字
        if (PanelDic.ContainsKey(go.name))
        {
            GameObject panel = PanelDic[go.name];

            ButtonType type = (ButtonType)Enum.Parse(typeof(ButtonType), go.name);

            // 回到初始页面的时候，判断是否是初始显示的页面且是否当前有页面处于激活状态，若有则隐藏它，并将当前激活页面置为null
            if (panel == InitialActivePanel)
            {
                if (CurrActivePanel != null)
                {
                    CurrActivePanel.SetActive(false);
                    // 
                    InitialActivePanel.transform.GetChild(0).GetChild(0).GetChild(0).GetComponent<Image>().enabled = true;
                    InitialActivePanel.transform.GetChild(0).GetChild(1).GetChild(0).GetComponent<Image>().enabled = false;
                    InitialActivePanel.transform.GetChild(0).GetChild(2).GetChild(0).GetComponent<Image>().enabled = false;
                }

            }
            else
            {
                InitialActivePanel.transform.GetChild(0).GetChild(0).GetChild(0).GetComponent<Image>().enabled = false;
                // 如果当前点击的按钮对应的页面不是激活状态，则激活它，并关闭当前已激活的其他页面（如果有的话）
                if (!panel.activeSelf)
                {
                    // 如果当前有已激活的页面，先关闭它
                    if (CurrActivePanel != null)
                    {
                        print(CurrActivePanel.name);
                        switch (CurrActivePanel.name)
                        {
                            case "FriendPanel":
                                InitialActivePanel.transform.GetChild(0).GetChild(1).GetChild(0).GetComponent<Image>().enabled = false;
                                break;
                            case "HoursePanel":
                                InitialActivePanel.transform.GetChild(0).GetChild(2).GetChild(0).GetComponent<Image>().enabled = false;
                                break;
                        }
                        CurrActivePanel.SetActive(false);
                    }
                    switch (type)
                    {
                        case ButtonType.FriendPanel:
                            InitialActivePanel.transform.GetChild(0).GetChild(1).GetChild(0).GetComponent<Image>().enabled = true;
                            break;
                        case ButtonType.HoursePanel:
                            InitialActivePanel.transform.GetChild(0).GetChild(2).GetChild(0).GetComponent<Image>().enabled = true;
                            break;
                    }
                    panel.SetActive(true);
                    CurrActivePanel = panel;
                }
            }
        }
    }

}
```