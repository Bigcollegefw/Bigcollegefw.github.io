```c#
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DataTableComponent : MyBaseComponent
{
    /// <summary>
    /// 数据表格管理器
    /// </summary>
    public DataTableManager DataTableManager { get; private set; }


    protected override void OnAwake()
    {
        base.OnAwake();
        DataTableManager = new DataTableManager();
    }
    /// <summary>
    /// 异步加载表格
    /// </summary>
    public void LoadDataTableAsync()
    {
        DataTableManager.LoadDataTableAsync();
    }

    public override void ShutDown()
    {
        DataTableManager.Clear();
    }

    // Start is called before the first frame update
    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {

    }


}

```