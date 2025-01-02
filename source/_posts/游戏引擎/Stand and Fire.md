```C#
using UnityEngine;

// 假设这是一个基于状态机模式的玩家状态抽象基类，不同的玩家状态类继承自它来实现各自具体的逻辑
public abstract class PlayerStateBase
{
    protected PlayerController playerController;
    public PlayerStateBase(PlayerController controller)
    {
        playerController = controller;
    }

    public abstract void OnEnter();
    public abstract void OnExit();
    public abstract void OnUpdate();
}

// 玩家站立射击状态类，继承自PlayerStateBase，实现站立射击状态下的具体行为逻辑
public class Player_StandAndFireState : PlayerStateBase
{
    private float standToWalkBlendWeight = 0f; // 用于站立到行走动画融合的权重
    private float standToWalkTransitionTime = 0.5f; // 站立到行走动画的过渡时间
    private float timeSinceLastTransition = 0f; // 自上次状态转换后的时间

    public Player_StandAndFireState(PlayerController controller) : base(controller)
    {
    }

    public override void OnEnter()
    {
        base.OnEnter();
        // 绑定根运动，将根运动的回调函数OnRootMotion注册到对应的模型基础组件中（这里假设ModelBase有这样的注册方法）
        playerController.ModelBase.SetRootMotionAction(OnRootMotion);
        // 播放站立射击动画，通过设置Animator中的布尔参数来触发对应的动画播放（假设Animator中有对应的动画状态设置逻辑）
        playerController.ModelBase.Animator.SetBool("StandAndFire", true);
    }

    public override void OnExit()
    {
        base.OnExit();
        // 取消根运动，移除之前注册的根运动回调函数
        playerController.ModelBase.ClearRootMotionAction();
    }

    public override void OnUpdate()
    {
        base.OnUpdate();

        // 判断玩家与目标点距离是否小于0.5f，如果是则切换到空闲状态
        if (Vector3.Distance(playerController.targetPoint, playerController.CharacterController.transform.position) < 0.5f)
        {
            playerController.ChangeState(PlayerState.Idle);
            return;
        }

        // 判断玩家与目标点距离是否大于等于0.5f，并且与敌人距离小于等于攻击范围，则切换到行走射击状态
        if (Vector3.Distance(playerController.targetPoint, playerController.CharacterController.transform.position) >= 0.5f)
        {
            if (PlayerController.ToEnemyDis <= playerController.attackRange)
            {
                // 开始向行走射击状态转换，设置相关动画融合参数
                StartTransition(PlayerState.WalkAndFire, standToWalkTransitionTime);
                return;
            }
            // 如果与敌人距离大于攻击范围，则切换到行走状态
            playerController.ChangeState(PlayerState.Walk);
            return;
        }

        // 如果与敌人距离不是 -1（这里 -1可能表示未检测到敌人距离等特殊情况），则让玩家模型朝向目标方向
        if (PlayerController.ToEnemyDis!= -1f)
        {
            // 计算朝向目标的旋转方向，通过LookRotation方法根据目标向量得到对应的四元数旋转
            playerController.ModelBase.transform.rotation = Quaternion.LookRotation(PlayerController.LookAtVector3);
        }

        // 获取水平和垂直输入轴的值，用于判断玩家是否有移动操作意图
        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");

        // 如果水平或垂直输入轴有值，即玩家产生了位移操作，则切换到移动射击状态
        if (h!= 0 || v!= 0)
        {
            playerController.ChangeState(PlayerState.WalkAndFire);
            return;
        }

        // 如果玩家处于奔跑状态并且swipeVector（这里假设是某种滑动向量，用于判断操作方向等情况）不为零向量
        if (playerController.isRun && swipeVector!= Vector2.zero)
        {
            // 同时与敌人距离小于等于攻击范围且不是 -1（表示有效距离情况），则关闭站立射击动画并切换到行走射击状态
            if (PlayerController.ToEnemyDis <= playerController.attackRange && PlayerController.ToEnemyDis!= -1)
            {
                // 开始向行走射击状态转换，设置相关动画融合参数
                StartTransition(PlayerState.WalkAndFire, standToWalkTransitionTime);
                return;
            }
            // 如果与敌人距离不符合上述条件，则关闭站立射击动画并切换到行走状态
            playerController.ModelBase.Animator.SetBool("StandAndFire", false);
            playerController.ChangeState(PlayerState.Walk);
            return;
        }

        // 如果动画播放完毕（通过检查动画状态名称以及标准化时间判断，标准化时间大于等于0.7表示接近播放完），则切换到空闲状态
        if (playerController.CheckAnimatorStateName("StandAndFire", out float normalizedTime) && normalizedTime >= 0.7f)
        {
            playerController.ModelBase.Animator.SetBool("StandAndFire", false);
            playerController.ChangeState(PlayerState.Idle);
            return;
        }

        // 根据当前状态转换情况更新动画融合权重
        UpdateAnimationBlend();
    }

    /// <summary>
    /// 开始状态转换并初始化相关的动画融合参数
    /// </summary>
    /// <param name="targetState">目标状态</param>
    /// <param name="transitionTime">过渡时间</param>
    private void StartTransition(PlayerState targetState, float transitionTime)
    {
        timeSinceLastTransition = 0f;
        switch (targetState)
        {
            case PlayerState.WalkAndFire:
                // 针对向行走射击状态转换，设置相应的过渡时间等参数（可根据实际需求调整）
                standToWalkBlendWeight = 0f;
                standToWalkTransitionTime = transitionTime;
                break;
            // 可以添加更多针对其他目标状态的过渡情况处理
        }
        playerController.ChangeState(targetState);
    }

    /// <summary>
    /// 根据时间更新动画融合权重，实现动画融合效果
    /// </summary>
    private void UpdateAnimationBlend()
    {
        switch (playerController.CurrentState)
        {
            case PlayerState.StandAndFire:
                // 如果当前还是站立射击状态，不做融合相关处理（可根据实际需求添加待机动作融合等情况）
                break;
            case PlayerState.WalkAndFire:
                if (timeSinceLastTransition < standToWalkTransitionTime)
                {
                    // 计算从站立射击到行走射击的动画融合权重，基于时间占比
                    standToWalkBlendWeight = timeSinceLastTransition / standToWalkTransitionTime;
                    playerController.ModelBase.Animator.SetFloat("StandWalkFireBlend", standToWalkBlendWeight);
                }
                else if (timeSinceLastTransition >= standToWalkTransitionTime)
                {
                    playerController.ModelBase.Animator.SetFloat("StandWalkFireBlend", 1f);
                }
                break;
            // 可以添加更多针对其他状态转换的动画融合权重计算及设置逻辑
        }
    }

    /// <summary>
    /// 该状态下的根运动处理方法，在根运动发生时被调用，用于处理角色位置移动等相关逻辑
    /// </summary>
    /// <param name="deltaPositi  private void UpdateAnimationBlend()
    {
        switch (playerController.CurrentState)
        {
            case PlayerState.StandAndFire:
                // 如果当前还是站立射击状态，不做融合相关处理（可根据实际需求添加待机动作融合等情况）
                break;
            case PlayerState.WalkAndFire:
                if (timeSinceLastTransition < standToWalkTransitionTime)
                {
                    // 计算从站立射击到行走射击的动画融合权重，基于时间占比
                    standToWalkBlendWeight = timeSinceLastTransition / standToWalkTransitionTime;
                    playerController.ModelBase.Animator.SetFloat("StandWalkFireBlend", standToWalkBlendWeight);
                }
                else if (timeSinceLastTransition >= standToWalkTransitionTime)
                {
                    playerController.ModelBase.Animator.SetFloat("StandWalkFireBlend", 1f);
                }
                break;
            // 可以添加更多针对其他状态转换的动画融合权重计算及设置逻辑
        }
    }
on">根运动产生的位置变化量</param>
    /// <param name="deltaRotation">根运动产生的旋转变化量</param>
    private void OnRootMotion(Vector3 deltaPosition, Quaternion deltaRotation)
    {
        // 考虑重力对根运动在垂直方向的影响，将重力因素添加到位置变化量的y轴上（乘以每帧时间间隔以保证物理效果的帧同步）
        deltaPosition.y = PlayerController.gravity * Time.deltaTime;
        // 通过角色控制器来移动角色，应用根运动产生的位置变化量
        playerController.CharacterController.Move(deltaPosition);
    }
}
```