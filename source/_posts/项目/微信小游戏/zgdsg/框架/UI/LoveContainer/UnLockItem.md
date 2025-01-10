```C#
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class UnLockItem : MonoBehaviour
{
    //动态加载出来的父节点
    private Transform Content;

    private Action<int> action;
    // 该物品在列表的位置
    private int itemIndex;
    int value;

    private void Awake()
    {

        EventTriggerListener.Get(transform.GetChild(0).gameObject).onClick = btnUpClick;
    }

    // Start is called before the first frame update
    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {

    }

    //加载数据方面，父与子之间传东西的桥梁
    public void SetUnLockItemUIData(Action<int> setLock, Transform uiParent)
    {

        action = setLock;

        Content = uiParent;
    }

    // 根据游戏对象状态更新事件数据，并触发相应的提示事件。
    // 游戏效果的实现不在这里
    private void btnUpClick(GameObject go)
    {
        // 后置自增运算符 value++ 的特点是，它首先返回 value 当前的值，然后再对 value 自身进行加 1 的操作。
        value++;
        // 这里action用的东西都是这个脚本里的，itemIndex是从
        action(value);
    }
}
```