```C#
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class IncreasePanel : MonoBehaviour
{

    [Header("需要绑定事件的按钮")]
    [SerializeField]
    private GameObject[] btnArr;

    private void Awake()
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
        this.gameObject.SetActive(false);   
    }
}

```