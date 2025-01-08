```C#
using System;
using System.Collections;
using System.Collections.Generic;

using UnityEngine;

public class TimeAction
{
    /// <summary>
    /// 定时器是否运行中
    /// </summary>
    public bool IsRuning { get; private set; }
    /// <summary>
    /// 当前运行的时间
    /// </summary>
    private float m_CurrRunTime;
    /// <summary>
    /// 当前循环次数
    /// </summary>
    private int m_CurrLoop;

    /// <summary>
    /// 延迟时间
    /// </summary>
    private float m_DelayTime;
    /// <summary>
    /// 间隔(秒)
    /// </summary>
    private float m_InterVal;
    /// <summary>
    /// 循环次数
    /// -1表示无限循环
    /// 0也会循环一次
    /// </summary>
    private int m_Loop;

    /// <summary>
    /// 开始运行
    /// </summary>
    private Action m_OnStar;
    /// <summary>
    /// 运行中
    /// 回调参数：表示剩余次数
    /// </summary>
    private Action<int> m_OnUpdate;
    /// <summary>
    /// 运行完毕
    /// </summary>
    private Action m_OnComplete;
    /// <summary>
    /// 
    /// </summary>
    /// <param name="isRuning"></param>
    /// <param name="currRunTime"></param>
    /// <param name="currLoop"></param>
    /// <param name="delayTime"></param>
    /// <param name="interVal"></param>
    /// <param name="loop"></param>
    /// <param name="onStar"></param>
    /// <param name="onUpdate"></param>
    /// <param name="onComplete"></param>
    public TimeAction Init(float delayTime, float interVal, int loop, Action onStar, Action<int> onUpdate, Action onComplete)
    {
        m_DelayTime = delayTime;
        m_InterVal = interVal;
        m_Loop = loop;
        m_OnStar = onStar;
        m_OnUpdate = onUpdate;
        m_OnComplete = onComplete;
        return this;
    }
    /// <summary>
    /// 开始运行
    /// </summary>
    public void Run()
    {

        GameEntry.Time.RegisterTimeAction(this);
        m_CurrRunTime = Time.time;
    }
    /// <summary>
    /// 暂停计时器
    /// </summary>
    public void Pause()
    {
        IsRuning = false;
    }

    /// <summary>
    /// 停止计时器
    /// </summary>
    public void Stop(bool IsOnEnd)
    {
        if (IsOnEnd)
            m_OnComplete?.Invoke();
        IsRuning = false;
        m_CurrLoop = 0;
        GameEntry.Time.RemoveTimeAction(this);
    }
    /// <summary>
    /// 每帧执行
    /// </summary>
    public void OnUpdate()
    {
        if (!IsRuning && Time.time > m_CurrRunTime + m_DelayTime)
        {
            IsRuning = true;
            m_CurrRunTime = Time.time;
            m_OnStar?.Invoke();
        }
        if (!IsRuning) return;
        if (Time.time > m_CurrRunTime)
        {
            m_CurrRunTime = Time.time + m_InterVal;
            m_OnUpdate?.Invoke(m_Loop - m_CurrLoop);
            if (m_Loop > -1)
            {
                m_CurrLoop++;
                if (m_CurrLoop >= m_Loop) Stop(true);
            }

        }
    }
}

```