```C#
using System;
using System.Collections;
using System.Collections.Generic;

using Unity.VisualScripting;
using UnityEngine;
using UnityEngine.UI;

public class CenterContainerManager : MonoBehaviour
{
    // X下每升一级所需金钱的初始值，外部设定
    public List<long> TestListx1= new List<long>();
    // 每个武器的初始等级，外部设定
    public List<long> WeapolevelList = new List<long>();

    public List<long> LevelTestList = new List<long>();

    //public List<long> TestListx1Original = new List<long>(); // 原始状态，即 x1 状态的金钱数值
    public List<long> TestListx50 = new List<long>();       // x50 状态下的金钱数值
    public List<long> TestListx100 = new List<long>();      // x100 状态下的金钱数值


    [Header("总金钱数量")]
    [SerializeField]
    private Text MoneyTex;

    [Header("总金钱数量")]
    [SerializeField]
    private long Money;

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
        InitEquipPanelCallBack();
        MoneyTex.text = FormatNumber(Money).ToString();
        // GameEntry.Event.CommonEvent.AddEventListener(SysEventId.LoadDataTableComplete, InitTalentPanelCallBack);
        //gameObject.SetActive(false);
    } 

    // 实现动态加载，并且初始化一些按钮
    private void InitEquipPanelCallBack()
    {
        // 可能的获取数据的方式
        //TalentList = GameEntry.DataTable.DataTableManager.TalentDataDBModel.GetList();

        for (int i = 0; i < TestListx1.Count; i++)
        {
            LevelTestList.Add(1L);                 // 初始化升几级的状态
            //TestListx1Original.Add(TestListx1[i]); // 初始化原始状态列表
            TestListx50.Add(TestListx1[i]);        // 初始化 x50 状态列表
            TestListx100.Add(TestListx1[i]);       // 初始化 x100 状态列表

            // 实时计算更新每个列表
            UpdateStateList(i);

            // 动态加载
            GameObject Go = Instantiate(m_Items);
            // 设置初始比例
            Go.transform.localScale = Vector3.one;
            // 父对象
            Go.transform.SetParent(Content);
            // 调用Items里面的SetItemData方法，将Items里的action设置为这里设置的SetLock
            // 这里i对应Item的index
            Go.GetComponent<Items>().SetItemUIData(SetLock,i, Content);
            
            // 设置每个按钮的金币
            Content.GetChild(i).GetChild(1).GetChild(1).GetComponent<Text>().text = TestListx1[i].ToString();
            // 设置每个按钮的等级
            Content.GetChild(i).GetChild(1).GetChild(0).GetComponent<Text>().text ="升级+" + LevelTestList[i].ToString();
            // 设置每个武器的初始等级，这里暂时全部都是一个武器
            Content.GetChild(i).GetChild(3).GetComponent<Text>().text ="九环禅杖"+"Lv."+ WeapolevelList[i].ToString();

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

    // 更新玩家金币数的方法
    private void PlayerMoney(List<long> TestListx1, List<long> TestListx50, List<long> TestListx100,int index)
    {
        string doubleNun = btnArr[0].GetComponentInChildren<Text>().text;
        switch (doubleNun)
        {
            case "x1":
                Money -= TestListx1[index];
                break;
            case "x50":
                Money -= TestListx50[index];
                break;
            case "x100":
                Money -= TestListx100[index];
                break;
        }

        MoneyTex.text = FormatNumber(Money).ToString();
    }

    // 判断金钱数量是否够的方法
    private bool EnoughMoney(List<long> TestListx1, List<long> TestListx50, List<long> TestListx100, int index)
    {
        string doubleNun = btnArr[0].GetComponentInChildren<Text>().text;
        switch (doubleNun)
        {
            case "x1":
                if (Money < TestListx1[index])
                {
                    print("钱不够");
                    return false;
                }
                break;
            case "x50":
                if (Money < TestListx50[index])
                {
                    print("钱不够");
                    return false;
                }
                break;
            case "x100":
                if (Money < TestListx100[index])
                {
                    print("钱不够");
                    return false;
                }
                break;
        }
        return true;
    }




    // 这里写的被action方法装下来执行，action就是升级的按钮
    private void SetLock(int num,int index)
    {
        if (!EnoughMoney(TestListx1, TestListx50, TestListx100, index))
        {
            return; // 如果钱不够，直接结束SetLock方法执行，不再执行后续逻辑
        }

        int nextIndex = index + 1;
        int nextNextIndex = index + 2;

        WeapolevelList[index] = WeapolevelList[index] + LevelTestList[index];

        // 这里需要乘以每次升级的次数。自己迭代50或100次先
        // 升一级下一级的所需金钱数量随不断升级呈现2n-1
        for(int i = 0; i < LevelTestList[index];i++)
        {
            TestListx1[index] = TestListx1[index] + WeapolevelList[index] * 2 - 1;
        }

        PlayerMoney(TestListx1, TestListx50, TestListx100,index);



        // 点击一次实时计算更新对应索引的列表值
        UpdateStateList(index);

        // 更新显示
        string doubleNun = btnArr[0].GetComponentInChildren<Text>().text;
        switch (doubleNun)
        {
            case "x1":
                Content.GetChild(index).GetChild(1).GetChild(1).GetComponent<Text>().text = FormatNumber(TestListx1[index]).ToString();
                break;
            case "x50":
                Content.GetChild(index).GetChild(1).GetChild(1).GetComponent<Text>().text = FormatNumber(TestListx50[index]).ToString();
                break;
            case "x100":
                Content.GetChild(index).GetChild(1).GetChild(1).GetComponent<Text>().text = FormatNumber(TestListx100[index]).ToString();
                break;
        }


        // 对于第一个元素
        if (index == 0)
        {
            print("点击次数："+ num);
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
                print("点击次数：" + num);   
            }  
        }

        Content.GetChild(index).GetChild(3).GetComponent<Text>().text = "九环禅杖" + "Lv." + (WeapolevelList[index]).ToString();
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
    private int clickCount = 0;


    // 双倍花费按钮
    private void BtnClick(GameObject go)
    {
        //UpdateStateList(index);

        // 将点击的按钮的名字go.name变成枚举类型
        BtnType type = (BtnType)Enum.Parse(typeof(BtnType), go.name);
        switch (type)
        {
            // 双倍的按钮逻辑
            case BtnType.btnDouble:
                clickCount++;
                string buttonText = GetButtonText(clickCount % 3);

                btnArr[0].GetComponentInChildren<Text>().text = buttonText;

                UpdateUIForState(buttonText);

                break;
            case BtnType.btnMagicWeapon:
                break;
        }
    }

    // 跟新按切换按倍数钮钮上的显示内容
    private void UpdateUIForState(string state)
    {
        for (int i = 0; i < TestListx1.Count; i++)
        {
            long money;
            switch (state)
            {
                case "x1":
                    money = TestListx1[i];
                    LevelTestList[i] = 1;
                    break;
                case "x50":
                    money = TestListx50[i];
                    LevelTestList[i] = 50;
                    break;
                case "x100":
                    money = TestListx100[i];
                    LevelTestList[i] = 100;
                    break;
                default:
                    money = TestListx1[i];
                    LevelTestList[i] = 1;
                    break;
            }

            Content.GetChild(i).GetChild(1).GetChild(1).GetComponent<Text>().text = FormatNumber(money);
            Content.GetChild(i).GetChild(1).GetChild(0).GetComponent<Text>().text = "升级+" + LevelTestList[i].ToString();
        }
    }

    private string GetButtonText(int state)
    {
        switch (state)
        {
            case 0: return "x1";
            case 1: return "x50";
            case 2: return "x100";
            default: return "x1";
        }
    }


    //同步列表的值
    private void UpdateStateList(int index)
    {
                TestListx50[index] = CalculateTotalForLevel(TestListx1[index], 50);
                TestListx100[index] = CalculateTotalForLevel(TestListx1[index], 100);
        
    }

    // x50，x100计算总共有多少钱
    private long CalculateTotalForLevel(long baseMoney, int levels)
    {
        long totalMoney = 0;
        long currentMoney = baseMoney;
        for (int j = 0; j < levels; j++)
        {
            currentMoney = (long)(currentMoney + 2);
            totalMoney += currentMoney;
        }
        return totalMoney;
    }


    // 格式化数字的函数
    private string FormatNumber(long number)
    {
        if (number == long.MaxValue)
        {
            return "已满";
        }

        decimal num = (decimal)number;
        string unit = "";

        //if (num >= 100000000000000000000m) // 垓
        //{
        //    unit = "垓";
        //    num /= 100000000000000000000m;
        //}
        //else 
        if (num >= 10000000000000000m) // 京
        {
            unit = "京";
            num /= 10000000000000000m;
        }
        else if (num >= 1000000000000m) // 兆
        {
            unit = "兆";
            num /= 1000000000000m;
        }
        else if (num >= 100000000m) // 亿
        {
            unit = "亿";
            num /= 100000000m;
        }
        else if (num >= 10000m) // 万
        {
            unit = "万";
            num /= 10000m;
        }

        // 根据单位调整显示格式
        if ( unit == "京" || unit == "兆" || unit == "亿" || unit == "万")
        {
            //  Math.Round 来决定是否需要保留一位小数
            return Math.Round(num, 2) + unit;
        }
        else
        {
            return number.ToString();
        }
    }
}
```

