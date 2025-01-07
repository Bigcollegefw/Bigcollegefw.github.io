```C#
using System;
using System.Collections;
using System.Collections.Generic;

using Unity.VisualScripting;
using UnityEngine;
using UnityEngine.UI;

public class CenterContainerManager : MonoBehaviour
{
    public List<int> TestList = new List<int>();

    [Header("金钱数量")]
    [SerializeField]
    private Text MoneyTex;

    [Header("txtLevelUp")]
    [SerializeField]
    private Text txtLevelUp;

    [Header("每个物品的要花费的钱")]
    [SerializeField]
    private Text txtMoney;

    [Header("物品名字")]
    [SerializeField]
    private Text txtNameLe;

    [Header("增益描述")]
    [SerializeField]
    private Text txtBuff;

    [Header("需要绑定事件的按钮")]
    [SerializeField]
    private GameObject[] btnArr;

    [Header("装备图片")]
    [SerializeField]
    private Sprite[] m_Sprite;

    [Header("动态加载出来的父节点")]
    [SerializeField]
    private Transform Content;

    [Header("预制体")]
    [SerializeField]
    private GameObject m_Items;



    private enum BtnType
    {
        btnMagicWeapon,btnDouble
    }

    // 第一个预制体是否已加载完成
    //private bool isFirstPrefabLoaded = false;



    private void Awake()
    {
        InitTalentPanelCallBack();
        // GameEntry.Event.CommonEvent.AddEventListener(SysEventId.LoadDataTableComplete, InitTalentPanelCallBack);
        //gameObject.SetActive(false);
    } 

    // 实现动态加载
    private void InitTalentPanelCallBack()
    {
        //TalentList = GameEntry.DataTable.DataTableManager.TalentDataDBModel.GetList();

        for (int i = 0; i < TestList.Count; i++)
        {
            // 初始化
            GameObject Go = Instantiate(m_Items);
            // 设置初始比例
            Go.transform.localScale = Vector3.one;
            // 父对象
            Go.transform.SetParent(Content);
            // 调用Items里面的SetItemData方法，将Items里的action设置为这里设置的SetLock
            
            // 这里i对应Item的index
            Go.GetComponent<Items>().SetItemUIData(SetLock,i, Content);

            if (i < 1)
            {
                // 对于第一个预制体，直接设置为显示状态，已经解锁
                Go.SetActive(true);
                Content.GetChild(0).GetChild(5).GetComponent<Image>().enabled = false;
                Content.GetChild(0).GetChild(5).GetChild(0).GetComponent<Text>().enabled = false;
            }
            else if ( i < 2 && i > 0)
            {
                Go.SetActive(true);
            }
            else
            {
                // 对于非第一个预制体，先设置为隐藏状态，后续根据条件决定是否显示
                Go.SetActive(false);
                // 设置UI元素数据

            }
        }
    }

    // 这里写的被action方法装下来执行，action就是升级的按钮
    private void SetLock(int num,int index)
    {
        int nextIndex = index + 1;
        int nextNextIndex = index + 2;
        // 对于第一个元素
        if (index == 0)
        {
            print(num);
            if (num == 3)
            {
                Content.GetChild(1).GetChild(5).GetComponent<Image>().enabled = false;
                Content.GetChild(1).GetChild(5).GetChild(0).GetComponent<Text>().enabled = false;
                Content.GetChild(2).GetComponent<Items>().gameObject.SetActive(true);
            }
        }
        else
        {
            // 获取前一个Items组件实例，这里假设Items所在的游戏对象都在Content下且顺序对应列表顺序
            if (nextIndex < Content.childCount) // 确保索引没有超出范围
            {
                Items nextItem = Content.GetChild(nextIndex).GetComponent<Items>(); 
                nextItem.gameObject.SetActive(true);
                if (num == 5)
                {
                    Content.GetChild(nextIndex).GetChild(5).GetComponent<Image>().enabled = false;
                    Content.GetChild(nextIndex).GetChild(5).GetChild(0).GetComponent<Text>().enabled = false;
                    if (nextNextIndex < Content.childCount)
                    {
                        Items nextNextItem = Content.GetChild(nextNextIndex).GetComponent<Items>();
                        nextNextItem.gameObject.SetActive(true);
                    }
                }

                print(num);   
            }  
        }
    }
    
    private void Start()
    {
        InitPanel();
    }
    void InitPanel()
    {

        for (int i = 0; i < btnArr.Length; i++)
        {
            EventTriggerListener.Get(btnArr[i]).onClick = BtnClick;
        }

    }

    private void BtnClick(GameObject go)
    {    
        // 将点击的按钮的名字变成枚举类型
        BtnType type = (BtnType)Enum.Parse(typeof(BtnType), go.name);
        switch (type)
        {
            // todo 具体效果

            //case BtnType.Save:
            //case BtnType.Reset:
            //    CommEvetData ced = new CommEvetData();
            //    ced.EventName = type == BtnType.Save ? "保存天赋" : "重置天赋";
            //    ced.EventContent = string.Format("{0}成功!", ced.EventName);
            //    GameEntry.Event.CommonEvent.Dispatch(SysEventId.Tip, ced);
            //    break;
            //case BtnType.Cancel:
            //    gameObject.SetActive(false);
            //    break;
        }
    }
}
```

