```C#
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.UI;

public enum PanelType
{
    EquipmentPanel,
    LovePanel,
    ArrayPanel,
    MagicWeaponPanel
}


public class GamePanel : MonoBehaviour
{
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
    //[SerializeField]
    //private Sprite[] BtnSprite;
    [Header("金币数")]
    [SerializeField]
    private Text GoldValue;
    private GameObject CurrActivePanel;
    [Header("初始页面")]
    [SerializeField]
    private GameObject InitialActivePanel;

    private void Awake()
    {
        TransInit();
    }

    // 找到面板物品，初步设置按钮对应效果
    void TransInit()
    {
        int count = PanelList.Count;
        for (int i = 0; count > i; i++)
        {
            // 将所有面板加入字典中
            if (!PanelDic.ContainsKey(PanelList[i].name))
                PanelDic[PanelList[i].name] = PanelList[i];
        }

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
            // 设置情缘按钮点击跳转
            //EventTriggerListener.Get(m_StartLoveBattle.gameObject).onClick = StartGameLoveBtnCtrl;
            // 设置阵法按钮点击后跳转
            //EventTriggerListener.Get(m_StartArrayBattle.gameObject).onClick = StartGameArrayBtnCtrl;
            // 设置法宝按钮点击后跳转
            //EventTriggerListener.Get(m_StartMagicWeaponBattle.gameObject).onClick = StartGameMagicWeaponBtnCtrl;
        }
    }

    #region 如果是换场景这样写
    //private void StartGameLoveBtnCtrl(GameObject go)
    //{
    //    LoadSceneManager.Instance.LoadScene("LoveScene");
    //}
    //private void StartGameArrayBtnCtrl(GameObject go)
    //{
    //    LoadSceneManager.Instance.LoadScene("CombatScene");
    //}
    //private void StartGameMagicWeaponBtnCtrl(GameObject go)
    //{
    //    LoadSceneManager.Instance.LoadScene("CombatScene");
    //}
    #endregion

    private void SendDataCallBack(HttpCallBackArgs args)
    {
        print(args.HasError);
        print(args.ToString());
        print(args.Value);
    }

    public void BtnCtrl(GameObject go)
    {
        //为什么这里命名需要一致，因为go.name是传进来的PanelAr[j].gameObject的名字
        if (PanelDic.ContainsKey(go.name))
        {
            GameObject panel = PanelDic[go.name];
            // 判断是否是初始显示的页面且当前处于激活状态，若是则隐藏它，并将当前激活页面置为null
            if (panel == InitialActivePanel)
            {
                if(CurrActivePanel != null)
                {                
                    CurrActivePanel.SetActive(false);

                }

            }
            else
            {
                // 如果当前点击的按钮对应的页面不是激活状态，则激活它，并关闭当前已激活的其他页面（如果有的话）
                if (!panel.activeSelf)
                {
                    // 如果当前有已激活的页面，先关闭它
                    if (CurrActivePanel != null)
                    {
                        CurrActivePanel.SetActive(false);
                    }
                    panel.SetActive(true);
                    CurrActivePanel = panel;
                }
            }
        }
    }
}
```

这里UI里面拼的时候需要注意命名和字典里面的每个键名一一对应，为什么这里命名需要一致，因为go.name是传进来的PanelAr[j].gameObject的名字